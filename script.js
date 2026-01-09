// === CONFIGURATION ===
const BLOG_JSON_PATH = "blog.json";
const LINK_BUTTONS = [
  { label: "Instagram", href: "https://www.instagram.com/arindavoodian", newTab: true },
];
const ABOUT_CONTENT = {
  heading: "About Me",
  paragraphs: [
    "I'm an Apple platforms engineer currently working on Xcode tools and frameworks, spending most of my day inside Swift, Xcode, Sketch, and the abstractions that make shipping code faster. I focus on pairing intentional product decisions with platform-specific craftsmanship so each interaction feels purposeful.",
    "Before Apple I architected and delivered customer-and-pro ecosystems such as Mizo, Uhoh, Point Automotive, and Migo across iOS, macOS, tvOS, and watchOS. Those programs required me to own user experience design, Swift implementation, build pipelines, and App Store delivery end to end—often including the supporting marketing sites and galleries you see here.",
    "My technical toolkit spans location services, real-time backends with Firestore and Auth, AVFoundation media capture, VIN scanning/decoding, and the admin tooling that keeps operations running smoothly. I gravitate toward simplifying complex, multi-step workflows for people on the go.",
    "Outside of code I'm usually reading the news, sharing observations on Twitter, or experimenting with the next idea I want to build.",
  ],
  highlights: [
    "Current role: Xcode tools and frameworks engineer at Apple",
    "Delivered paired customer/pro apps for marketplaces and on-demand services",
    "Fluent in SwiftUI/UIKit, real-time data sync, media capture, and distribution pipelines",
    "Blend design, tooling, and platform knowledge to deliver polished releases",
  ],
};


document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const galleryEl = document.getElementById("gallery");
  const aboutButton = document.getElementById("aboutButton");
  const blogButton = document.getElementById("blogButton");
  const linkButtonsEl = document.getElementById("linkButtons");

  renderLinkButtons(LINK_BUTTONS, linkButtonsEl);

  // Blog button handler
  blogButton?.addEventListener("click", () => {
    blogButton.classList.add("active");
    aboutButton?.classList.remove("active");
    showBlogSection(statusEl, galleryEl);
  });

  aboutButton?.addEventListener("click", () => {
    aboutButton.classList.add("active");
    blogButton?.classList.remove("active");
    showAboutSection(statusEl, galleryEl);
  });

  // Lightbox handling
  initLightbox();

  // Load blog by default
  blogButton?.classList.add("active");
  showBlogSection(statusEl, galleryEl);
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

function showAboutSection(statusEl, galleryEl) {
  if (!statusEl || !galleryEl) {
    return;
  }
  setStatusMessage(statusEl, "");
  galleryEl.classList.add("about-view");
  const { heading, paragraphs = [], highlights = [] } = ABOUT_CONTENT;
  const paragraphsHtml = paragraphs
    .map((text) => `<p>${text}</p>`)
    .join("\n");
  const highlightsHtml = highlights.length
    ? `<ul class="about-highlights">${highlights
      .map((item) => `<li>${item}</li>`)
      .join("")}</ul>`
    : "";
  galleryEl.innerHTML = `
    <article class="about-card">
      <h3>${heading}</h3>
      ${paragraphsHtml}
      ${highlightsHtml}
    </article>
  `;
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

async function loadBlogPosts() {
  try {
    const response = await fetch(BLOG_JSON_PATH, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load blog posts: ${response.status}`);
    }
    const data = await response.json();
    return data.posts || [];
  } catch (err) {
    console.error("Error loading blog posts:", err);
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

function renderBlogPosts(posts, galleryEl) {
  galleryEl.classList.remove("about-view");
  galleryEl.innerHTML = "";

  if (!posts || posts.length === 0) {
    galleryEl.innerHTML = '<p class="status-message">No blog posts yet.</p>';
    return;
  }

  // Sort by date, newest first
  const sortedPosts = [...posts].sort((a, b) => {
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

  galleryEl.appendChild(container);
}

function showBlogSection(statusEl, galleryEl) {
  setStatusMessage(statusEl, "Loading blog posts…");

  loadBlogPosts()
    .then((posts) => {
      setStatusMessage(statusEl, "");
      renderBlogPosts(posts, galleryEl);
    })
    .catch((err) => {
      console.error(err);
      setStatusMessage(statusEl, "Could not load blog posts.");
    });
}

// === Theme handling removed, site follows system preference via CSS ===
