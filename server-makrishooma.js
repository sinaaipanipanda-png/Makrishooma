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

const player = players[socket.username];

if (!player) return;

if (!COUNTRIES[countryId]) return;

// جلوگیری از انتخاب تکراری کشور
const taken = Object.values(players).find(
p => p.country === countryId && p.username !== socket.username
);

if (taken) {

socket.emit("error-message", "این کشور قبلاً انتخاب شده است.");

return;
}

const c = COUNTRIES[countryId];

player.country = countryId;
player.health = c.health;
player.missiles = c.missiles;
player.bombs = c.bombs;
player.nukes = c.nukes;
player.money = c.money;

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

let stockKey = null;

if (weapon === "missile") stockKey = "missiles";
if (weapon === "bomb") stockKey = "bombs";
if (weapon === "nuke") stockKey = "nukes";

if (!stockKey) return;

if (a[stockKey] < count) {

socket.emit("error-message", "سلاح کافی نیست.");

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

// ================= BUY WEAPON =================

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

if (weapon === "missile") p.missiles += count;
if (weapon === "bomb") p.bombs += count;
if (weapon === "nuke") p.nukes += count;

io.emit("player-update", players);

});

// ================= CHAT =================

socket.on("chat-message", (message) => {

if (!socket.username) return;

io.emit("chat-message", {

username: socket.username,
message: message,
time: Date.now()

});

});
// ================= DISCONNECT =================

socket.on("disconnect", () => {

const username = socket.username;

if (!username) return;

console.log("🔴 Disconnected:", username);

// حذف از لابی
lobby = lobby.filter(name => name !== username);

// حذف از بازیکنان
delete players[username];

// حذف از نوبت‌ها
turnOrder = turnOrder.filter(name => name !== username);

if (turnIndex >= turnOrder.length) {
turnIndex = 0;
}

// اگر کسی نماند
if (turnOrder.length === 0) {

gameStarted = false;

} else {

io.emit("turn-update", currentTurn());

}

// بروزرسانی برای همه بازیکنان
broadcastLobby();
io.emit("player-update", players);

});

});
