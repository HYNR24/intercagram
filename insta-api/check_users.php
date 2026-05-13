<?php
$users = User::all();
foreach ($users as $user) {
    echo json_encode(['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'pw_len' => strlen($user->password)]) . "\n";
}
