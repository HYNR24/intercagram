<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        $data = $request->validate([
            'bio' => 'nullable|string|max:500',
            'website' => 'nullable|string|max:255',
        ]);

        $profile->update($data);

        return response()->json([
            'user' => $user->load('profile'),
            'message' => 'Perfil actualizado',
        ]);
    }

    public function updateAvatar(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        $request->validate([
            'avatar' => 'required|file|mimes:jpg,jpeg,png,gif,webp,bmp,tiff,heic,heif|max:20480',
        ]);

        $file = $request->file('avatar');
        $path = $file->store('avatars', 'public');
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

        if ($profile->avatar && $profile->avatar !== $path) {
            Storage::disk('public')->delete($profile->avatar);
        }

        $profile->update(['avatar' => $path]);

        return response()->json([
            'user' => $user->load('profile'),
            'message' => 'Avatar actualizado',
        ]);
    }
}
