document.addEventListener("DOMContentLoaded", async () => {

  const startBtn = document.getElementById("voiceStart");
  const stopBtn = document.getElementById("voiceStop");
  const status = document.getElementById("voiceStatus");

  let stream = null;
  let audio = null;

  async function startVoice() {
    try {

      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      audio = new Audio();
      audio.srcObject = stream;
      audio.muted = true;
      audio.play();

      status.textContent = "🟢 میکروفون روشن است";

      startBtn.disabled = true;
      stopBtn.disabled = false;

    } catch (e) {

      status.textContent = "❌ دسترسی به میکروفون داده نشد.";

    }
  }

  function stopVoice() {

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }

    status.textContent = "🔴 میکروفون خاموش است";

    startBtn.disabled = false;
    stopBtn.disabled = true;
  }

  startBtn.addEventListener("click", startVoice);
  stopBtn.addEventListener("click", stopVoice);

  stopBtn.disabled = true;

});