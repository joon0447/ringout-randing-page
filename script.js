const root = document.documentElement;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const progressBar = document.querySelector(".scroll-progress span");
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");

let ticking = false;

const updateScrollState = () => {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const pageProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;
  if (progressBar) {
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, pageProgress))})`;
  }
  if (header) header.classList.toggle("is-scrolled", scrollTop > 20);

  if (!prefersReducedMotion && hero) {
    const heroProgress = Math.min(1, Math.max(0, scrollTop / Math.max(hero.offsetHeight, 1)));
    document.documentElement.style.setProperty("--hero-progress", heroProgress.toFixed(3));
  }

  ticking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollState);
      ticking = true;
    }
  },
  { passive: true },
);

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    target.setAttribute("tabindex", "-1");
    window.setTimeout(() => target.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 650);
  });
});

const appStoreDialog = document.querySelector("#app-store-dialog");
const appStoreDialogTriggers = document.querySelectorAll("[data-app-store-dialog]");
const appStoreDialogConfirm = appStoreDialog?.querySelector(".app-store-dialog-confirm");
let appStoreDialogTrigger = null;

appStoreDialogTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    appStoreDialogTrigger = trigger;
    if (!appStoreDialog?.open) appStoreDialog?.showModal();
    appStoreDialogConfirm?.focus();
  });
});

appStoreDialog?.addEventListener("click", (event) => {
  if (event.target === appStoreDialog) appStoreDialog.close();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !appStoreDialog?.open) return;
  event.preventDefault();
  appStoreDialog.close();
});

appStoreDialog?.addEventListener("close", () => {
  appStoreDialogTrigger?.focus();
  appStoreDialogTrigger = null;
});

root.classList.add("js-ready");
window.setTimeout(() => {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}, 2200);

updateScrollState();
