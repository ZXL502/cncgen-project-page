"use strict";
const demoVideo = document.getElementById("demo-video");
const demoStart = document.getElementById("demo-start");
const demoStartLabel = document.getElementById("demo-start-label");
const demoPlaybackStatus = document.getElementById("demo-playback-status");
if (demoVideo && demoStart && demoStartLabel && demoPlaybackStatus) {
  let playPending = false;
  const showPlaybackStatus = (message) => {
    demoPlaybackStatus.textContent = message;
    demoPlaybackStatus.hidden = !message;
  };
  const syncDemoControl = () => {
    demoStart.hidden = !demoVideo.paused && !demoVideo.ended;
    demoStart.disabled = playPending;
    demoStartLabel.textContent = playPending ? "Starting..." : demoVideo.ended ? "Replay demo" : "Play demo";
    demoStart.setAttribute("aria-label", demoVideo.ended ? "Replay CNCGEN demo" : "Play CNCGEN demo");
  };
  demoStart.addEventListener("click", async () => {
    playPending = true;
    showPlaybackStatus("");
    syncDemoControl();
    try {
      if (demoVideo.error) demoVideo.load();
      if (demoVideo.ended) demoVideo.currentTime = 0;
      await demoVideo.play();
    } catch {
      showPlaybackStatus("Playback could not start. Try Play demo again, or use Download video below.");
    } finally {
      playPending = false;
      syncDemoControl();
    }
  });
  for (const eventName of ["play", "pause", "ended", "loadedmetadata"]) {
    demoVideo.addEventListener(eventName, syncDemoControl);
  }
  demoVideo.addEventListener("playing", () => showPlaybackStatus(""));
  demoVideo.addEventListener("error", () => {
    showPlaybackStatus("The video could not be loaded. Try Play demo again, or use Download video below.");
    syncDemoControl();
  });
  syncDemoControl();
}
document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  const source = document.getElementById(button.dataset.copy);
  const status = document.getElementById("copy-status");
  if (!source) return;
  const originalLabel = button.textContent;
  try {
    await navigator.clipboard.writeText(source.textContent);
    button.textContent = "Copied";
    if (status) status.textContent = "Copied to clipboard.";
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(source);
    selection.removeAllRanges();
    selection.addRange(range);
    button.textContent = "Text selected";
    if (status) status.textContent = "Text selected. Press Ctrl+C or Command+C to copy.";
  }
  window.setTimeout(() => { button.textContent = originalLabel; }, 2500);
});
