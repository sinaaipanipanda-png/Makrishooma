document.addEventListener("DOMContentLoaded", () => {

  const loggedUser = localStorage.getItem("loggedUser");
  const gameData = JSON.parse(localStorage.getItem("gameData")) || {};

  if (!loggedUser || !gameData[loggedUser]) return;

  function updateUI() {

    const player = gameData[loggedUser];

    const ids = {
      username: document.getElementById("username"),
      country: document.getElementById("country"),
      health: document.getElementById("health"),
      missiles: document.getElementById("missiles"),
      bombs: document.getElementById("bombs"),
      nukes: document.getElementById("nukes"),
      money: document.getElementById("money"),
      healthBar: document.getElementById("healthBar"),
      gameStatus: document.getElementById("gameStatus")
    };

    if (ids.username) ids.username.textContent = loggedUser;

    if (ids.country) ids.country.textContent = player.country.name;

    if (ids.health) ids.health.textContent = player.health.toFixed(1) + "%";

    if (ids.missiles) ids.missiles.textContent = player.missiles;

    if (ids.bombs) ids.bombs.textContent = player.bombs;

    if (ids.nukes) ids.nukes.textContent = player.nukes;

    if (ids.money) ids.money.textContent = player.money + " پک";

    if (ids.healthBar) {
      ids.healthBar.style.width = player.health + "%";

      if (player.health > 70) {
        ids.healthBar.style.background = "#00e676";
      } else if (player.health > 35) {
        ids.healthBar.style.background = "#ffc107";
      } else {
        ids.healthBar.style.background = "#f44336";
      }
    }

    if (ids.gameStatus) {
      ids.gameStatus.textContent = player.eliminated
        ? "👀 حالت تماشاگر"
        : "🎮 داخل بازی";
    }

  }

  updateUI();

  setInterval(updateUI, 500);

});