<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;
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

        return $comment->load('user.profile');
    }
}
