<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Like;
use App\Models\Notification;
use App\Models\Post;

class LikeController extends Controller
{
    public function like(Post $post, Request $request)
    {
        $userId = $request->user()->id;
        $like = Like::where('user_id', $userId)
            ->where('post_id', $post->id)
            ->first();

        if ($like) {
            $like->delete();
            $liked = false;
        } else {
            Like::create(['user_id' => $userId, 'post_id' => $post->id]);

            if ($post->user_id !== $userId) {
                Notification::create([
                    'user_id' => $post->user_id,
                    'type' => 'like',
                    'data' => [
                        'username' => $request->user()->profile->username ?? $request->user()->name,
                        'post_id' => $post->id,
                    ],
                ]);
            }
            $liked = true;
        }

        return response()->json([
            'liked' => $liked,
            'likes_count' => $post->likes()->count(),
        ]);
    }

    public function unlike(Post $post, Request $request)
    {
        Like::where('user_id', $request->user()->id)
            ->where('post_id', $post->id)
            ->delete();

        return response()->json(['liked'=>false]);
    }
}
