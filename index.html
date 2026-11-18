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
  if (!platform) return toast("This first build supports TikTok links only.");
  currentLink = { url, platform };
  $("resultTitle").textContent = `${platform} link recognized`;
  $("resultMessage").textContent = "TikTok link recognized. Download processing is the next development step. Only save videos you own or have permission to download.";
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

