const root = document.documentElement;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const progressBar = document.querySelector(".scroll-progress span");
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const journeyVisual = document.querySelector(".journey-visual");
const journeyIntroTrack = document.querySelector("[data-journey-intro]");
const journeyStage = document.querySelector(".journey-stage");

const setJourneyIntroState = () => {
  if (!journeyVisual) return;

  const usePinnedIntro = !prefersReducedMotion && window.innerWidth > 820 && journeyIntroTrack && journeyStage;
  let focusProgress = 0;

  if (usePinnedIntro) {
    const trackRect = journeyIntroTrack.getBoundingClientRect();
    const scrollDistance = Math.max(journeyIntroTrack.offsetHeight - journeyStage.offsetHeight, 1);
    const trackProgress = Math.min(1, Math.max(0, (88 - trackRect.top) / scrollDistance));
    const motionProgress = Math.min(1, Math.max(0, (trackProgress - 0.1) / 0.72));
    focusProgress = motionProgress * motionProgress * (3 - 2 * motionProgress);
  }

  journeyVisual.dataset.activeStep = "0";
  journeyVisual.style.setProperty("--journey-setting-scale", (1.4 + focusProgress * 0.2).toFixed(3));
  journeyVisual.style.setProperty("--journey-setting-shift", `${(focusProgress * 14).toFixed(1)}px`);
  journeyVisual.style.setProperty("--journey-setting-lift", `${(-focusProgress * 40).toFixed(1)}px`);
  journeyVisual.style.setProperty("--journey-map-scale", (1.4 - focusProgress * 0.14).toFixed(3));
  journeyVisual.style.setProperty("--journey-map-drop", `${(focusProgress * 28).toFixed(1)}px`);
  journeyVisual.classList.toggle("is-setting-front", focusProgress >= 0.3);
};

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

  setJourneyIntroState();

  ticking = false;
};

const requestScrollState = () => {
  if (!ticking) {
    window.requestAnimationFrame(updateScrollState);
    ticking = true;
  }
};

window.addEventListener("scroll", requestScrollState, { passive: true });
window.addEventListener("resize", requestScrollState, { passive: true });

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

const storeClickEventNames = {
  app_store: "app_store_click",
  google_play: "google_play_click",
};

document.querySelectorAll("[data-store-click]").forEach((storeButton) => {
  storeButton.addEventListener("click", () => {
    const eventName = storeClickEventNames[storeButton.dataset.storeClick];
    if (eventName && typeof window.gtag === "function") {
      window.gtag("event", eventName);
    }
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
