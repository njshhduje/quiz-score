const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static('public'));
app.use(express.json());

// 初期データ
let gameState = {
    players: [
        { id: 1, name: "Player 1", score: 0 },
        { id: 2, name: "Player 2", score: 0 },
        { id: 3, name: "Player 3", score: 0 }
    ],
    auth: { id: "admin", pw: "password123" }
};

// ログインAPI
app.post('/api/login', (req, res) => {
    const { id, pw } = req.body;
    if (id === gameState.auth.id && pw === gameState.auth.pw) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// パスワード変更API
app.post('/api/update-auth', (req, res) => {
    const { newId, newPw } = req.body;
    gameState.auth.id = newId;
    gameState.auth.pw = newPw;
    res.json({ success: true });
});

io.on('connection', (socket) => {
    // 接続時に現在の状態を送信
    socket.emit('init', gameState.players);

    // 点数更新
    socket.on('updateScore', ({ id, diff }) => {
        const player = gameState.players.find(p => p.id === id);
        if (player) {
            player.score += diff;
            io.emit('update', gameState.players);
        }
    });

    // 名前更新
    socket.on('updateName', ({ id, name }) => {
        const player = gameState.players.find(p => p.id === id);
        if (player) {
            player.name = name;
            io.emit('update', gameState.players);
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
