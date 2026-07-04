document.addEventListener("DOMContentLoaded", () => {

  const attackSound = new Audio("assets/sounds/attack.mp3");
  const bombSound = new Audio("assets/sounds/bomb.mp3");
  const nukeSound = new Audio("assets/sounds/nuke.mp3");
  const buySound = new Audio("assets/sounds/buy.mp3");
  const winSound = new Audio("assets/sounds/win.mp3");

  attackSound.volume = 0.6;
  bombSound.volume = 0.7;
  nukeSound.volume = 0.9;
  buySound.volume = 0.5;
  winSound.volume = 0.8;

  window.playMissileEffect = function () {

    attackSound.currentTime = 0;
    attackSound.play().catch(()=>{});

    document.body.classList.add("shake");

    setTimeout(() => {
      document.body.classList.remove("shake");
    }, 450);

  };

  window.playBombEffect = function () {

    bombSound.currentTime = 0;
    bombSound.play().catch(()=>{});

    document.body.classList.add("damage");

    setTimeout(() => {
      document.body.classList.remove("damage");
    }, 700);

  };

  window.playNukeEffect = function () {

    nukeSound.currentTime = 0;
    nukeSound.play().catch(()=>{});

    document.body.classList.add("nuclear");

    setTimeout(() => {
      document.body.classList.remove("nuclear");
    }, 1200);

  };

  window.playBuyEffect = function () {

    buySound.currentTime = 0;
    buySound.play().catch(()=>{});

  };

  window.playWinEffect = function () {

    winSound.currentTime = 0;
    winSound.play().catch(()=>{});

    const winner = document.getElementById("winnerText");

    if (winner) {
      winner.classList.add("glow");

      setTimeout(() => {
        winner.classList.remove("glow");
      }, 5000);
    }

  };

});