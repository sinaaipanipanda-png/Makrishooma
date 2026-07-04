document.addEventListener("DOMContentLoaded", () => {

  let gameData = JSON.parse(localStorage.getItem("gameData")) || {};
  const loggedUser = localStorage.getItem("loggedUser");

  if (!gameData[loggedUser]) return;

  const player = gameData[loggedUser];

  const priceMap = {
    missile: 5,
    bomb: 10,
    nuke: 30
  };

  function save() {
    localStorage.setItem("gameData", JSON.stringify(gameData));
  }

  function updateUI() {
    document.getElementById("money").textContent = player.money;
    document.getElementById("missiles").textContent = player.missiles;
    document.getElementById("bombs").textContent = player.bombs;
    document.getElementById("nukes").textContent = player.nukes;
  }

  function buy(type, amount = 1) {

    const cost = priceMap[type] * amount;

    if (player.money < cost) {
      alert("💰 پول کافی نیست!");
      return;
    }

    player.money -= cost;
    player[type + "s"] += amount;

    save();
    updateUI();
  }

  document.getElementById("buyMissile").addEventListener("click", () => buy("missile"));
  document.getElementById("buyBomb").addEventListener("click", () => buy("bomb"));
  document.getElementById("buyNuke").addEventListener("click", () => buy("nuke"));

  updateUI();

});