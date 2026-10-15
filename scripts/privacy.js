"use strict";

/** Apenas uma preferência de interface; nenhum identificador de visitante é criado. */
function initializePrivacy() {
  const cookieName = "portfolio_privacy";
  const notice = document.querySelector("#privacy-notice");
  const dialog = document.querySelector("#privacy-dialog");
  const acknowledge = document.querySelector("#privacy-acknowledge");
  const status = document.querySelector("#privacy-status");
  let returnFocus;

  function hasAcknowledged() {
    try {
      return document.cookie
        .split(";")
        .some((entry) => entry.trim() === `${cookieName}=acknowledged`);
    } catch {
      // Navegadores com armazenamento bloqueado continuam exibindo a política.
      return false;
    }
  }

  notice.hidden = hasAcknowledged();
  acknowledge.addEventListener("click", () => {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    try {
      document.cookie = `${cookieName}=acknowledged; Max-Age=15552000; Path=/; SameSite=Strict${secure}`;
    } catch {
      /* A leitura do site não depende da permissão para gravar cookies. */
    }
    notice.hidden = true;
    status.textContent = hasAcknowledged()
      ? "Aviso de privacidade fechado. Sua escolha é lembrada por até 180 dias."
      : "Aviso fechado nesta visita. O navegador não permitiu guardar a preferência.";
    document.querySelector(".footer-privacy").focus({ preventScroll: true });
  });

  document.querySelectorAll("[data-open-privacy]").forEach((button) => {
    button.hidden = false;
    button.addEventListener("click", () => {
      returnFocus = button;
      dialog.showModal();
    });
  });
  document.querySelector("#privacy-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => returnFocus?.focus({ preventScroll: true }));

  document.querySelector("#privacy-reset").addEventListener("click", () => {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    try {
      document.cookie = `${cookieName}=; Max-Age=0; Path=/; SameSite=Strict${secure}`;
    } catch {
      /* Armazenamento já indisponível: basta reexibir o aviso. */
    }
    notice.hidden = false;
    returnFocus = acknowledge;
    dialog.close();
    acknowledge.focus();
    status.textContent = "Preferência removida. O aviso de privacidade será exibido novamente.";
  });
}

initializePrivacy();
