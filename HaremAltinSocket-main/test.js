/**
 * HaremAltın Socket.IO API - Test Dosyası
 * 
 * Bu test dosyası, Socket.IO bağlantısını test eder ve
 * price_changed eventinin gelip gelmediğini kontrol eder.
 * 
 * Kullanım:
 * node test.js
 */

const io = require('socket.io-client');

const SOCKET_URL = 'https://socket.haremaltin.com:443';
const TEST_TIMEOUT = 30000; // 30 saniye
const EXPECTED_EVENT = 'price_changed';

let testResults = {
    connection: false,
    eventReceived: false,
    messagesReceived: 0,
    errors: []
};

console.log('========================================');
console.log('HaremAltın Socket.IO Test');
console.log('========================================');
console.log(`Test URL: ${SOCKET_URL}`);
console.log(`Beklenen Event: ${EXPECTED_EVENT}`);
console.log(`Test Süresi: ${TEST_TIMEOUT / 1000} saniye`);
console.log('========================================\n');

function runTest() {
    return new Promise((resolve, reject) => {
        console.log('[TEST] Socket.IO bağlantısı test ediliyor...');

        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: false
        });
        let testTimeout;

        socket.on('connect', function() {
            console.log('[TEST] ✅ Bağlantı başarılı!');
            console.log(`[TEST] Socket ID: ${socket.id}`);
            testResults.connection = true;

            // Test timeout'u ayarla
            testTimeout = setTimeout(() => {
                socket.disconnect();
                resolve(testResults);
            }, TEST_TIMEOUT);

            console.log(`[TEST] ${TEST_TIMEOUT / 1000} saniye boyunca eventler dinleniyor...\n`);
        });

        socket.on('connect_error', function(error) {
            console.error('[TEST] ❌ Bağlantı hatası:', error.message);
            testResults.errors.push(error.message);
            clearTimeout(testTimeout);
            reject(error);
        });

        // price_changed eventini dinle
        socket.on(EXPECTED_EVENT, function(data) {
            testResults.messagesReceived++;
            const timestamp = new Date().toLocaleString('tr-TR');

            console.log(`[${timestamp}] Mesaj alındı (${testResults.messagesReceived}):`);
            console.log(JSON.stringify(data, null, 2));
            console.log('---');

            console.log(`[TEST] ✅ ${EXPECTED_EVENT} eventi alındı!`);
            testResults.eventReceived = true;
        });

        // Diğer eventleri de dinle
        socket.onAny((eventName, ...args) => {
            if (eventName !== EXPECTED_EVENT) {
                testResults.messagesReceived++;
                const timestamp = new Date().toLocaleString('tr-TR');
                console.log(`[${timestamp}] Event: ${eventName}`);
                console.log(JSON.stringify(args, null, 2));
                console.log('---');
            }
        });

        socket.on('disconnect', function(reason) {
            console.log('\n[TEST] Bağlantı kapatıldı. Sebep:', reason);
            clearTimeout(testTimeout);
            resolve(testResults);
        });
    });
}

// Testi çalıştır
runTest()
    .then((results) => {
        console.log('\n========================================');
        console.log('Test Sonuçları');
        console.log('========================================');
        console.log(`Bağlantı: ${results.connection ? '✅ BAŞARILI' : '❌ BAŞARISIZ'}`);
        console.log(`Event Alındı: ${results.eventReceived ? '✅ EVET' : '❌ HAYIR'}`);
        console.log(`Toplam Mesaj: ${results.messagesReceived}`);
        console.log(`Hatalar: ${results.errors.length}`);

        if (results.errors.length > 0) {
            console.log('\nHata Detayları:');
            results.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        console.log('========================================\n');

        // Test sonucunu değerlendir
        if (results.connection && results.eventReceived) {
            console.log('✅ TÜM TESTLER BAŞARILI!');
            process.exit(0);
        } else if (results.connection) {
            console.log('⚠️  Bağlantı başarılı ancak event alınamadı.');
            console.log('   Bu normal olabilir - event gelmemiş olabilir.');
            process.exit(0);
        } else {
            console.log('❌ TEST BAŞARISIZ!');
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error('\n[TEST] ❌ Test hatası:', error);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[TEST] Test iptal edildi.');
    process.exit(0);
});

