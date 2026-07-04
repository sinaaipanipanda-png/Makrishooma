document.addEventListener("DOMContentLoaded", () => {

  const loggedUser = localStorage.getItem("loggedUser");
  if (!loggedUser) {
    window.location.href = "login-makrishooma.html";
    return;
  }

  const message = document.getElementById("message");

  const countries = {
    iran: {
      name: "🇮🇷 ایران",
      missiles: 100,
      bombs: 55,
      nukes: 5,
      money: 100
    },
    china: {
      name: "🇨🇳 چین",
      missiles: 100,
      bombs: 45,
      nukes: 5,
      money: 100
    },
    kazakhstan: {
      name: "🇰🇿 قزاقستان",
      missiles: 100,
      bombs: 45,
      nukes: 4,
      money: 100
    }
  };

  document.querySelectorAll(".country").forEach(card => {
    card.addEventListener("click", () => {

      const id = card.dataset.country;

      const selected = countries[id];

      let gameData = JSON.parse(localStorage.getItem("gameData")) || {};

      gameData[loggedUser] = {
        country: selected,
        health: 100,
        missiles: selected.missiles,
        bombs: selected.bombs,
        nukes: selected.nukes,
        money: selected.money,
        eliminated: false
      };

      localStorage.setItem("gameData", JSON.stringify(gameData));

      message.textContent = "✅ کشور انتخاب شد! در حال ورود به بازی...";

      setTimeout(() => {
        window.location.href = "game-makrishooma.html";
      }, 1500);

    });
  });

});