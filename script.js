const root = document.documentElement;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const progressBar = document.querySelector(".scroll-progress span");
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const journeyVisual = document.querySelector(".journey-visual");
const journeyStepItems = [...document.querySelectorAll(".journey-step")];

const journeyScenes = [
  { settingScale: 1.4, settingShift: 0, settingLift: 0, mapScale: 1.4, mapDrop: 0, front: "map" },
  { settingScale: 1.42, settingShift: 4, settingLift: -16, mapScale: 1.34, mapDrop: 12, front: "map" },
  { settingScale: 1.498, settingShift: 16, settingLift: -42, mapScale: 1.274, mapDrop: 30, front: "setting" },
  { settingScale: 1.39, settingShift: 0, settingLift: 8, mapScale: 1.47, mapDrop: -18, front: "map" },
];

let journeyStepObserver = null;
let activeJourneyStep = -1;

const setJourneyScene = (stepIndex) => {
  if (!journeyVisual || !journeyStepItems.length) return;

  const scene = journeyScenes[stepIndex] ?? journeyScenes[0];
  journeyVisual.dataset.activeStep = String(stepIndex);
  journeyVisual.style.setProperty("--journey-setting-scale", String(scene.settingScale));
  journeyVisual.style.setProperty("--journey-setting-shift", `${scene.settingShift}px`);
  journeyVisual.style.setProperty("--journey-setting-lift", `${scene.settingLift}px`);
  journeyVisual.style.setProperty("--journey-map-scale", String(scene.mapScale));
  journeyVisual.style.setProperty("--journey-map-drop", `${scene.mapDrop}px`);
  journeyVisual.classList.toggle("is-setting-front", scene.front === "setting");
  journeyStepItems.forEach((step, index) => step.classList.toggle("is-active", index === stepIndex));
  activeJourneyStep = stepIndex;
};

const configureJourneyScenes = () => {
  const usePinnedJourney = !prefersReducedMotion && window.innerWidth > 820 && "IntersectionObserver" in window;

  if (!usePinnedJourney) {
    journeyStepObserver?.disconnect();
    journeyStepObserver = null;
    setJourneyScene(0);
    return;
  }

  if (journeyStepObserver) return;

  journeyStepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const stepIndex = journeyStepItems.indexOf(entry.target);
        if (stepIndex !== -1 && stepIndex !== activeJourneyStep) setJourneyScene(stepIndex);
      });
    },
    { rootMargin: "-42% 0px -42% 0px", threshold: 0 },
  );

  journeyStepItems.forEach((step) => journeyStepObserver.observe(step));
  setJourneyScene(0);
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

  ticking = false;
};

const requestScrollState = () => {
  if (!ticking) {
    window.requestAnimationFrame(updateScrollState);
    ticking = true;
  }
};

window.addEventListener("scroll", requestScrollState, { passive: true });
window.addEventListener(
  "resize",
  () => {
    configureJourneyScenes();
    requestScrollState();
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

configureJourneyScenes();
updateScrollState();
