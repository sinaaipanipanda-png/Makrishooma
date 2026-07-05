const socket = io();

document.addEventListener("DOMContentLoaded", () => {

    const loggedUser = localStorage.getItem("loggedUser");

    if (!loggedUser) {
        window.location.href = "login-makrishooma.html";
        return;
    }

    const onlineCount = document.getElementById("onlineCount");
    const message = document.getElementById("message");

    // ورود کاربر به لابی
    socket.emit("join-lobby", {
        username: loggedUser
    });

    // دریافت لیست بازیکنان
    socket.on("lobby-update", (data) => {

        const players = data.players || [];

        if (onlineCount) {
            onlineCount.textContent = players.length;
        }

        for (let i = 1; i <= 3; i++) {

            const el = document.getElementById("player" + i);

            if (!el) continue;

            if (players[i - 1]) {

                el.innerHTML =
                    `👤 ${players[i - 1]} <span style="color:lime;">✅ آماده</span>`;

            } else {

                el.innerHTML =
                    "⏳ در انتظار بازیکن...";

            }

        }

        if (data.started) {

            if (message) {
                message.textContent =
                    "🎮 همه بازیکنان آماده‌اند... شروع بازی";
            }

            setTimeout(() => {

                window.location.href =
                    "select-country-makrishooma.html";

            }, 1500);

        }

    });

    // خروج
    const leaveBtn = document.getElementById("leave");

    if (leaveBtn) {

        leaveBtn.addEventListener("click", () => {

            socket.disconnect();

            localStorage.removeItem("loggedUser");

            window.location.href =
                "home-makrishooma.html";

        });

    }

});
