document.addEventListener("DOMContentLoaded", () => {

  const video = document.getElementById("cameraVideo");
  const startBtn = document.getElementById("cameraStart");
  const stopBtn = document.getElementById("cameraStop");
  const status = document.getElementById("cameraStatus");

  let stream = null;

  async function startCamera() {
    try {

      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      video.srcObject = stream;
      video.play();

      status.textContent = "🟢 وبکم روشن است";

      startBtn.disabled = true;
      stopBtn.disabled = false;

    } catch (err) {

      status.textContent = "❌ دسترسی به دوربین داده نشد.";

    }
  }

  function stopCamera() {

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
      stream = null;
    }

    status.textContent = "🔴 وبکم خاموش است";

    startBtn.disabled = false;
    stopBtn.disabled = true;
  }

  startBtn.addEventListener("click", startCamera);
  stopBtn.addEventListener("click", stopCamera);

  stopBtn.disabled = true;

});