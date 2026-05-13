<?php
echo "=== REGISTER ===\n";
$ch = curl_init('http://127.0.0.1:8000/api/register');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode([
        'name' => 'Test User',
        'email' => 'testuser@test.com',
        'password' => '123456',
        'username' => 'testuser'
    ])
]);
$res = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "HTTP: $http\n";
echo "Response: $res\n";
curl_close($ch);

echo "\n=== LOGIN ===\n";
$ch = curl_init('http://127.0.0.1:8000/api/login');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode([
        'email' => 'testuser@test.com',
        'password' => '123456'
    ])
]);
$res = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "HTTP: $http\n";
echo "Response: $res\n";
curl_close($ch);
