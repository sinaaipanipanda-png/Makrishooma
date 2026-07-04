document.addEventListener("DOMContentLoaded", () => {

  let gameData = JSON.parse(localStorage.getItem("gameData")) || {};
  const players = Object.keys(gameData);

  if (players.length === 0) return;

  const order = players; 
  let currentIndex = parseInt(localStorage.getItem("turnIndex") || "0");

  function setTurnUI() {
    const currentPlayer = order[currentIndex];

    document.getElementById("turnBox").textContent =
      `🎯 نوبت: ${currentPlayer}`;

    players.forEach(p => {
      const card = document.getElementById(p + "Card");
      if (card) card.classList.remove("activeTurn");
    });

    const active = document.getElementById(currentPlayer + "Card");
    if (active) active.classList.add("activeTurn");
  }

  function nextTurn() {

    currentIndex++;

    if (currentIndex >= order.length) {
      currentIndex = 0;
    }

    localStorage.setItem("turnIndex", currentIndex);

    setTurnUI();
  }

  window.endTurn = function () {
    nextTurn();
  };

  setTurnUI();

});