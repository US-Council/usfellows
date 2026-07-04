const menuToggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
const mobilePanel = document.querySelector<HTMLElement>(".mobile-panel");
const mobileClose = document.querySelector<HTMLButtonElement>(".mobile-close");

function setMobilePanel(open: boolean): void {
  if (!menuToggle || !mobilePanel || !mobileClose) return;

  mobilePanel.classList.toggle("is-open", open);
  mobilePanel.setAttribute("aria-hidden", String(!open));
  menuToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
  (open ? mobileClose : menuToggle).focus();
}

menuToggle?.addEventListener("click", () => setMobilePanel(true));
mobileClose?.addEventListener("click", () => setMobilePanel(false));

document.addEventListener("keydown", (event) => {
  if (!mobilePanel?.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    setMobilePanel(false);
    return;
  }

  if (event.key !== "Tab") return;
  const focusable = Array.from(
    mobilePanel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
  );
  const first = focusable.at(0);
  const last = focusable.at(-1);

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});

document.querySelectorAll<HTMLButtonElement>(".mobile-nav .has-menu > button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest("li");
    const open = item?.classList.toggle("is-open") ?? false;
    button.setAttribute("aria-expanded", String(open));
  });
});

document.querySelectorAll<HTMLElement>(".desktop-nav .has-menu").forEach((item) => {
  const link = item.querySelector<HTMLAnchorElement>(":scope > a");
  if (!link) return;

  const setOpen = (open: boolean) => {
    item.classList.toggle("is-open", open);
    link.setAttribute("aria-expanded", String(open));
  };

  item.addEventListener("mouseenter", () => setOpen(true));
  item.addEventListener("mouseleave", () => setOpen(false));
  item.addEventListener("focusin", () => setOpen(true));
  item.addEventListener("focusout", (event) => {
    if (!item.contains(event.relatedTarget as Node | null)) setOpen(false);
  });
  item.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      link.focus();
    }
  });
});

const siteHeader = document.querySelector<HTMLElement>("#site-header");
const headerSpacer = document.querySelector<HTMLElement>(".header-spacer");

function updateStickyHeader(): void {
  if (!siteHeader) return;
  const fixed = window.scrollY > 42;
  siteHeader.classList.toggle("is-sticky", fixed);
  headerSpacer?.classList.toggle("is-active", fixed);
}

updateStickyHeader();
window.addEventListener("scroll", updateStickyHeader, { passive: true });
