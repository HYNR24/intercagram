<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;

class MessagesController extends Controller
{
    public function conversations(Request $request)
    {
        $userId = $request->user()->id;

        $conversations = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->get()
            ->groupBy(function ($msg) use ($userId) {
                return $msg->sender_id === $userId ? $msg->receiver_id : $msg->sender_id;
            })
            ->map(function ($messages) use ($userId) {
                $otherUserId = $messages->first()->sender_id === $userId
                    ? $messages->first()->receiver_id
                    : $messages->first()->sender_id;

                $lastMsg = $messages->sortByDesc('created_at')->first();
                $unread = $messages->where('receiver_id', $userId)->whereNull('read_at')->count();
                $user = User::with('profile')->find($otherUserId);

                return [
                    'user' => $user,
                    'last_message' => $lastMsg,
                    'unread' => $unread,
                ];
            })
            ->sortByDesc(function ($conv) {
                return $conv['last_message']->created_at;
            })
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
