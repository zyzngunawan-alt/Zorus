const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "zorus_v1_data";
let data = loadData();
let currentLink = null;

function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { saved: [], history: [] }; }
  catch { return { saved: [], history: [] }; }
}
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2400);
}
function platformFor(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "TikTok";
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "Instagram";
    if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtu.be") return "YouTube";
  } catch {}
  return null;
}
function isHttpUrl(value) {
  try { const u = new URL(value); return u.protocol === "https:" || u.protocol === "http:"; }
  catch { return false; }
}
function addHistory(item) {
  data.history.unshift({ ...item, checkedAt: new Date().toISOString() });
  data.history = data.history.slice(0, 30);
  persist();
}
function renderList(listId, emptyId, items, isSaved) {
  const list = $(listId), empty = $(emptyId);
  list.innerHTML = "";
  empty.classList.toggle("hidden", items.length > 0);
  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "glass-panel link-item";
    const title = document.createElement("strong");
    title.textContent = `${item.platform || "Media"} link`;
    const url = document.createElement("small");
    url.textContent = item.url;
    card.append(title, url);
    if (isSaved) {
      const remove = document.createElement("button");
      remove.className = "secondary-btn";
      remove.style.marginTop = "10px";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        data.saved.splice(index, 1); persist(); renderAll(); toast("Link removed.");
      });
      card.append(remove);
    }
    list.append(card);
  });
}
function renderAll() {
  renderList("downloadsList", "downloadsEmpty", data.saved, true);
  renderList("historyList", "historyEmpty", data.history, false);
}
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === pageId));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("selected", b.dataset.page === pageId));
  if (pageId === "downloadsPage" || pageId === "historyPage") renderAll();
}
document.querySelectorAll(".nav-item").forEach(btn => btn.addEventListener("click", () => showPage(btn.dataset.page)));
$("settingsShortcut").addEventListener("click", () => showPage("settingsPage"));

$("pasteBtn").addEventListener("click", async () => {
  try {
    const value = await navigator.clipboard.readText();
    if (!value) return toast("Clipboard is empty.");
    $("urlInput").value = value.trim();
    toast("Link pasted.");
  } catch {
    $("urlInput").focus();
    toast("Clipboard access unavailable. Paste the link manually.");
  }
});

$("prepareBtn").addEventListener("click", () => {
  const url = $("urlInput").value.trim();
  if (!url) return toast("Paste a link first.");
  if (!isHttpUrl(url)) return toast("Please enter a valid http or https link.");
  const platform = platformFor(url);
  if (!platform) return toast("This link is not from a recognized platform.");
  currentLink = { url, platform };
  $("resultTitle").textContent = `${platform} link recognized`;
  $("resultMessage").textContent = "The link is valid for this preview. Actual media retrieval is not connected yet; use content you own or are authorized to save.";
  $("resultCard").classList.remove("hidden");
  addHistory(currentLink);
  toast(`${platform} link checked.`);
});

$("saveLinkBtn").addEventListener("click", () => {
  if (!currentLink) return;
  if (data.saved.some(x => x.url === currentLink.url)) return toast("This link is already in your library.");
  data.saved.unshift({ ...currentLink, savedAt: new Date().toISOString() });
  persist(); renderAll(); toast("Link saved to your library.");
});

$("clearDataBtn").addEventListener("click", () => {
  if (!confirm("Clear all saved links and history on this device?")) return;
  data = { saved: [], history: [] }; persist(); renderAll(); toast("Local data cleared.");
});

renderAll();


// V1.1: local video import, preview, and save
let selectedVideoFile = null;
let selectedVideoUrl = null;

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function clearSelectedVideo() {
  if (selectedVideoUrl) URL.revokeObjectURL(selectedVideoUrl);
  selectedVideoFile = null;
  selectedVideoUrl = null;
  $("videoPreview").removeAttribute("src");
  $("videoPreview").load();
  $("videoFileInput").value = "";
  $("videoResult").classList.add("hidden");
}

$("chooseVideoBtn").addEventListener("click", () => $("videoFileInput").click());

$("videoFileInput").addEventListener("change", () => {
  const file = $("videoFileInput").files && $("videoFileInput").files[0];
  if (!file) return;
  if (!file.type.startsWith("video/")) {
    clearSelectedVideo();
    return toast("Please choose a video file.");
  }
  if (selectedVideoUrl) URL.revokeObjectURL(selectedVideoUrl);
  selectedVideoFile = file;
  selectedVideoUrl = URL.createObjectURL(file);
  $("videoPreview").src = selectedVideoUrl;
  $("videoFileName").textContent = file.name;
  $("videoFileInfo").textContent = `${formatBytes(file.size)} · ${file.type || "Video"}`;
  $("videoResult").classList.remove("hidden");
  toast("Video ready for preview.");
});

$("saveVideoBtn").addEventListener("click", () => {
  if (!selectedVideoFile || !selectedVideoUrl) return toast("Choose a video first.");
  const link = document.createElement("a");
  link.href = selectedVideoUrl;
  link.download = selectedVideoFile.name || "zorus-video";
  document.body.appendChild(link);
  link.click();
  link.remove();
  toast("Save requested. Check your Downloads folder.");
});

$("removeVideoBtn").addEventListener("click", () => {
  clearSelectedVideo();
  toast("Selected video removed.");
});

window.addEventListener("beforeunload", () => {
  if (selectedVideoUrl) URL.revokeObjectURL(selectedVideoUrl);
});
