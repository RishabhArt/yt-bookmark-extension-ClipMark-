import { getActiveTabURL } from "./utils.js";

// 🔹 Global bookmarks (for search)
let globalBookmarks = [];

// 🔐 SAFE STORAGE GET
const safeStorageGet = (key) => {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get([key], (obj) => {
        if (chrome.runtime.lastError) {
          console.warn("Storage error:", chrome.runtime.lastError);
          resolve([]);
        } else {
          resolve(obj[key] ? JSON.parse(obj[key]) : []);
        }
      });
    } catch (e) {
      console.warn("Context invalidated (get):", e);
      resolve([]);
    }
  });
};

// 🔐 SAFE STORAGE SET
const safeStorageSet = (data) => {
  try {
    chrome.storage.sync.set(data, () => {
      if (chrome.runtime.lastError) {
        console.warn("Storage set error:", chrome.runtime.lastError);
      }
    });
  } catch (e) {
    console.warn("Context invalidated (set):", e);
  }
};

// 🔹 Add bookmark UI
const addNewBookmark = (bookmarks, bookmark) => {
  const bookmarkElement = document.createElement("div");
  bookmarkElement.className = "bookmark";
  bookmarkElement.id = "bookmark-" + bookmark.time;
  bookmarkElement.setAttribute("timestamp", bookmark.time);

  // 🔹 Top row
  const topRow = document.createElement("div");
  topRow.className = "bookmark-top";

  const title = document.createElement("div");
  title.className = "bookmark-title";
  title.contentEditable = true;
  title.textContent = `⏱ ${bookmark.desc}`;

  // 🔹 Rename
  title.addEventListener("blur", async () => {
    bookmark.desc = title.innerText.replace("⏱ ", "");

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const urlParams = new URLSearchParams(tab.url.split("?")[1]);
    const currentVideo = urlParams.get("v");

    const bookmarks = await safeStorageGet(currentVideo);

    const updated = bookmarks.map((b) =>
      b.time == bookmark.time ? bookmark : b
    );

    safeStorageSet({
      [currentVideo]: JSON.stringify(updated),
    });
  });

  const controls = document.createElement("div");
  controls.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, controls);
  setBookmarkAttributes("delete", onDelete, controls);

  topRow.appendChild(title);
  topRow.appendChild(controls);

  // 🔹 Notes
  const note = document.createElement("input");
  note.className = "bookmark-note";
  note.placeholder = "Add note...";
  note.value = bookmark.note || "";

  note.addEventListener("change", async () => {
    bookmark.note = note.value;

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const urlParams = new URLSearchParams(tab.url.split("?")[1]);
    const currentVideo = urlParams.get("v");

    const bookmarks = await safeStorageGet(currentVideo);

    const updated = bookmarks.map((b) =>
      b.time == bookmark.time ? bookmark : b
    );

    safeStorageSet({
      [currentVideo]: JSON.stringify(updated),
    });
  });

  bookmarkElement.appendChild(topRow);
  bookmarkElement.appendChild(note);

  bookmarks.appendChild(bookmarkElement);
};

// 🔹 Render bookmarks (search enabled)
const viewBookmarks = (currentBookmarks = []) => {
  globalBookmarks = currentBookmarks;

  const searchValue =
    document.getElementById("search")?.value?.toLowerCase() || "";

  const filtered = currentBookmarks.filter((b) =>
    b.desc.toLowerCase().includes(searchValue)
  );

  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  if (filtered.length > 0) {
    filtered.forEach((bookmark) => {
      addNewBookmark(bookmarksElement, bookmark);
    });
  } else {
    bookmarksElement.innerHTML =
      '<i class="row">No bookmarks found</i>';
  }
};

// 🔹 Play
const onPlay = async (e) => {
  const bookmarkTime =
    e.target.closest(".bookmark").getAttribute("timestamp");

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  try {
    chrome.tabs.sendMessage(tab.id, {
      type: "PLAY",
      value: bookmarkTime,
    });
  } catch (e) {
    console.warn("SendMessage failed:", e);
  }
};

// 🔹 Delete
const onDelete = async (e) => {
  const bookmarkEl = e.target.closest(".bookmark");
  const bookmarkTime = bookmarkEl.getAttribute("timestamp");

  bookmarkEl.remove();

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  try {
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: "DELETE",
        value: bookmarkTime,
      },
      (updatedBookmarks) => {
        viewBookmarks(updatedBookmarks);
      }
    );
  } catch (e) {
    console.warn("Delete message failed:", e);
  }
};

// 🔹 Icons
const setBookmarkAttributes = (src, eventListener, parent) => {
  const control = document.createElement("img");
  control.src = "assets/" + src + ".png";
  control.title = src;
  control.style.cursor = "pointer";

  control.addEventListener("click", eventListener);
  parent.appendChild(control);
};

// 🔥 MAIN
document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab.url || !tab.url.includes("youtube.com/watch")) {
    document.querySelector(".container").innerHTML =
      '<div class="title">This is not a youtube video page.</div>';
    return;
  }

  const urlParams = new URLSearchParams(tab.url.split("?")[1]);
  const currentVideo = urlParams.get("v");

  const bookmarks = await safeStorageGet(currentVideo);

  console.log("Bookmarks loaded:", bookmarks);

  viewBookmarks(bookmarks);

  // 🔍 Search
  document.getElementById("search").addEventListener("input", () => {
    viewBookmarks(globalBookmarks);
  });

  // 📤 Export
  document.getElementById("export").addEventListener("click", async () => {
    const bookmarks = await safeStorageGet(currentVideo);

    const text = bookmarks
      .map((b) => `${b.desc} - ${b.note || ""}`)
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bookmarks.txt";
    a.click();
  });

  // 🌙 Dark mode
  document.getElementById("darkToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
});