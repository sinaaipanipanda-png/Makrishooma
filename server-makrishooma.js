const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "home-makrishooma.html"));
});

// ================= USERS =================
const USERS = {
    alikhodadady: "1801",
    takinakbary: "5108",
    sinaayati: "4023"
};

// ================= COUNTRIES =================
const COUNTRIES = {
    iri: { name: "🇮🇷 ایران", health: 100, missiles: 100, bombs: 55, nukes: 5, money: 100 },
    china: { name: "🇨🇳 چین", health: 100, missiles: 100, bombs: 45, nukes: 5, money: 100 },
    kazakhstan: { name: "🇰🇿 قزاقستان", health: 100, missiles: 100, bombs: 45, nukes: 4, money: 100 }
};

// ================= GAME CONFIG =================
const DAMAGE = { missile: 0.5, bomb: 1, nuke: 7 };
const PRICE = { missile: 5, bomb: 10, nuke: 30 };

// ================= STATE =================
let players = {};
let lobby = [];
let turnOrder = [];
let turnIndex = 0;
let gameStarted = false;

// ================= HELPERS =================
function broadcastLobby() {
    io.emit("lobby-update", { players: lobby, started: gameStarted });
}

function currentTurn() {
    return turnOrder[turnIndex] || null;
}

function advanceTurn() {
    if (turnOrder.length === 0) return;

    let safety = 0;

    do {
        turnIndex = (turnIndex + 1) % turnOrder.length;
        safety++;

        const user = players[turnOrder[turnIndex]];

        if (!user || !user.eliminated) break;

    } while (safety < 100);

    io.emit("turn-update", currentTurn());
}

// ================= SERVER START =================
server.listen(PORT, () => {
    console.log("🌍 Makrishooma Server Running");
    console.log("🚀 Port:", PORT);
});

// ================= SOCKET =================
io.on("connection", (socket) => {

    console.log("🟢 Connected:", socket.id);

    // ---------- LOGIN ----------
    socket.on("login", ({ username, password }) => {

        if (!USERS[username] || USERS[username] !== password) {
            socket.emit("login-result", {
                success: false,
                message: "نام کاربری یا رمز اشتباه است."
            });
            return;
        }

        socket.username = username;

        if (!lobby.includes(username)) lobby.push(username);

        players[username] = {
            username,
            socketId: socket.id,
            country: null,
            health: 100,
            missiles: 0,
            bombs: 0,
            nukes: 0,
            money: 100,
            eliminated: false
        };

        socket.emit("login-result", { success: true, username });
        broadcastLobby();
    });

    // ---------- SELECT COUNTRY ----------
    socket.on("select-country", (countryId) => {

        const p = players[socket.username];
        if (!p || !COUNTRIES[countryId]) return;

        const c = COUNTRIES[countryId];

        p.country = countryId;
        p.health = c.health;
        p.missiles = c.missiles;
        p.bombs = c.bombs;
        p.nukes = c.nukes;
        p.money = c.money;

        io.emit("player-update", players);

        const ready = Object.values(players).filter(p => p.country);

        if (ready.length >= 3 && !gameStarted) {

            gameStarted = true;

            turnOrder = ready.map(p => p.username);
            turnIndex = 0;

            io.emit("game-start", {
                players,
                turn: currentTurn()
            });

            io.emit("turn-update", currentTurn());
        }
    });

    // ---------- ATTACK ----------
    socket.on("attack", ({ target, weapon, amount }) => {

        const attacker = socket.username;
        if (!gameStarted) return;
        if (currentTurn() !== attacker) return;

        const a = players[attacker];
        const t = players[target];
        const count = parseInt(amount);

        if (!a || !t || t.eliminated || count <= 0) return;

        let stockKey =
            weapon === "missile" ? "missiles" :
            weapon === "bomb" ? "bombs" :
            weapon === "nuke" ? "nukes" : null;

        if (!stockKey) return;
        if (a[stockKey] < count) {
            socket.emit("error-message", "سلاح کافی نیست");
            return;
        }

        a[stockKey] -= count;

        t.health -= DAMAGE[weapon] * count;

        if (t.health <= 0) {
            t.health = 0;
            t.eliminated = true;
        }

        io.emit("player-update", players);

        advanceTurn();
    });

    // ---------- BUY ----------
    socket.on("buy-weapon", ({ weapon, amount }) => {

        const p = players[socket.username];
        if (!p) return;

        const count = parseInt(amount);
        if (count <= 0) return;

        const cost = PRICE[weapon] * count;

        if (p.money < cost) {
            socket.emit("error-message", "پول کافی نیست");
            return;
        }

        p.money -= cost;

        if (weapon === "missile") p.missiles += count;
        if (weapon === "bomb") p.bombs += count;
        if (weapon === "nuke") p.nukes += count;

        io.emit("player-update", players);
    });

    // ---------- CHAT ----------
    socket.on("chat-message", (message) => {
        if (!socket.username) return;

        io.emit("chat-message", {
            username: socket.username,
            message,
            time: Date.now()
        });
    });

    // ---------- DISCONNECT ----------
    socket.on("disconnect", () => {

        const u = socket.username;
        if (!u) return;

        lobby = lobby.filter(x => x !== u);
        delete players[u];
        turnOrder = turnOrder.filter(x => x !== u);

        if (turnIndex >= turnOrder.length) turnIndex = 0;

        if (turnOrder.length === 0) gameStarted = false;

        io.emit("player-update", players);
        broadcastLobby();

        if (gameStarted) {
            io.emit("turn-update", currentTurn());
        }

        console.log("🔴 Disconnected:", u);
    });

});            

    
