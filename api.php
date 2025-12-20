<?php
/**
 * Public Note API
 * 
 * GET ?id=<hash> - Şifreli notu getir
 * POST { id, content } - Şifreli notu kaydet
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONS request için
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Notların saklanacağı klasör
$notesDir = __DIR__ . '/notes';

// Klasör yoksa oluştur
if (!is_dir($notesDir)) {
    mkdir($notesDir, 0755, true);
}

// Güvenlik: Sadece geçerli hash formatını kabul et (SHA-256 = 64 hex karakter)
function isValidHash($hash) {
    return preg_match('/^[a-f0-9]{64}$/i', $hash);
}

// GET - Not getir
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        echo json_encode(['success' => false, 'error' => 'ID gerekli']);
        exit;
    }
    
    if (!isValidHash($id)) {
        echo json_encode(['success' => false, 'error' => 'Geçersiz ID formatı']);
        exit;
    }
    
    $filePath = $notesDir . '/' . $id . '.json';
    
    if (file_exists($filePath)) {
        $data = json_decode(file_get_contents($filePath), true);
        echo json_encode([
            'success' => true,
            'content' => $data['content'] ?? ''
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'content' => null
        ]);
    }
    exit;
}

// POST - Not kaydet
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = $input['id'] ?? '';
    $content = $input['content'] ?? '';
    
    if (empty($id)) {
        echo json_encode(['success' => false, 'error' => 'ID gerekli']);
        exit;
    }
    
    if (!isValidHash($id)) {
        echo json_encode(['success' => false, 'error' => 'Geçersiz ID formatı']);
        exit;
    }
    
    $filePath = $notesDir . '/' . $id . '.json';
    
    $data = [
        'content' => $content,
        'updated' => date('Y-m-d H:i:s')
    ];
    
    if (file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT), LOCK_EX)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Kayıt başarısız']);
    }
    exit;
}

// Diğer metodlar için
http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
