(() => {
  let youtubeLeftControls, youtubePlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  // 🔹 Wait until YouTube controls + video are ready
  const waitForControls = () => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const controls = document.querySelector(".ytp-left-controls");
        const player = document.querySelector("video");

        if (controls && player) {
          clearInterval(interval);
          resolve({ controls, player });
        }
      }, 500);
    });
  };

  // 🔹 Fetch bookmarks from storage
  const fetchBookmarks = () => {
  return new Promise((resolve) => {
    if (!currentVideo) {
      const urlParams = new URLSearchParams(window.location.search);
      currentVideo = urlParams.get("v");
    }

    if (!currentVideo) {
      resolve([]); // prevent crash
      return;
    }

    chrome.storage.sync.get([currentVideo], (obj) => {
      resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
    });
  });
};

  // 🔹 Toast notification (NEW)
  const showToast = () => {
    const toast = document.createElement("div");
    toast.innerText = "Saved!";

    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.background = "#0f9d58";
    toast.style.color = "white";
    toast.style.padding = "8px 12px";
    toast.style.borderRadius = "6px";
    toast.style.fontSize = "12px";
    toast.style.zIndex = "9999";
    toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    toast.style.opacity = "0.95";

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 1500);
  };

  // 🔹 Handle bookmark click
  const addNewBookmarkEventHandler = async () => {
    console.log("Button clicked");

    if (!youtubePlayer) {
      console.log("Player not found");
      return;
    }

    // 🔥 Ensure correct video ID
    if (!currentVideo) {
      const urlParams = new URLSearchParams(window.location.search);
      currentVideo = urlParams.get("v");
      console.log("Fixing video ID:", currentVideo);
    }

    const currentTime = youtubePlayer.currentTime;
    console.log("Current Time:", currentTime);

    const newBookmark = {
      time: currentTime,
      desc: "Bookmark at " + getTime(currentTime),
      note: "",
    };

    currentVideoBookmarks = await fetchBookmarks();

    const updatedBookmarks = [...currentVideoBookmarks, newBookmark].sort(
      (a, b) => a.time - b.time,
    );

    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify(updatedBookmarks),
    });

    console.log("Saved under key:", currentVideo);
    console.log("Updated bookmarks:", updatedBookmarks);

    // ✅ Replace alert with toast
    showToast();
  };

  // 🔹 Handle new video load
  const newVideoLoaded = async () => {
    const bookmarkBtnExists = document.querySelector(".bookmark-btn");
    if (bookmarkBtnExists) return;

    currentVideoBookmarks = await fetchBookmarks();

    if (!bookmarkBtnExists) {
      console.log("Injecting bookmark button...");

      const { controls, player } = await waitForControls();

      youtubeLeftControls = controls;
      youtubePlayer = player;

      // ✅ Create YouTube-style button
      const bookmarkBtn = document.createElement("button");

      bookmarkBtn.className = "ytp-button bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";

      // ✅ Icon inside button
      bookmarkBtn.innerHTML = `
      <img 
        src="${chrome.runtime.getURL("assets/bookmark.png")}" 
        style="width:20px; height:20px; pointer-events: none;"
      />
    `;

      // ✅ Perfect alignment
      bookmarkBtn.style.display = "flex";
      bookmarkBtn.style.alignItems = "center";
      bookmarkBtn.style.justifyContent = "center";
      bookmarkBtn.style.margin = "0 8px";
      bookmarkBtn.style.padding = "0";
      bookmarkBtn.style.cursor = "pointer";

      // ✅ Click event
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);

      // ✅ Add to controls
      youtubeLeftControls.appendChild(bookmarkBtn);
    }
  };

  // 🔹 Listen for messages from background/popup
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if (type === "NEW") {
      currentVideo = videoId;
      console.log("New video loaded:", currentVideo);
      newVideoLoaded();
    } else if (type === "PLAY") {
      if (youtubePlayer) {
    youtubePlayer.currentTime = value;
  }
    } else if (type === "DELETE") {
      currentVideoBookmarks = currentVideoBookmarks.filter(
        (b) => b.time != value,
      );

      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify(currentVideoBookmarks),
      });

      response(currentVideoBookmarks);
    }
  });

  // 🔥 Handle YouTube SPA navigation (VERY IMPORTANT)
  let lastUrl = location.href;

  new MutationObserver(() => {
    const url = location.href;

    if (url !== lastUrl) {
      lastUrl = url;

      if (url.includes("youtube.com/watch")) {
        const urlParams = new URLSearchParams(window.location.search);
        currentVideo = urlParams.get("v");

        console.log("URL changed → New video:", currentVideo);
        newVideoLoaded();
      }
    }
  }).observe(document, { subtree: true, childList: true });

  // Initial load
  newVideoLoaded();
})();

// 🔹 Format time helper
const getTime = (t) => {
  var date = new Date(0);
  date.setSeconds(t);
  return date.toISOString().substr(11, 8);
};
