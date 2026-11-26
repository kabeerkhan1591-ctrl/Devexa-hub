(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  window.addEventListener("load", () => {
    setTimeout(
      () => {
        body.classList.add("done");
        setTimeout(() => body.classList.add("ready"), 450);
      },
      calm ? 0 : 1500,
    );
  });

  const nav = $("#nav");
  const progress = $("#progress");
  const heroMark = $("#heroMark");
  let lastY = window.scrollY;
  let peak = lastY;

  function updateNav(y) {
    nav.classList.toggle("solid", y > 30);
    if (body.classList.contains("open") || y <= 20) {
      nav.classList.remove("hide");
      peak = y;
    } else if (y > lastY) {
      nav.classList.add("hide");
      peak = y;
    } else if (y < lastY && peak - y >= 2) {
      nav.classList.remove("hide");
    }
    lastY = y;
  }

  const burger = $("#burger");
  const sheet = $("#sheet");

  function setMenu(open) {
    body.classList.toggle("open", open);
    body.classList.toggle("lock", open);
    sheet.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) nav.classList.remove("hide");
  }

  burger.addEventListener("click", () => {
    setMenu(!body.classList.contains("open"));
  });
  $$("#sheet a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  const track = $("#track");
  track.innerHTML += track.innerHTML;

  const statement = $("#statement");
  (function splitWords(parent) {
    Array.from(parent.childNodes).forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }
        const word = document.createElement("span");
        word.className = "word";
        word.textContent = part;
        fragment.appendChild(word);
      });
      node.replaceWith(fragment);
    });
  })(statement);

  const words = $$(".word");
  const steps = $("#steps");
  let ticking = false;

  function onFrame() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    updateNav(y);
    const max = document.documentElement.scrollHeight - vh;
    progress.style.setProperty("--s", max > 0 ? y / max : 0);
    if (!calm && y < vh * 1.3) {
      heroMark.style.translate = `0 ${y * 0.18}px`;
    }
    const rect = statement.getBoundingClientRect();
    const amount = calm
      ? 1
      : clamp((vh * 0.85 - rect.top) / (rect.height + vh * 0.3));
    const visible = Math.round(amount * words.length);
    words.forEach((word, index) => word.classList.toggle("on", index < visible));
    const stepsRect = steps.getBoundingClientRect();
    steps.style.setProperty(
      "--p",
      clamp((vh * 0.8 - stepsRect.top) / (stepsRect.height + 40)),
    );
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onFrame);
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", onFrame);
  onFrame();

  const revealItems = $$(".rv");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("in"));
  }

  $$(".btn, .mail").forEach((element) => {
    Array.from(element.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const text = node.textContent.trim();
        const roll = document.createElement("span");
        roll.className = "roll";
        roll.innerHTML = `<span class="roll-in"><i>${text}</i><i aria-hidden="true">${text}</i></span>`;
        node.replaceWith(roll);
      }
    });
  });

  if (window.matchMedia("(hover: hover)").matches && !calm) {
    const cursor = $("#cursor");
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;

    const follow = () => {
      x += (targetX - x) * 0.2;
      y += (targetY - y) * 0.2;
      cursor.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(follow);
    };

    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.classList.add("on");
    });
    document.addEventListener("pointerleave", () => {
      cursor.classList.remove("on");
    });
    $$("a, button, .svc").forEach((element) => {
      element.addEventListener("pointerenter", () => {
        cursor.classList.add("big");
      });
      element.addEventListener("pointerleave", () => {
        cursor.classList.remove("big");
      });
    });
    follow();

    $$("[data-mag]").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        element.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
      });
      element.addEventListener("pointerleave", () => {
        element.style.transform = "";
      });
    });
  }

  $("#form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = `New project enquiry from ${name}`;
    const message = `${form.message.value}\n\n— ${name} (${email})`;
    window.location.href = `mailto:kabeerkhan1591@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    form.reset();
  });
})();
