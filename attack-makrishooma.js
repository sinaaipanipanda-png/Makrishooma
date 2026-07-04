document.addEventListener("DOMContentLoaded", () => {

  let gameData = JSON.parse(localStorage.getItem("gameData")) || {};
  const loggedUser = localStorage.getItem("loggedUser");

  const damageMap = {
    missile: 0.5,
    bomb: 1.0,
    nuke: 7.0
  };

  const costMap = {
    missile: 5,
    bomb: 10,
    nuke: 30
  };

  function save() {
    localStorage.setItem("gameData", JSON.stringify(gameData));
  }

  function attack(type) {

    const target = document.getElementById("target").value;
    const count = parseInt(document.getElementById("attackCount").value || 1);

    const attacker = gameData[loggedUser];
    const victim = gameData[target];

    if (!attacker || !victim) return;
    if (attacker.eliminated) return;

    const cost = costMap[type] * count;

    if (attacker.money < cost) {
      alert("💰 پول کافی نیست!");
      return;
    }

    if (attacker[type + "s"] < count) {
      alert("❌ سلاح کافی نیست!");
      return;
    }

    attacker.money -= cost;
    attacker[type + "s"] -= count;

    const damage = damageMap[type] * count;
    victim.health -= damage;

    if (victim.health <= 0) {
      victim.health = 0;
      victim.eliminated = true;
    }

    save();
    updateUI();
  }

  function updateUI() {
    Object.keys(gameData).forEach(player => {
      const data = gameData[player];

      const h = document.getElementById(player + "Health");
      if (h) h.textContent = data.health.toFixed(1) + "%";

      const mh = document.getElementById(player + "Missiles");
      if (mh) mh.textContent = data.missiles;

      const bm = document.getElementById(player + "Bombs");
      if (bm) bm.textContent = data.bombs;

      const nk = document.getElementById(player + "Nukes");
      if (nk) nk.textContent = data.nukes;

      const money = document.getElementById(player + "Money");
      if (money) money.textContent = data.money;

      const bar = document.getElementById(player + "HealthBar");
      if (bar) bar.style.width = data.health + "%";

      if (data.eliminated) {
        const card = document.getElementById(player + "Card");
        if (card) {
          card.style.opacity = "0.4";
          card.style.pointerEvents = "none";
        }
      }
    });
  }

  document.getElementById("missileBtn").addEventListener("click", () => attack("missile"));
  document.getElementById("bombBtn").addEventListener("click", () => attack("bomb"));
  document.getElementById("nukeBtn").addEventListener("click", () => attack("nuke"));

  updateUI();

});