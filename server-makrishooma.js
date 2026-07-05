const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
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
    iri: {
        name: "🇮🇷 ایران",
        health: 100,
        missiles: 100,
        bombs: 55,
        nukes: 5,
        money: 100
    },
    china: {
        name: "🇨🇳 چین",
        health: 100,
        missiles: 100,
        bombs: 45,
        nukes: 5,
        money: 100
    },
    kazakhstan: {
        name: "🇰🇿 قزاقستان",
        health: 100,
        missiles: 100,
        bombs: 45,
        nukes: 4,
        money: 100
    }
};

// ================= CONFIG =================

const DAMAGE = {
    missile: 0.5,
    bomb: 1,
    nuke: 7
};

const PRICE = {
    missile: 5,
    bomb: 10,
    nuke: 30
};

// ================= GAME STATE =================

let players = {};
let lobby = [];
let turnOrder = [];
let turnIndex = 0;
let gameStarted = false;

// ================= HELPERS =================

function broadcastLobby() {

    io.emit("lobby-update", {
        players: lobby,
        started: gameStarted
    });

}

function currentTurn() {

    return turnOrder[turnIndex] || null;

}

function advanceTurn() {

    if (turnOrder.length === 0) return;

    let safe = 0;

    do {

        turnIndex++;

        if (turnIndex >= turnOrder.length)
            turnIndex = 0;

        safe++;

    } while (

        safe < 100 &&
        players[turnOrder[turnIndex]] &&
        players[turnOrder[turnIndex]].eliminated

    );

    io.emit("turn-update", currentTurn());

}

// ================= START =================

server.listen(PORT, () => {

    console.log("🌍 Makrishooma Running");
    console.log("🚀 Port:", PORT);

});

// ================= SOCKET =================

io.on("connection", (socket) => {

    console.log("🟢 Connected:", socket.id);
        // ================= LOGIN =================

    socket.on("login", ({ username, password }) => {

        if (!USERS[username] || USERS[username] !== password) {

            socket.emit("login-result", {
                success: false,
                message: "نام کاربری یا رمز عبور اشتباه است."
            });

            return;
        }

        socket.username = username;

        if (!lobby.includes(username)) {
            lobby.push(username);
        }

        if (!players[username]) {

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

        } else {

            players[username].socketId = socket.id;

        }

        socket.emit("login-result", {
            success: true,
            username
        });

        broadcastLobby();

    });

    // ================= JOIN LOBBY =================

    socket.on("join-lobby", ({ username }) => {

        socket.username = username;

        if (!lobby.includes(username)) {
            lobby.push(username);
        }

        if (!players[username]) {

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

        } else {

            players[username].socketId = socket.id;

        }

        broadcastLobby();

    });

    // ================= SELECT COUNTRY =================

    socket.on("select-country", (countryId) => {

        const p = players[socket.username];

        if (!p) return;
        if (!COUNTRIES[countryId]) return;

        const c = COUNTRIES[countryId];

        p.country = countryId;

        p.health = c.health;
        p.missiles = c.missiles;
        p.bombs = c.bombs;
        p.nukes = c.nukes;
        p.money = c.money;

        io.emit("player-update", players);

        const ready =
            Object.values(players)
            .filter(x => x.country);

        if (ready.length >= 3 && !gameStarted) {

            gameStarted = true;

            turnOrder =
                ready.map(x => x.username);

            turnIndex = 0;

            io.emit("game-start", {

                players,
                turn: currentTurn()

            });

            io.emit("turn-update", currentTurn());

            broadcastLobby();

        }

    });
        // ================= ATTACK =================

    socket.on("attack", ({ target, weapon, amount }) => {

        const attacker = socket.username;

        if (!gameStarted) return;
        if (currentTurn() !== attacker) return;

        const a = players[attacker];
        const t = players[target];

        if (!a || !t) return;
        if (t.eliminated) return;

        const count = parseInt(amount);

        if (isNaN(count) || count <= 0) return;

        let stock = null;

        if (weapon === "missile") stock = "missiles";
        if (weapon === "bomb") stock = "bombs";
        if (weapon === "nuke") stock = "nukes";

        if (!stock) return;

        if (a[stock] < count) {

            socket.emit("error-message", "سلاح کافی نیست.");

            return;

        }

        a[stock] -= count;

        const damage = DAMAGE[weapon] * count;

        t.health -= damage;

        if (t.health <= 0) {

            t.health = 0;
            t.eliminated = true;

        }

        io.emit("player-update", players);

        advanceTurn();

    });

    // ================= BUY =================

    socket.on("buy-weapon", ({ weapon, amount }) => {

        const p = players[socket.username];

        if (!p) return;

        const count = parseInt(amount);

        if (isNaN(count) || count <= 0) return;

        const cost = PRICE[weapon] * count;

        if (p.money < cost) {

            socket.emit("error-message", "پول کافی نیست.");

            return;

        }

        p.money -= cost;

        if (weapon === "missile")
            p.missiles += count;

        if (weapon === "bomb")
            p.bombs += count;

        if (weapon === "nuke")
            p.nukes += count;

        io.emit("player-update", players);

    });

    // ================= CHAT =================

    socket.on("chat-message", (message) => {

        if (!socket.username) return;

        io.emit("chat-message", {

            username: socket.username,

            message,

            time: Date.now()

        });

    });
        // ================= DISCONNECT =================

    socket.on("disconnect", () => {

        const username = socket.username;

        if (!username) return;

        console.log("🔴 Disconnected:", username);

        lobby = lobby.filter(u => u !== username);

        if (players[username]) {
            delete players[username];
        }

        turnOrder = turnOrder.filter(u => u !== username);

        if (turnIndex >= turnOrder.length) {
            turnIndex = 0;
        }

        if (turnOrder.length === 0) {
            gameStarted = false;
        }

        broadcastLobby();

        io.emit("player-update", players);

        if (gameStarted) {
            io.emit("turn-update", currentTurn());
        }

    });

});
