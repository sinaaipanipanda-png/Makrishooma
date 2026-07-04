document.addEventListener("DOMContentLoaded", () => {

  const loggedUser = localStorage.getItem("loggedUser");
  if (!loggedUser) {
    window.location.href = "login-makrishooma.html";
    return;
  }

  const onlineCount = document.getElementById("onlineCount");
  const message = document.getElementById("message");

  let players = JSON.parse(localStorage.getItem("players")) || [];

  if (!players.includes(loggedUser)) {
    players.push(loggedUser);
    localStorage.setItem("players", JSON.stringify(players));
  }

  onlineCount.textContent = players.length;

  players.forEach((p, i) => {
    const el = document.getElementById("player" + (i + 1));
    if (el) {
      el.innerHTML = `👤 ${p} <span style="color:lime;">✅ آماده</span>`;
    }
  });

  if (players.length >= 3) {
    message.textContent = "🎮 همه بازیکنان آماده‌اند... شروع بازی";
    setTimeout(() => {
      window.location.href = "select-country-makrishooma.html";
    }, 2000);
  }

  document.getElementById("leave").addEventListener("click", () => {
    players = players.filter(p => p !== loggedUser);
    localStorage.setItem("players", JSON.stringify(players));
    localStorage.removeItem("loggedUser");
    window.location.href = "home-makrishooma.html";
  });

});