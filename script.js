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
  "내일 아침에 시작할 일을 정해요.",
  "계획한 곳을 향한 움직임을 확인해요.",
  "도착하지 못하면 알람과 제한 시간이 다시 시작돼요.",
  "목표 지점에 도착하면 오늘의 계획 시작.",
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

const counters = document.querySelectorAll("[data-count]");

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        const target = Number(element.dataset.count);
        const duration = 900;
        const startedAt = performance.now();

        const count = (now) => {
          const elapsed = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - elapsed, 3);
          element.textContent = String(Math.round(target * eased));
          if (elapsed < 1) window.requestAnimationFrame(count);
        };

        element.textContent = "0";
        window.requestAnimationFrame(count);
        observer.unobserve(element);
      });
    },
    { threshold: 0.55 },
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

const preorderDialog = document.querySelector("#preorder-dialog");
const preorderOpeners = document.querySelectorAll("[data-open-preorder]");
const preorderForm = document.querySelector("#preorder-form");
const preorderEmail = document.querySelector("#preorder-email");
const preorderConsent = document.querySelector("#preorder-consent");
const preorderStatus = document.querySelector("#preorder-form-status");
const preorderFormContent = document.querySelector(".preorder-form-content");
const preorderSuccess = document.querySelector(".preorder-success");
const preorderSubmit = preorderForm?.querySelector('button[type="submit"]');
const preorderEndpoint =
  "https://script.google.com/macros/s/AKfycbwtDVfxKb3Zh0cTws2I4-x0luVHfStfmb3K6TPvQF0fImtsekkMHPu2AS6P3fJ8Z66Idw/exec";
const isLocalPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname);
let activeButtonLocation = "unknown";

const getSessionId = () => {
  const storageKey = "ringout_preorder_session";

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) return stored;

    const created = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(storageKey, created);
    return created;
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

const sessionId = getSessionId();

const createPreorderPayload = (event, extra = {}) => {
  const query = new URLSearchParams(window.location.search);

  return {
    event,
    sessionId,
    buttonLocation: activeButtonLocation,
    pageUrl: window.location.href,
    referrer: document.referrer,
    utmSource: query.get("utm_source") || "",
    utmMedium: query.get("utm_medium") || "",
    utmCampaign: query.get("utm_campaign") || "",
    ...extra,
  };
};

const sendPreorderEvent = async (payload) => {
  if (isLocalPreview) return { local: true };

  await window.fetch(preorderEndpoint, {
    method: "POST",
    mode: "no-cors",
    keepalive: true,
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify(payload),
  });

  return { local: false };
};

void sendPreorderEvent(
  createPreorderPayload("page_view", { buttonLocation: "page_load" }),
).catch(() => {});

const resetPreorderDialog = () => {
  preorderForm?.reset();
  preorderEmail?.removeAttribute("aria-invalid");
  preorderStatus.textContent = "";
  preorderStatus.removeAttribute("data-tone");
  preorderFormContent.hidden = false;
  preorderSuccess.hidden = true;

  if (preorderSubmit) {
    preorderSubmit.disabled = false;
    preorderSubmit.textContent = "출시 소식 받기";
  }
};

if (preorderDialog) {
  preorderOpeners.forEach((opener) => {
    opener.addEventListener("click", (event) => {
      event.preventDefault();
      activeButtonLocation = opener.dataset.buttonLocation || "unknown";
      resetPreorderDialog();
      preorderDialog.showModal();
      document.body.classList.add("has-open-dialog");
      void sendPreorderEvent(createPreorderPayload("preorder_click")).catch(() => {});
    });
  });

  preorderDialog.querySelectorAll("[data-close-preorder]").forEach((button) => {
    button.addEventListener("click", () => preorderDialog.close());
  });

  preorderForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = preorderEmail.value.trim().toLowerCase();

    preorderEmail.removeAttribute("aria-invalid");
    preorderStatus.removeAttribute("data-tone");

    if (!preorderEmail.checkValidity()) {
      preorderEmail.setAttribute("aria-invalid", "true");
      preorderStatus.textContent = "올바른 이메일 주소를 입력해 주세요.";
      preorderEmail.focus();
      return;
    }

    if (!preorderConsent.checked) {
      preorderStatus.textContent = "개인정보 수집 및 이용 동의가 필요합니다.";
      preorderConsent.focus();
      return;
    }

    const website = preorderForm.elements.website.value;
    preorderSubmit.disabled = true;
    preorderSubmit.textContent = "제출 중...";
    preorderStatus.textContent = "";

    try {
      const result = await sendPreorderEvent(
        createPreorderPayload("preorder_submit", {
          email,
          consent: true,
          website,
        }),
      );

      if (result.local) {
        preorderStatus.dataset.tone = "info";
        preorderStatus.textContent =
          "로컬 미리보기에서는 저장되지 않아요. 배포된 사이트에서 제출하면 Google Sheets에 기록됩니다.";
        preorderSubmit.disabled = false;
        preorderSubmit.textContent = "출시 소식 받기";
        return;
      }

      preorderFormContent.hidden = true;
      preorderSuccess.hidden = false;
      preorderSuccess.querySelector("button")?.focus();
    } catch {
      preorderStatus.textContent = "전송하지 못했어요. 잠시 후 다시 시도해 주세요.";
      preorderSubmit.disabled = false;
      preorderSubmit.textContent = "출시 소식 받기";
    }
  });

  preorderDialog.addEventListener("close", () => {
    document.body.classList.remove("has-open-dialog");
  });

  preorderDialog.addEventListener("click", (event) => {
    const bounds = preorderDialog.getBoundingClientRect();
    const isBackdrop =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (isBackdrop) preorderDialog.close();
  });
}

document.querySelectorAll('a[href^="#"]:not([data-open-preorder])').forEach((link) => {
  link.addEventListener("click", () => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    target.setAttribute("tabindex", "-1");
    window.setTimeout(() => target.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 650);
  });
});

updateScrollState();
