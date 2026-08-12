document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const progressBar = document.querySelector(".scroll-progress span");
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const journeyVisual = document.querySelector(".journey-visual");
const journeySteps = [...document.querySelectorAll(".journey-step")];
const visualStepNumber = document.querySelector(".visual-caption b");
const visualCaption = document.querySelector(".visual-caption p");
const captions = [
  "알람, 제한 시간, 목표 지점을 설정해요.",
  "알람을 끄면 목표 지점 미션이 시작돼요.",
  "시간 안에 도착하지 못하면 알람이 다시 울려요.",
  "목표 지점 반경에 들어오면 오늘의 미션 완료.",
];

let ticking = false;

const updateScrollState = () => {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const pageProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;
  progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, pageProgress))})`;
  header.classList.toggle("is-scrolled", scrollTop > 20);

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

const setJourneyStep = (step) => {
  journeyVisual.dataset.activeStep = String(step);
  journeySteps.forEach((item) => item.classList.toggle("is-active", Number(item.dataset.step) === step));
  visualStepNumber.textContent = String(step + 1).padStart(2, "0");
  visualCaption.textContent = captions[step];
};

if (journeyVisual && "IntersectionObserver" in window) {
  const stepObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) setJourneyStep(Number(visible.target.dataset.step));
    },
    { threshold: [0.25, 0.45, 0.65], rootMargin: "-25% 0px -35% 0px" },
  );

  journeySteps.forEach((step) => stepObserver.observe(step));
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    target.setAttribute("tabindex", "-1");
    window.setTimeout(() => target.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 650);
  });
});

updateScrollState();
