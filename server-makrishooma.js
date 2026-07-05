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

// ================= STATIC =================

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

        if (turnIndex >= turnOrder.length) {
            turnIndex = 0;
        }

        safe++;

    } while (
        safe < 100 &&
        players[turnOrder[turnIndex]] &&
        players[turnOrder[turnIndex]].eliminated
    );

    io.emit("turn-update", currentTurn());

}

// ================= SERVER =================

server.listen(PORT, () => {

    console.log("==================================");
    console.log("🌍 Makrishooma Server Started");
    console.log("🚀 Port:", PORT);
    console.log("==================================");

});

// ================= SOCKET =================

io.on("connection", (socket) => {

    console.log("🟢 Connected:", socket.id);
        // ================= LOGIN =================

    socket.on("login", (data) => {

        const { username, password } = data;

        if (!USERS[username] || USERS[username] !== password) {
            socket.emit("login-failed", "❌ نام کاربری یا رمز اشتباه است");
            return;
        }

        players[socket.id] = {
            username,
            country: null,
            money: 100,
            eliminated: false
        };

        lobby.push({
            id: socket.id,
            username
        });

        socket.emit("login-success", players[socket.id]);

        broadcastLobby();

        console.log("🔐 Login:", username);
    });

    // ================= SELECT COUNTRY =================

    socket.on("select-country", (countryKey) => {

        const player = players[socket.id];

        if (!player) return;

        if (!COUNTRIES[countryKey]) return;

        player.country = countryKey;

        socket.emit("country-selected", COUNTRIES[countryKey]);

        console.log(`🌍 ${player.username} selected ${countryKey}`);
    });

    // ================= START GAME =================

    socket.on("start-game", () => {

        if (gameStarted) return;

        if (lobby.length < 2) {
            socket.emit("error-msg", "❌ حداقل 2 بازیکن لازم است");
            return;
        }

        gameStarted = true;

        turnOrder = lobby.map(p => p.id);
        turnIndex = 0;

        io.emit("game-started", {
            turn: currentTurn(),
            countries: COUNTRIES
        });

        broadcastLobby();

        console.log("🚀 Game Started!");
    });

    // ================= DISCONNECT =================

    socket.on("disconnect", () => {

        console.log("🔴 Disconnected:", socket.id);

        lobby = lobby.filter(p => p.id !== socket.id);

        delete players[socket.id];

        broadcastLobby();
    });

});
    // ================= BUY WEAPONS =================

    socket.on("buy", (type) => {

        const player = players[socket.id];
        if (!player || player.eliminated) return;

        const country = COUNTRIES[player.country];
        if (!country) return;

        if (!PRICE[type]) return;

        if (player.money < PRICE[type]) {
            socket.emit("error-msg", "❌ پول کافی نداری");
            return;
        }

        player.money -= PRICE[type];
        country[type === "nuke" ? "nukes" : type + "s"]++;

        io.emit("state-update", {
            playerId: socket.id,
            money: player.money,
            country
        });

        console.log(`💰 ${player.username} bought ${type}`);
    });

    // ================= ATTACK =================

    socket.on("attack", (data) => {

        const attacker = players[socket.id];
        if (!attacker || attacker.eliminated) return;

        if (currentTurn() !== socket.id) {
            socket.emit("error-msg", "❌ نوبت تو نیست");
            return;
        }

        const { targetId, type } = data;

        const target = players[targetId];
        if (!target || target.eliminated) return;

        const attackerCountry = COUNTRIES[attacker.country];
        const targetCountry = COUNTRIES[target.country];

        if (!attackerCountry || !targetCountry) return;

        // check ammo
        const ammoKey = type === "nuke" ? "nukes" : type + "s";

        if (attackerCountry[ammoKey] <= 0) {
            socket.emit("error-msg", "❌ مهمات کافی نداری");
            return;
        }

        attackerCountry[ammoKey]--;

        const dmg = DAMAGE[type];
        targetCountry.health -= dmg;

        if (targetCountry.health <= 0) {
            target.eliminated = true;
            targetCountry.health = 0;

            io.emit("player-eliminated", targetId);

            console.log("💀 Eliminated:", target.username);
        }

        io.emit("attack-result", {
            from: socket.id,
            to: targetId,
            type,
            damage: dmg,
            targetHealth: targetCountry.health
        });

        advanceTurn();
    });

    // ================= END TURN =================

    socket.on("end-turn", () => {

        if (currentTurn() !== socket.id) {
            socket.emit("error-msg", "❌ الان نوبت تو نیست");
            return;
        }

        advanceTurn();
    });

    // ================= CHECK WINNER =================

    function checkWinner() {

        const alive = Object.values(players).filter(p => !p.eliminated);

        if (alive.length === 1) {

            const winner = alive[0];

            io.emit("game-over", {
                winner: winner.username
            });

            console.log("🏆 Winner:", winner.username);

            gameStarted = false;
        }
    }

    // run winner check after each attack
    socket.on("attack", () => {
        checkWinner();
    });
    // ================= RESET GAME =================

    socket.on("reset-game", () => {

        gameStarted = false;
        players = {};
        lobby = [];
        turnOrder = [];
        turnIndex = 0;

        // reset countries
        Object.keys(COUNTRIES).forEach(key => {
            COUNTRIES[key].health = 100;
            COUNTRIES[key].missiles = 100;
            COUNTRIES[key].bombs = 50;
            COUNTRIES[key].nukes = 5;
            COUNTRIES[key].money = 100;
        });

        io.emit("game-reset");

        console.log("🔄 Game Reset Complete");
    });

    // ================= HANDLE MID GAME LEAVE =================

    socket.on("disconnect", () => {

        console.log("🔴 Disconnected:", socket.id);

        const player = players[socket.id];

        lobby = lobby.filter(p => p.id !== socket.id);
        delete players[socket.id];

        // if game is running, treat as elimination
        if (gameStarted && player) {

            const country = COUNTRIES[player.country];

            if (country) {
                country.health = 0;
            }

            io.emit("player-eliminated", socket.id);

            console.log("💀 Mid-game elimination:", player.username);

            checkWinner();
            advanceTurn();
        }

        broadcastLobby();
    });

    // ================= DEBUG STATE =================

    socket.on("get-state", () => {

        socket.emit("state", {
            players,
            lobby,
            turnOrder,
            turnIndex,
            gameStarted,
            countries: COUNTRIES
        });

    });

    // ================= HEARTBEAT (SAFE KEEP) =================

    socket.on("ping-game", () => {
        socket.emit("pong-game");
    });

});
