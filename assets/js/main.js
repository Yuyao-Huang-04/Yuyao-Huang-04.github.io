const navigationLinks = document.querySelectorAll(".nav-link");
const resumeNavigationLinks = document.querySelectorAll(".resume-nav-link");
const resumeSections = document.querySelectorAll(".resume-section");
const aboutNavigationLinks = document.querySelectorAll(".about-nav-link");
const aboutSections = document.querySelectorAll(".about-module");
const pageViews = document.querySelectorAll(".page-view");
const resumeView = document.getElementById("resume");
const aboutView = document.getElementById("about");
const fallbackPage = "home";
const availablePages = new Set(
  Array.from(pageViews, (view) => view.id)
);
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const setActiveSection = (links, sectionId) => {
  links.forEach((link) => {
    const isCurrentSection = link.dataset.section === sectionId;

    link.classList.toggle("is-active", isCurrentSection);

    if (isCurrentSection) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const setActiveResumeSection = (sectionId) => {
  setActiveSection(resumeNavigationLinks, sectionId);
};

const setActiveAboutSection = (sectionId) => {
  setActiveSection(aboutNavigationLinks, sectionId);
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
  setActiveAboutSection(
    currentPage === "about" ? requestedSection : null
  );

  document.body.dataset.page = currentPage;

  const activeView = document.getElementById(currentPage);
  document.title =
    currentPage === "home"
      ? "Yuyao Huang"
      : `${activeView.dataset.title} | Yuyao Huang`;

  const requestedTarget = requestedSection
    ? document.getElementById(requestedSection)
    : null;
  const isSectionTarget =
    requestedTarget &&
    ((currentPage === "resume" && resumeView.contains(requestedTarget)) ||
      (currentPage === "about" && aboutView.contains(requestedTarget)));

  window.requestAnimationFrame(() => {
    if (isSectionTarget) {
      requestedTarget.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  });
};

let sectionScrollFrame = null;

const updateSectionFromScroll = () => {
  sectionScrollFrame = null;

  const currentPage = document.body.dataset.page;
  const sectionConfig =
    currentPage === "resume"
      ? { sections: resumeSections, setActive: setActiveResumeSection }
      : currentPage === "about"
        ? { sections: aboutSections, setActive: setActiveAboutSection }
        : null;

  if (!sectionConfig) {
    return;
  }

  const rootStyles = window.getComputedStyle(document.documentElement);
  const headerHeight = parseFloat(
    rootStyles.getPropertyValue("--header-height")
  );
  const sectionNavHeight = parseFloat(
    rootStyles.getPropertyValue(
      currentPage === "about"
        ? "--about-nav-height"
        : "--resume-nav-height"
    )
  );
  const activationLine = headerHeight + sectionNavHeight + 24;
  let activeSectionId = null;

  sectionConfig.sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= activationLine) {
      activeSectionId = section.id;
    }
  });

  const isAtPageBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2;

  if (isAtPageBottom && sectionConfig.sections.length) {
    activeSectionId = sectionConfig.sections[sectionConfig.sections.length - 1].id;
  }

  if (activeSectionId) {
    sectionConfig.setActive(activeSectionId);
  }
};

const requestSectionUpdate = () => {
  if (sectionScrollFrame !== null) {
    return;
  }

  sectionScrollFrame = window.requestAnimationFrame(
    updateSectionFromScroll
  );
};

const sectionNavigationLinks = [
  ...resumeNavigationLinks,
  ...aboutNavigationLinks,
];

sectionNavigationLinks.forEach((link) => {
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
window.addEventListener("scroll", requestSectionUpdate, { passive: true });
window.addEventListener("resize", requestSectionUpdate);
showPage();
