"use strict";

/** Menu mobile: navegação funciona normalmente mesmo sem JavaScript. */
function initializeNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-nav");
  const mobileViewport = window.matchMedia("(max-width: 760px)");

  function setMenuOpen(isOpen) {
    toggle.setAttribute("aria-expanded", String(isOpen));
    navigation.hidden = !isOpen;
    toggle.querySelector("span").textContent = isOpen ? "−" : "＋";
  }

  function synchronizeViewport() {
    toggle.hidden = !mobileViewport.matches;
    setMenuOpen(!mobileViewport.matches);
  }

  toggle.addEventListener("click", () => {
    setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  navigation.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (mobileViewport.matches && link) {
      setMenuOpen(false);
      const destination = document.querySelector(link.hash);
      destination.tabIndex = -1;
      destination.focus({ preventScroll: true });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileViewport.matches && !navigation.hidden) {
      setMenuOpen(false);
      toggle.focus();
    }
  });

  mobileViewport.addEventListener("change", synchronizeViewport);
  synchronizeViewport();
}

/** aria-current acompanha a seção em leitura sem alterar o histórico da página. */
function initializeActiveSection() {
  if (!("IntersectionObserver" in window)) return;
  const links = [...document.querySelectorAll(".main-nav a")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const observer = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries.find((entry) => entry.isIntersecting);
      if (!visibleSection) return;
      links.forEach((link) => {
        if (link.hash === `#${visibleSection.target.id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    { rootMargin: "-15% 0px -55% 0px", threshold: 0 }
  );
  sections.forEach((section) => observer.observe(section));
}

function initializeProjectGalleries() {
  const dialog = document.querySelector("#image-dialog");
  const expandedImage = document.querySelector("#image-dialog-image");
  let returnFocus;
  document.querySelector("#image-dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => returnFocus?.focus({ preventScroll: true }));

  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const image = gallery.querySelector(".gallery-image");
    const controls = gallery.querySelector(".gallery-controls");
    const caption = gallery.querySelector(".gallery-caption");
    const expand = gallery.querySelector(".gallery-expand");
    controls.hidden = false;
    expand.hidden = false;
    expand.addEventListener("click", () => {
      expandedImage.src = image.src;
      expandedImage.alt = image.alt;
      expandedImage.hidden = false;
      document.querySelector("#image-dialog-title").textContent = caption.textContent.trim();
      returnFocus = expand;
      dialog.showModal();
    });
    controls.addEventListener("click", (event) => {
      const selectedButton = event.target.closest("button[data-image]");
      if (!selectedButton) return;
      image.src = selectedButton.dataset.image;
      image.alt = selectedButton.dataset.alt;
      caption.textContent = selectedButton.dataset.description;
      controls.querySelectorAll("button").forEach((button) => {
        button.setAttribute("aria-pressed", String(button === selectedButton));
      });
    });
  });
}

/** Falhas de permissão para clipboard não impedem o contato por e-mail. */
function initializeCopyEmail() {
  const button = document.querySelector(".copy-email");
  const status = document.querySelector("#copy-status");
  if (!navigator.clipboard?.writeText) return;
  button.hidden = false;
  let resetTimer;

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.email);
      button.textContent = "Copiado ✓";
      status.textContent = "Endereço de e-mail copiado.";
    } catch {
      button.textContent = "Selecione o e-mail";
      status.textContent = "Não foi possível copiar. Selecione o endereço ou use o link de e-mail.";
    }
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      button.textContent = "Copiar ⧉";
    }, 3000);
  });
}

initializeNavigation();
initializeActiveSection();
initializeProjectGalleries();
initializeCopyEmail();
document.querySelector("[data-year]").textContent = String(new Date().getFullYear());
