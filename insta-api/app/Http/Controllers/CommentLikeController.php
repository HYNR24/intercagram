<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CommentLike;
use App\Models\Comment;
use App\Models\Notification;

class CommentLikeController extends Controller
{
    public function like(Comment $comment, Request $request)
    {
        $like = CommentLike::firstOrCreate([
            'user_id' => $request->user()->id,
            'comment_id' => $comment->id,
        ]);

        if ($like->wasRecentlyCreated && $comment->user_id !== $request->user()->id) {
            Notification::create([
                'user_id' => $comment->user_id,
                'type' => 'comment_like',
                'data' => [
                    'username' => $request->user()->profile->username ?? $request->user()->name,
                    'comment_id' => $comment->id,
                    'post_id' => $comment->post_id,
                ],
            ]);
        }

        return response()->json(['liked' => true]);
    }

    public function unlike(Comment $comment, Request $request)
    {
        CommentLike::where('user_id', $request->user()->id)
            ->where('comment_id', $comment->id)
            ->delete();

        return response()->json(['liked' => false]);
    }
}
