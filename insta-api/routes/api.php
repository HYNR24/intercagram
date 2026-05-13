<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\CommentLikeController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\FriendshipController;

Route::get('/', function () {
    return response()->json([
        'app' => 'Intercagram API',
        'version' => '1.0.0',
        'status' => 'online',
        'documentacion' => 'Documentación API.pdf',
        'endpoints' => [
            'autenticacion' => [
                'POST /api/register' => 'Registro de usuario',
                'POST /api/login'    => 'Inicio de sesión',
                'POST /api/logout'   => 'Cerrar sesión (token requerido)',
                'GET /api/me'        => 'Perfil del usuario autenticado (token requerido)',
            ],
            'posts' => [
                'GET /api/posts'             => 'Listar publicaciones (token requerido)',
                'POST /api/posts'            => 'Crear publicación (token requerido)',
                'GET /api/posts/{id}'        => 'Ver publicación (token requerido)',
                'DELETE /api/posts/{id}'     => 'Eliminar publicación (token requerido)',
                'POST /api/posts/{id}/like'  => 'Dar like (token requerido)',
                'DELETE /api/posts/{id}/like'=> 'Quitar like (token requerido)',
            ],
            'comentarios' => [
                'GET /api/posts/{id}/comments'       => 'Ver comentarios (token requerido)',
                'POST /api/posts/{id}/comments'      => 'Comentar (token requerido)',
                'POST /api/comments/{id}/like'       => 'Dar like a comentario (token requerido)',
                'DELETE /api/comments/{id}/like'      => 'Quitar like a comentario (token requerido)',
            ],
            'amistades' => [
                'GET /api/friends'                   => 'Listar amigos (token requerido)',
                'POST /api/users/{username}/friend'  => 'Enviar solicitud (token requerido)',
                'DELETE /api/users/{username}/friend'=> 'Eliminar amigo (token requerido)',
                'DELETE /api/users/{username}/friend/cancel' => 'Cancelar solicitud (token requerido)',
                'POST /api/friendships/{id}/accept' => 'Aceptar solicitud (token requerido)',
                'GET /api/friendships/pending'   => 'Solicitudes pendientes (token requerido)',
                'GET /api/users/suggested'       => 'Usuarios sugeridos (token requerido)',
            ],
            'usuarios' => [
                'GET /api/users/search?q='      => 'Buscar usuarios (token requerido)',
                'GET /api/users/{username}/posts'=> 'Publicaciones de usuario (token requerido)',
            ],
        ],
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

    // comment likes
    Route::post('/comments/{comment}/like', [CommentLikeController::class, 'like']);
    Route::delete('/comments/{comment}/like', [CommentLikeController::class, 'unlike']);

    // friendships
    Route::post('/users/{username}/friend', [FriendshipController::class, 'send']);
    Route::delete('/users/{username}/friend', [FriendshipController::class, 'remove']);
    Route::delete('/users/{username}/friend/cancel', [FriendshipController::class, 'cancel']);
    Route::get('/friends', [FriendshipController::class, 'myFriends']);
    Route::post('/friendships/{friendship}/accept', [FriendshipController::class, 'accept']);
    Route::get('/friendships/pending', [FriendshipController::class, 'pending']);
    Route::get('/users/suggested', [FriendshipController::class, 'suggested']);
});

Route::middleware('auth:sanctum')->post('/logout', function (\Illuminate\Http\Request $request) {
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'ok']);
});
