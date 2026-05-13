<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\FriendshipController;

Route::get('/', function () {
    return response()->json([
        'message' => 'Intercagram API funcionando',
        'version' => '1.0.0',
        'status' => 'online'
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/users/search', [AuthController::class, 'search']);
    Route::get('/users/{username}/posts', [PostController::class, 'userPosts']);

    // posts
    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/posts/{post}', [PostController::class, 'show']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);

    // comments
    Route::get('/posts/{post}/comments', [CommentController::class, 'index']);
    Route::post('/posts/{post}/comments', [CommentController::class, 'store']);

    // likes
    Route::post('/posts/{post}/like', [LikeController::class, 'like']);
    Route::delete('/posts/{post}/like', [LikeController::class, 'unlike']);

    // friendships
    Route::post('/users/{username}/friend', [FriendshipController::class, 'send']);
    Route::delete('/users/{username}/friend', [FriendshipController::class, 'remove']);
    Route::get('/friends', [FriendshipController::class, 'myFriends']);
    Route::post('/friendships/{friendship}/accept', [FriendshipController::class, 'accept']);
    Route::get('/friendships/pending', [FriendshipController::class, 'pending']);
    Route::get('/users/suggested', [FriendshipController::class, 'suggested']);
});

Route::middleware('auth:sanctum')->post('/logout', function (\Illuminate\Http\Request $request) {
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'ok']);
});
