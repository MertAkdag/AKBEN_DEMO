/**
 * HaremAltın Socket.IO API - Node.js Örneği
 * 
 * Bu örnek, socket.io-client kütüphanesini kullanarak Socket.IO bağlantısı kurar
 * ve price_changed eventini dinler.
 * 
 * Kurulum:
 * npm install
 * 
 * Kullanım:
 * node example.js
 */

const io = require('socket.io-client');

const SOCKET_URL = 'https://socket.haremaltin.com:443';

console.log('========================================');
console.log('HaremAltın Socket.IO Node.js Örneği');
console.log('========================================');
console.log(`Bağlantı URL: ${SOCKET_URL}`);
console.log('Dinlenen Event: price_changed');
console.log('========================================\n');

console.log('[INFO] Socket.IO bağlantısı kuruluyor...');

// Socket.IO bağlantısı
const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
});

socket.on('connect', function() {
    console.log('[SUCCESS] Socket.IO bağlantısı başarıyla kuruldu!');
    console.log(`[INFO] Socket ID: ${socket.id}`);
    console.log('[INFO] price_changed eventi dinleniyor...\n');
});

socket.on('disconnect', function(reason) {
    console.log(`\n[INFO] Bağlantı kesildi. Sebep: ${reason}`);
});

socket.on('connect_error', function(error) {
    console.error('[ERROR] Bağlantı hatası:', error.message);
});

socket.on('reconnect', function(attemptNumber) {
    console.log(`[INFO] Yeniden bağlandı (Deneme: ${attemptNumber})`);
});

socket.on('reconnect_attempt', function(attemptNumber) {
    console.log(`[INFO] Yeniden bağlanma denemesi: ${attemptNumber}`);
});

socket.on('reconnect_error', function(error) {
    console.error('[ERROR] Yeniden bağlanma hatası:', error.message);
});

socket.on('reconnect_failed', function() {
    console.error('[ERROR] Yeniden bağlanma başarısız oldu.');
});

// price_changed eventini dinle
socket.on('price_changed', function(data) {
    const timestamp = new Date().toLocaleString('tr-TR');
    console.log(`[EVENT] [${timestamp}] price_changed eventi alındı!`);
    console.log('[DATA]', JSON.stringify(data, null, 2));
    console.log('----------------------------------------');
});

// Tüm eventleri dinle (debug için)
socket.onAny((eventName, ...args) => {
    if (eventName !== 'price_changed') {
        const timestamp = new Date().toLocaleString('tr-TR');
        console.log(`[EVENT] [${timestamp}] Event: ${eventName}`);
        console.log('[DATA]', JSON.stringify(args, null, 2));
        console.log('----------------------------------------');
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[INFO] Çıkılıyor...');
    socket.disconnect();
    process.exit(0);
});

console.log('[INFO] Bağlantı kuruldu, mesajlar dinleniyor...');
console.log('[INFO] Çıkmak için Ctrl+C tuşlarına basın.\n');

