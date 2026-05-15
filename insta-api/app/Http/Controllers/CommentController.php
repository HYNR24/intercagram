<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;

class CommentController extends Controller
{
    public function index(Request $request, Post $post)
    {
        $userId = $request->user()->id;
        return $post->comments()
            ->with('user.profile')
            ->withCount('likes')
            ->with(['likes' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            }])
            ->latest()
            ->get()
            ->map(function ($comment) {
                $comment->liked_by_me = $comment->likes->isNotEmpty();
                unset($comment->likes);
                return $comment;
            });
    }
    
    public function store(Request $request, Post $post)
    {
        $data = $request->validate([
            'content' => 'required|string'
        ]);

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'post_id' => $post->id,
            'content' => $data['content'],
        ]);

        if ($post->user_id !== $request->user()->id) {
            Notification::create([
                'user_id' => $post->user_id,
                'type' => 'comment',
                'data' => [
                    'username' => $request->user()->profile->username ?? $request->user()->name,
                    'post_id' => $post->id,
                ],
            ]);
        }

        return $comment->load('user.profile');
    }
}
