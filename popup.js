import { getActiveTabURL } from "./utils.js";
// 🔹 Store bookmarks globally (for search/filter)
let globalBookmarks = [];

// 🔹 Add bookmark UI element
const addNewBookmark = (bookmarks, bookmark) => {
  const bookmarkElement = document.createElement("div");
  bookmarkElement.className = "bookmark";
  bookmarkElement.id = "bookmark-" + bookmark.time;
  bookmarkElement.setAttribute("timestamp", bookmark.time);

  // 🔹 Top row (title + controls)
  const topRow = document.createElement("div");
  topRow.className = "bookmark-top";

  const title = document.createElement("div");
  title.className = "bookmark-title";
  title.contentEditable = true;
  title.textContent = `⏱ ${bookmark.desc}`;

  // 🔹 Save renamed title
  title.addEventListener("blur", async () => {
    bookmark.desc = title.innerText.replace("⏱ ", "");

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const urlParams = new URLSearchParams(tab.url.split("?")[1]);
    const currentVideo = urlParams.get("v");

    chrome.storage.sync.get([currentVideo], (data) => {
      let bookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      bookmarks = bookmarks.map((b) =>
        b.time == bookmark.time ? bookmark : b,
      );

      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify(bookmarks),
      });
    });
  });

  const controls = document.createElement("div");
  controls.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, controls);
  setBookmarkAttributes("delete", onDelete, controls);

  topRow.appendChild(title);
  topRow.appendChild(controls);

  // 🔹 Notes input
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

    chrome.storage.sync.get([currentVideo], (data) => {
      let bookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      bookmarks = bookmarks.map((b) =>
        b.time == bookmark.time ? bookmark : b,
      );

      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify(bookmarks),
      });
    });
  });

  bookmarkElement.appendChild(topRow);
  bookmarkElement.appendChild(note);

  bookmarks.appendChild(bookmarkElement);
};

// 🔹 Render bookmarks (with search)
const viewBookmarks = (currentBookmarks = []) => {
  globalBookmarks = currentBookmarks;

  const searchValue =
    document.getElementById("search")?.value?.toLowerCase() || "";

  const filtered = currentBookmarks.filter((b) =>
    b.desc.toLowerCase().includes(searchValue),
  );

  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  if (filtered.length > 0) {
    filtered.forEach((bookmark) => {
      addNewBookmark(bookmarksElement, bookmark);
    });
  } else {
    bookmarksElement.innerHTML = '<i class="row">No bookmarks found</i>';
  }
};

// 🔹 Play bookmark
const onPlay = async (e) => {
  const bookmarkTime = e.target.closest(".bookmark").getAttribute("timestamp");

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  chrome.tabs.sendMessage(tab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

// 🔹 Delete bookmark
const onDelete = async (e) => {
  const bookmarkEl = e.target.closest(".bookmark");
  const bookmarkTime = bookmarkEl.getAttribute("timestamp");

  bookmarkEl.remove();

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  chrome.tabs.sendMessage(
    tab.id,
    {
      type: "DELETE",
      value: bookmarkTime,
    },
    (updatedBookmarks) => {
      viewBookmarks(updatedBookmarks);
    },
  );
};

// 🔹 Add play/delete icons
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

  chrome.storage.sync.get([currentVideo], (data) => {
    const bookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

    console.log("Bookmarks loaded:", bookmarks);

    viewBookmarks(bookmarks);
  });

  // 🔍 Search listener
  document.getElementById("search").addEventListener("input", () => {
    viewBookmarks(globalBookmarks);
  });

  // 📤 Export
  document.getElementById("export").addEventListener("click", async () => {
    chrome.storage.sync.get([currentVideo], (data) => {
      const bookmarks = data[currentVideo]
        ? JSON.parse(data[currentVideo])
        : [];

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
  });

  // 🌙 Dark mode
  document.getElementById("darkToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
});
