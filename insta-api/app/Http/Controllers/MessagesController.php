<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Models\Profile;
use App\Models\Notification;
use Illuminate\Http\Request;

class MessagesController extends Controller
{
    public function conversations(Request $request)
    {
        $userId = $request->user()->id;

        $messages = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->latest('created_at')
            ->take(200)
            ->get(['sender_id', 'receiver_id', 'content', 'read_at', 'created_at']);

        $grouped = $messages->groupBy(function ($msg) use ($userId) {
            return $msg->sender_id === $userId ? $msg->receiver_id : $msg->sender_id;
        });

        $userIds = $grouped->keys();
        $users = User::with('profile')->whereIn('id', $userIds)->get()->keyBy('id');

        $conversations = $grouped->map(function ($msgs, $otherUserId) use ($userId, $users) {
            $lastMsg = $msgs->sortByDesc('created_at')->first();
            $unread = $msgs->where('receiver_id', $userId)->whereNull('read_at')->count();

            return [
                'user' => $users->get($otherUserId),
                'last_message' => $lastMsg,
                'unread' => $unread,
            ];
        })
        ->sortByDesc(fn($conv) => $conv['last_message']->created_at)
        ->values();

        return response()->json($conversations);
    }

    public function messages(Request $request, $username)
    {
        $userId = $request->user()->id;
        $otherUser = Profile::where('username', $username)->first()?->user;

        if (!$otherUser) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $messages = Message::where(function ($q) use ($userId, $otherUser) {
            $q->where('sender_id', $userId)->where('receiver_id', $otherUser->id);
        })->orWhere(function ($q) use ($userId, $otherUser) {
            $q->where('sender_id', $otherUser->id)->where('receiver_id', $userId);
        })->with('sender.profile', 'receiver.profile')
          ->orderBy('created_at', 'asc')
          ->get();

        Message::where('sender_id', $otherUser->id)
            ->where('receiver_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json($messages);
    }

    public function send(Request $request, $username)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $userId = $request->user()->id;
        $otherUser = Profile::where('username', $username)->first()?->user;

        if (!$otherUser) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        if ($otherUser->id === $userId) {
            return response()->json(['message' => 'No puedes enviarte mensajes a ti mismo'], 400);
        }

        $message = Message::create([
            'sender_id' => $userId,
            'receiver_id' => $otherUser->id,
            'content' => $request->content,
        ]);

        return response()->json($message->load('sender.profile', 'receiver.profile'), 201);
    }
}
