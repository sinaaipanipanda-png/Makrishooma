const socket = io();

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");
    const error = document.getElementById("errorMessage");
    const back = document.getElementById("backHome");

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        socket.emit("login", {
            username,
            password
        });

    });

    socket.on("login-result", (result) => {

        if (result.success) {

            localStorage.setItem("loggedUser", result.username);

            window.location.href = "lobby-makrishooma.html";

        } else {

            error.textContent = result.message;

        }

    });

    back.addEventListener("click", () => {

        window.location.href = "home-makrishooma.html";

    });

});
