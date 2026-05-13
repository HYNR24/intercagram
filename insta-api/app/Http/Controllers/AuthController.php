<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Profile;
use App\Models\Friendship;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required',
            'username' => 'required|unique:profiles,username'
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // si por alguna razón no se creó:
        if (! $user || ! $user->id) {
            Log::error('No se pudo crear el usuario', ['data' => $data]);
            return response()->json(['message' => 'No se pudo crear el usuario'], 500);
        }

        Profile::create([
            'user_id' => $user->id,
            'username' => $data['username']
        ]);

        $token = $user->createToken('mobile')->plainTextToken;

       return response()->json([
            'user'  => $user->load('profile'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'=>'required|email',
            'password'=>'required'
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message'=>'Credenciales inválidas'], 401);
        }

        $token = $user->createToken('mobile')->plainTextToken;
        return response()->json(['user'=>$user,'token'=>$token]);
    }

    public function me(Request $request)
    {
        return $request->user()->load('profile');
    }

    public function search(Request $request)
    {
        $query = $request->query('q', '');
        $userId = $request->user()->id;

        $users = User::whereHas('profile', function ($q) use ($query) {
            $q->where('username', 'like', "%{$query}%");
        })->with('profile')->limit(10)->get();

        $friendIds = Friendship::where(function ($q) use ($userId) {
            $q->where('user_id', $userId)->orWhere('friend_id', $userId);
        })->get()->keyBy(function ($f) use ($userId) {
            return $f->user_id === $userId ? $f->friend_id : $f->user_id;
        });

        return $users->map(function ($user) use ($friendIds, $userId) {
            if ($user->id === $userId) {
                $user->friendship_status = 'self';
            } elseif ($friendIds->has($user->id)) {
                $f = $friendIds->get($user->id);
                $user->friendship_status = $f->status === 'accepted' ? 'accepted' : 'pending';
                $user->friendship_id = $f->id;
            } else {
                $user->friendship_status = 'none';
            }
            return $user;
        });
    }
}
