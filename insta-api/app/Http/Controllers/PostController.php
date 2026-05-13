<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Profile;
use App\Models\Friendship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
     public function index(Request $request)
    {
        $userId = $request->user()->id;

        $friendIds = Friendship::where(function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->orWhere('friend_id', $userId);
        })
        ->where('status', 'accepted')
        ->get()
        ->map(function ($f) use ($userId) {
            return $f->user_id === $userId ? $f->friend_id : $f->user_id;
        })
        ->push($userId);

        return Post::with(['user.profile', 'likes', 'comments.user.profile'])
            ->whereIn('user_id', $friendIds)
            ->latest()
            ->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'image' => 'required|image|max:2048',
            'caption' => 'nullable|string'
        ]);

        $path = $request->file('image')->store('posts', 'public');

        $post = Post::create([
            'user_id' => $request->user()->id,
            'image' => $path,
            'caption' => $data['caption'] ?? null,
        ]);

        return $post->load('user.profile');
    }

    public function show(Post $post)
    {
        return $post->load(['user.profile','comments.user.profile','likes']);
    }

    public function destroy(Post $post, Request $request)
    {
        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message'=>'No autorizado'], 403);
        }

        Storage::disk('public')->delete($post->image);
        $post->delete();
        return response()->json(['message'=>'Eliminado']);
    }

    public function userPosts($username)
    {
        $profile = Profile::where('username', $username)->firstOrFail();
        $user = $profile->user;

        return Post::with(['user.profile', 'likes', 'comments.user.profile'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();
    }
}
