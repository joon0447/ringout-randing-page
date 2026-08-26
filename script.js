const root = document.documentElement;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const progressBar = document.querySelector(".scroll-progress span");
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const journeySequence = document.querySelector("[data-journey-sequence]");
const journeyStage = journeySequence?.querySelector(".journey-stage");
const journeyPanels = [...(journeySequence?.querySelectorAll("[data-journey-panel]") ?? [])];
const journeyTimelineUnits = Math.max(journeyPanels.length - 1, 0);

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
};

const getJourneyTimeline = () => {
  if (!journeySequence || !journeyStage) return 0;

  const stageTop = Number.parseFloat(window.getComputedStyle(journeyStage).top) || 0;
  const trackRect = journeySequence.getBoundingClientRect();
  const scrollDistance = Math.max(journeySequence.offsetHeight - journeyStage.offsetHeight, 1);
  const trackProgress = clamp((stageTop - trackRect.top) / scrollDistance);
  return trackProgress * journeyTimelineUnits;
};

const setJourneySequenceState = () => {
  if (!journeySequence || !journeyStage || journeyPanels.length === 0) return;
  if (prefersReducedMotion) return;

  const timeline = getJourneyTimeline();
  const transitionIndex = Math.min(Math.floor(timeline), journeyTimelineUnits);
  let activePanelIndex = transitionIndex;
  let activePanelOpacity = 1;

  if (transitionIndex < journeyTimelineUnits) {
    const localProgress = timeline - transitionIndex;
    const transitionProgress = clamp((localProgress - 0.14) / 0.72);

    if (transitionProgress < 0.5) {
      const exitProgress = smoothstep(transitionProgress * 2);
      activePanelOpacity = 1 - exitProgress;
    } else {
      const entryProgress = smoothstep((transitionProgress - 0.5) * 2);
      activePanelIndex = transitionIndex + 1;
      activePanelOpacity = entryProgress;
    }
  }

  journeyPanels.forEach((panel, index) => {
    const isActive = index === activePanelIndex;
    const panelOpacity = isActive ? activePanelOpacity : 0;

    panel.style.setProperty("--journey-panel-opacity", panelOpacity.toFixed(3));
    panel.classList.toggle("is-active", isActive);
    panel.toggleAttribute("inert", !isActive);
    if (isActive) panel.removeAttribute("aria-hidden");
    else panel.setAttribute("aria-hidden", "true");
    panel.querySelector(".journey-step")?.classList.toggle("is-active", isActive);
  });
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

  setJourneySequenceState();

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
