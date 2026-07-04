document.addEventListener("DOMContentLoaded", () => {

  const loggedUser = localStorage.getItem("loggedUser");
  let gameData = JSON.parse(localStorage.getItem("gameData")) || {};

  if (!loggedUser || !gameData[loggedUser]) return;

  const player = gameData[loggedUser];

  const status = document.getElementById("spectatorStatus");
  const buyPanel = document.getElementById("buyPanel");
  const backBtn = document.getElementById("returnGame");

  function save() {
    localStorage.setItem("gameData", JSON.stringify(gameData));
  }

  function updateUI() {

    document.getElementById("money").textContent = player.money;
    document.getElementById("missiles").textContent = player.missiles;
    document.getElementById("bombs").textContent = player.bombs;
    document.getElementById("nukes").textContent = player.nukes;

    if (player.eliminated) {
      status.textContent = "👀 شما تماشاگر هستید.";
      buyPanel.style.display = "block";
    } else {
      status.textContent = "🎮 شما داخل بازی هستید.";
      buyPanel.style.display = "none";
    }

  }

  function buy(type, amount, price) {

    const total = amount * price;

    if (player.money < total) {
      alert("💰 پول کافی نیست!");
      return;
    }

    player.money -= total;
    player[type] += amount;

    checkReturn();

    save();
    updateUI();
  }

  function checkReturn() {

    if (
      player.missiles >= 10 ||
      player.bombs >= 2 ||
      player.nukes >= 1
    ) {
      player.eliminated = false;

      alert("🎉 شما دوباره وارد بازی شدید!");

      save();

      window.location.href = "game-makrishooma.html";
    }

  }

  document.getElementById("buy10Missiles").onclick = () => buy("missiles",10,5);
  document.getElementById("buy2Bombs").onclick = () => buy("bombs",2,10);
  document.getElementById("buy1Nuke").onclick = () => buy("nukes",1,30);

  if(backBtn){
    backBtn.onclick = () => {
      window.location.href = "game-makrishooma.html";
    };
  }

  updateUI();

});