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

        $posts = Post::with(['user.profile', 'likes', 'comments.user.profile'])
            ->whereIn('user_id', $friendIds)
            ->latest()
            ->paginate(20);

        $posts->each(function ($post) use ($userId) {
            $post->liked_by_me = $post->likes->contains('user_id', $userId);
        });

        return $posts;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'image' => 'required|file|mimes:jpg,jpeg,png,gif,webp,bmp,tiff,heic,heif|max:20480',
            'caption' => 'nullable|string'
        ]);

        $file = $request->file('image');
        $path = $file->store('posts', 'public');
        $fullPath = storage_path('app/public/' . $path);

        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if (in_array($ext, ['heic', 'heif'])) {
            $newPath = str_replace('.' . $ext, '.jpg', $path);
            $newFullPath = storage_path('app/public/' . $newPath);
            exec('heif-convert ' . escapeshellarg($fullPath) . ' ' . escapeshellarg($newFullPath) . ' 2>&1', $output, $exitCode);
            if ($exitCode === 0 && file_exists($newFullPath)) {
                unlink($fullPath);
                $path = $newPath;
            }
        }

        $post = Post::create([
            'user_id' => $request->user()->id,
            'image' => $path,
            'caption' => $data['caption'] ?? null,
        ]);

        return $post->load('user.profile');
    }

    public function show(Post $post)
    {
        $post->load(['user.profile','comments.user.profile','likes']);
        $post->liked_by_me = $post->likes->contains('user_id', request()->user()->id);
        return $post;
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
