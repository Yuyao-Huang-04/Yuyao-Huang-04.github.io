const navigationLinks = document.querySelectorAll(".nav-link");
const resumeNavigationLinks = document.querySelectorAll(".resume-nav-link");
const resumeSections = document.querySelectorAll(".resume-section");
const pageViews = document.querySelectorAll(".page-view");
const resumeView = document.getElementById("resume");
const fallbackPage = "home";
const availablePages = new Set(
  Array.from(pageViews, (view) => view.id)
);
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const setActiveResumeSection = (sectionId) => {
  resumeNavigationLinks.forEach((link) => {
    const isCurrentSection = link.dataset.section === sectionId;

    link.classList.toggle("is-active", isCurrentSection);

    if (isCurrentSection) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const showPage = () => {
  const [requestedPage, requestedSection] = window.location.hash
    .slice(1)
    .toLowerCase()
    .split("/");
  const currentPage = availablePages.has(requestedPage)
    ? requestedPage
    : fallbackPage;

  pageViews.forEach((view) => {
    view.hidden = view.id !== currentPage;
  });

  navigationLinks.forEach((link) => {
    const isCurrentPage = link.dataset.page === currentPage;

    link.classList.toggle("is-active", isCurrentPage);

    if (isCurrentPage) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  setActiveResumeSection(
    currentPage === "resume" ? requestedSection : null
  );

  document.body.dataset.page = currentPage;

  const activeView = document.getElementById(currentPage);
  document.title = `${activeView.dataset.title} | Personal Page`;

  const requestedTarget = requestedSection
    ? document.getElementById(requestedSection)
    : null;
  const isResumeTarget =
    currentPage === "resume" &&
    requestedTarget &&
    resumeView.contains(requestedTarget);

  window.requestAnimationFrame(() => {
    if (isResumeTarget) {
      requestedTarget.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  });
};

let resumeScrollFrame = null;

const updateResumeSectionFromScroll = () => {
  resumeScrollFrame = null;

  if (document.body.dataset.page !== "resume") {
    return;
  }

  const rootStyles = window.getComputedStyle(document.documentElement);
  const headerHeight = parseFloat(
    rootStyles.getPropertyValue("--header-height")
  );
  const resumeNavHeight = parseFloat(
    rootStyles.getPropertyValue("--resume-nav-height")
  );
  const activationLine = headerHeight + resumeNavHeight + 24;
  let activeSectionId = null;

  resumeSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= activationLine) {
      activeSectionId = section.id;
    }
  });

  if (activeSectionId) {
    setActiveResumeSection(activeSectionId);
  }
};

const requestResumeSectionUpdate = () => {
  if (resumeScrollFrame !== null) {
    return;
  }

  resumeScrollFrame = window.requestAnimationFrame(
    updateResumeSectionFromScroll
  );
};

resumeNavigationLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (window.location.hash !== link.getAttribute("href")) {
      return;
    }

    event.preventDefault();
    const target = document.getElementById(link.dataset.section);
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  });
});

window.addEventListener("hashchange", showPage);
window.addEventListener("scroll", requestResumeSectionUpdate, { passive: true });
window.addEventListener("resize", requestResumeSectionUpdate);
showPage();
