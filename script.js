// === CONFIGURATION ===
const BLOG_JSON_PATH = "blog.json";
const ABOUT_JSON_PATH = "about.json";
const LINK_BUTTONS = [
  { label: "Instagram", href: "https://www.instagram.com/arindavoodian", newTab: true },
];


document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const mainContentEl = document.getElementById("main-content");
  const aboutButton = document.getElementById("aboutButton");
  const blogButton = document.getElementById("blogButton");
  const linkButtonsEl = document.getElementById("linkButtons");

  renderLinkButtons(LINK_BUTTONS, linkButtonsEl);

  // Blog button handler
  blogButton?.addEventListener("click", () => {
    blogButton.classList.add("active");
    aboutButton?.classList.remove("active");
    showBlogSection(statusEl, mainContentEl);
  });

  aboutButton?.addEventListener("click", () => {
    aboutButton.classList.add("active");
    blogButton?.classList.remove("active");
    showAboutSection(statusEl, mainContentEl);
  });

  // Lightbox handling
  initLightbox();

  // Load blog by default
  blogButton?.classList.add("active");
  showBlogSection(statusEl, mainContentEl);
});


function renderLinkButtons(buttonConfigs, container) {
  if (!container || !Array.isArray(buttonConfigs)) {
    return;
  }

  container.innerHTML = "";

  buttonConfigs
    .filter((cfg) => cfg && cfg.label && cfg.href)
    .forEach((cfg) => {
      const btn = document.createElement("a");
      btn.className = "icon-button link-button";
      btn.href = cfg.href;
      btn.textContent = cfg.label;
      if (cfg.newTab !== false) {
        btn.target = "_blank";
        btn.rel = "noreferrer noopener";
      }
      container.appendChild(btn);
    });
}

function setStatusMessage(statusEl, message) {
  if (!statusEl) {
    return;
  }
  if (message) {
    statusEl.textContent = message;
    statusEl.hidden = false;
  } else {
    statusEl.textContent = "";
    statusEl.hidden = true;
  }
}

function showAboutSection(statusEl, mainContentEl) {
  setStatusMessage(statusEl, "Loading about section…");

  loadJsonData(ABOUT_JSON_PATH)
    .then((posts) => {
      setStatusMessage(statusEl, "");
      renderPosts(posts, mainContentEl);
    })
    .catch((err) => {
      console.error(err);
      setStatusMessage(statusEl, "Could not load about information.");
    });
}




function normalizePhotoSrc(src) {
  if (!src || typeof src !== "string") return "";
  // Remove leading ./ to keep paths consistent for GitHub Pages
  const cleaned = src.replace(/^\.\//, "");
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }
  return cleaned.startsWith("/") ? cleaned : `./${cleaned}`;
}

// === Lightbox ===

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const imgEl = document.getElementById("lightboxImage");
  const captionEl = document.getElementById("lightboxCaption");
  const closeBtn = document.getElementById("lightboxClose");

  function close() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    imgEl.src = "";
    captionEl.textContent = "";
  }

  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("open")) {
      close();
    }
  });

  window._openLightbox = (src, caption) => {
    imgEl.src = src;
    captionEl.textContent = caption || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  };
}

function openLightbox(src, caption) {
  if (typeof window._openLightbox === "function") {
    window._openLightbox(src, caption);
  }
}

// === Blog ===

// === DATA LOADING ===

async function loadJsonData(path) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load data from ${path}: ${response.status}`);
    }
    const data = await response.json();
    return data.posts || [];
  } catch (err) {
    console.error(`Error loading data from ${path}:`, err);
    return [];
  }
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
}

function renderPosts(posts, mainContentEl) {
  // Remove then re-add fade-in class to trigger animation
  mainContentEl.classList.remove("fade-in");
  // Trigger reflow
  void mainContentEl.offsetWidth;
  mainContentEl.classList.add("fade-in");

  mainContentEl.innerHTML = "";

  if (!posts || posts.length === 0) {
    mainContentEl.innerHTML = '<p class="status-message">No content found.</p>';
    return;
  }

  // Sort by date, newest first (if dates exist)
  const sortedPosts = [...posts].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date) - new Date(a.date);
  });

  const container = document.createElement("div");
  container.className = "blog-container";

  sortedPosts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "blog-post";

    // Date
    if (post.date) {
      const dateEl = document.createElement("div");
      dateEl.className = "blog-post-date";
      dateEl.textContent = formatDate(post.date);
      article.appendChild(dateEl);
    }

    // Title
    if (post.title) {
      const titleEl = document.createElement("h2");
      titleEl.className = "blog-post-title";
      titleEl.textContent = post.title;
      article.appendChild(titleEl);
    }

    // Text
    if (post.text) {
      const textEl = document.createElement("div");
      textEl.className = "blog-post-text";
      textEl.textContent = post.text;
      article.appendChild(textEl);
    }

    // Highlights (specific to About if needed, but rendered in blog style)
    if (post.highlights && post.highlights.length > 0) {
      const highlightsList = document.createElement("ul");
      highlightsList.className = "about-highlights"; // Keep class for possible specific styling, but it's inside .blog-post now
      post.highlights.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        highlightsList.appendChild(li);
      });
      article.appendChild(highlightsList);
    }

    // Photos
    if (post.photos && post.photos.length > 0) {
      const photosContainer = document.createElement("div");
      photosContainer.className = "blog-post-photos";
      if (post.photos.length === 1) {
        photosContainer.classList.add("single-photo");
      }

      post.photos.forEach((photo) => {
        const photoWrapper = document.createElement("div");
        photoWrapper.className = "blog-post-photo";

        const img = document.createElement("img");
        img.src = normalizePhotoSrc(photo.src);
        img.alt = photo.alt || post.title || "";
        img.loading = "lazy";

        photoWrapper.appendChild(img);
        photosContainer.appendChild(photoWrapper);

        // Click to open lightbox
        photoWrapper.addEventListener("click", () => {
          const caption = photo.alt || post.title || "";
          openLightbox(img.src, caption);
        });
      });

      article.appendChild(photosContainer);
    }

    container.appendChild(article);
  });

  mainContentEl.appendChild(container);
}

function showBlogSection(statusEl, mainContentEl) {
  setStatusMessage(statusEl, "Loading blog posts…");

  loadJsonData(BLOG_JSON_PATH)
    .then((posts) => {
      setStatusMessage(statusEl, "");
      renderPosts(posts, mainContentEl);
    })
    .catch((err) => {
      console.error(err);
      setStatusMessage(statusEl, "Could not load blog posts.");
    });
}

// === Theme handling removed, site follows system preference via CSS ===
