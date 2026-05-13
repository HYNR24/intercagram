<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Friendship;
use App\Models\User;
use App\Models\Profile;

class FriendshipController extends Controller
{
     public function send(Request $request, $username)
{
    $profile = Profile::where('username', $username)->first();

    if (!$profile) {
        return response()->json([
            'message' => 'Usuario no encontrado'
        ], 404);
    }

    $user = $profile->user;

    if ($user->id == $request->user()->id) {
        return response()->json([
            'message'=>'No puedes agregarte'
        ], 400);
    }

    $friendship = Friendship::firstOrCreate([
        'user_id' => $request->user()->id,
        'friend_id' => $user->id,
    ], [
        'status' => 'pending'
    ]);

    return $friendship;
}

    public function accept(Request $request, Friendship $friendship)
    {
        // solo el receptor puede aceptar
        if ($friendship->friend_id !== $request->user()->id) {
            return response()->json(['message'=>'No autorizado'], 403);
        }

        $friendship->update(['status'=>'accepted']);

        return $friendship;
    }

    public function myFriends(Request $request)
    {
        return $request->user()->friends;
    }

    public function pending(Request $request)
    {
        return \App\Models\Friendship::with('user.profile')
            ->where('friend_id', $request->user()->id)
            ->where('status', 'pending')
            ->get();
    }

    public function suggested(Request $request)
    {
        $userId = $request->user()->id;

        $friendIds = Friendship::where(function ($q) use ($userId) {
            $q->where('user_id', $userId)->orWhere('friend_id', $userId);
        })->get()->map(function ($f) use ($userId) {
            return $f->user_id === $userId ? $f->friend_id : $f->user_id;
        })->push($userId);

        return User::with('profile')
            ->whereNotIn('id', $friendIds)
            ->limit(10)
            ->get();
    }

    public function cancel(Request $request, $username)
    {
        $profile = Profile::where('username', $username)->first();

        if (!$profile) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $friend = $profile->user;

        Friendship::where('user_id', $request->user()->id)
            ->where('friend_id', $friend->id)
            ->where('status', 'pending')
            ->delete();

        return response()->json(['message' => 'Solicitud cancelada']);
    }

    public function remove(Request $request, $username)
    {
        $profile = Profile::where('username', $username)->first();

        if (!$profile) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $friend = $profile->user;

        Friendship::where(function ($q) use ($request, $friend) {
            $q->where('user_id', $request->user()->id)
              ->where('friend_id', $friend->id);
        })->orWhere(function ($q) use ($request, $friend) {
            $q->where('user_id', $friend->id)
              ->where('friend_id', $request->user()->id);
        })->delete();

        return response()->json(['message' => 'Amigo eliminado']);
    }
}
