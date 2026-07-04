const users = [
  { username: "alikhodadady", password: "1801" },
  { username: "takinakbary", password: "5108" },
  { username: "sinaayati", password: "4023" }
];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const error = document.getElementById("errorMessage");
  const back = document.getElementById("backHome");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const user = users.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      localStorage.setItem("loggedUser", username);
      window.location.href = "lobby-makrishooma.html";
    } else {
      error.textContent = "❌ نام کاربری یا رمز عبور اشتباه است";
    }
  });

  back.addEventListener("click", () => {
    window.location.href = "home-makrishooma.html";
  });
});