const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));
app.use(express.json());

// 初期データを6人に設定
let gameState = {
    players: [
        { id: 1, name: "Player 1", score: 0 },
        { id: 2, name: "Player 2", score: 0 },
        { id: 3, name: "Player 3", score: 0 },
        { id: 4, name: "Player 4", score: 0 },
        { id: 5, name: "Player 5", score: 0 },
        { id: 6, name: "Player 6", score: 0 }
    ],
    auth: { id: "nakanishi", pw: "47364976" }
};

app.post('/api/login', (req, res) => {
    const { id, pw } = req.body;
    if (id === gameState.auth.id && pw === gameState.auth.pw) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

io.on('connection', (socket) => {
    socket.emit('init', gameState.players);

    socket.on('updateScore', ({ id, diff }) => {
        const player = gameState.players.find(p => p.id === id);
        if (player) {
            player.score += diff;
            io.emit('update', gameState.players);
        }
    });

    socket.on('updateName', ({ id, name }) => {
        const player = gameState.players.find(p => p.id === id);
        if (player) {
            player.name = name;
            io.emit('update', gameState.players);
        }
    });

    socket.on('updateSettings', (newAuth) => {
        gameState.auth = newAuth;
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
