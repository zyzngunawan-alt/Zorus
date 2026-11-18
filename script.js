const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "zorus_v1_data";
const TIKTOK_API = "https://zorus-api.zyzngunawan.workers.dev/api/tiktok";

let data = loadData();
let currentLink = null;
let currentResult = null;

function loadData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored && Array.isArray(stored.saved) && Array.isArray(stored.history)
      ? stored
      : { saved: [], history: [] };
  } catch {
    return { saved: [], history: [] };
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2400);
}

function platformFor(value) {
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "TikTok";
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "Instagram";
    if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtu.be") return "YouTube";
  } catch {}
  return null;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function addHistory(item) {
  data.history.unshift({ ...item, checkedAt: new Date().toISOString() });
  data.history = data.history.slice(0, 30);
  persist();
}

function renderList(listId, emptyId, items, isSaved) {
  const list = $(listId);
  const empty = $(emptyId);
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
        data.saved.splice(index, 1);
        persist();
        renderAll();
        toast("Link removed.");
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
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });
  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("selected", button.dataset.page === pageId);
  });
  if (pageId === "downloadsPage" || pageId === "historyPage") renderAll();
}

function clearResultDetails() {
  const oldDetails = $("apiDetails");
  if (oldDetails) oldDetails.remove();
  currentResult = null;
}

function showTikTokResult(result) {
  clearResultDetails();

  $("resultTitle").textContent = "TikTok link checked";
  $("resultMessage").textContent =
    "Zorus connected to TikTok. The available video information is shown below.";

  const details = document.createElement("div");
  details.id = "apiDetails";
  details.style.marginTop = "12px";

  if (result.thumbnail) {
    const image = document.createElement("img");
    image.src = result.thumbnail;
    image.alt = "TikTok video thumbnail";
    image.loading = "lazy";
    image.style.width = "100%";
    image.style.maxHeight = "240px";
    image.style.objectFit = "contain";
    image.style.borderRadius = "12px";
    details.append(image);
  }

  const fields = [];
  if (result.title) fields.push(["Title", result.title]);
  if (result.creator) fields.push(["Creator", result.creator]);
  if (result.width && result.height) {
    fields.push(["Dimensions", `${result.width} × ${result.height}`]);
  }

  if (fields.length) {
    fields.forEach(([label, value]) => {
      const line = document.createElement("p");
      line.style.margin = "8px 0";
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      line.append(strong, document.createTextNode(value));
      details.append(line);
    });
  } else {
    const note = document.createElement("p");
    note.textContent =
      "TikTok returned an embed preview, but did not provide a title, creator name, or thumbnail for this link.";
    details.append(note);
  }

  const openLink = document.createElement("a");
  openLink.href = currentLink.url;
  openLink.target = "_blank";
  openLink.rel = "noopener noreferrer";
  openLink.textContent = "Open video on TikTok";
  openLink.style.display = "inline-block";
  openLink.style.marginTop = "8px";
  details.append(openLink);

  $("resultCard").insertBefore(details, $("saveLinkBtn"));
  $("resultCard").classList.remove("hidden");
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

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

$("prepareBtn").addEventListener("click", async () => {
  const url = $("urlInput").value.trim();

  if (!url) return toast("Paste a link first.");
  if (!isHttpUrl(url)) return toast("Please enter a valid http or https link.");

  const platform = platformFor(url);
  if (!platform) return toast("This link is not from a recognized platform.");
  if (platform !== "TikTok") {
    return toast("TikTok is the first supported platform. Others are coming later.");
  }

  currentLink = { url, platform };
  clearResultDetails();
  $("resultCard").classList.remove("hidden");
  $("resultTitle").textContent = "Checking TikTok link…";
  $("resultMessage").textContent = "Contacting Zorus API.";
  $("prepareBtn").disabled = true;

  try {
    const endpoint = `${TIKTOK_API}?url=${encodeURIComponent(url)}`;
    const response = await fetch(endpoint, { method: "GET" });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "TikTok information is unavailable.");
    }

    currentResult = result;
    showTikTokResult(result);
    addHistory(currentLink);
    toast("TikTok link checked successfully.");
  } catch (error) {
    $("resultTitle").textContent = "Unable to check this TikTok link";
    $("resultMessage").textContent =
      error.message || "Please try again later.";
    $("resultCard").classList.remove("hidden");
    toast("TikTok check failed.");
  } finally {
    $("prepareBtn").disabled = false;
  }
});

$("saveLinkBtn").addEventListener("click", () => {
  if (!currentLink) return;
  if (data.saved.some(item => item.url === currentLink.url)) {
    return toast("This link is already in your library.");
  }

  data.saved.unshift({
    ...currentLink,
    savedAt: new Date().toISOString()
  });
  persist();
  renderAll();
  toast("Link saved to your library.");
});

$("clearDataBtn").addEventListener("click", () => {
  if (!confirm("Clear all saved links and history on this device?")) return;
  data = { saved: [], history: [] };
  persist();
  renderAll();
  toast("Local data cleared.");
});

renderAll();
