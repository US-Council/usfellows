/* US Fellows -- Kingster shell interaction layer.
   Dependency-free (no jQuery). Drives the sf-menu/sf-mega megamenu, the
   mobile off-canvas panel, the sticky header, and the homepage crossfade
   hero. The megamenu's open/close is CSS-driven (:hover / :focus-within on
   .menu-item-has-children), so keyboard-tab focus already opens a submenu
   with no JS at all; this file only layers in aria-expanded sync, Escape-
   to-close, and the mobile panel, so the shell degrades gracefully if a
   script fails to load. */
(function () {
  "use strict";

  /* ---------- aria-expanded sync + Escape-to-close on the megamenu ---------- */
  var topItems = document.querySelectorAll(".sf-menu > .menu-item-has-children");

  function closeItem(item) {
    item.classList.remove("is-open");
    var trigger = item.querySelector(":scope > a[aria-haspopup]");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  function openItem(item) {
    item.classList.add("is-open");
    var trigger = item.querySelector(":scope > a[aria-haspopup]");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
  }

  topItems.forEach(function (item) {
    item.addEventListener("mouseenter", function () { openItem(item); });
    item.addEventListener("mouseleave", function () { closeItem(item); });
    item.addEventListener("focusin", function () { openItem(item); });
    item.addEventListener("focusout", function (evt) {
      if (!item.contains(evt.relatedTarget)) closeItem(item);
    });
  });

  document.addEventListener("keydown", function (evt) {
    if (evt.key !== "Escape") return;
    var openEl = document.querySelector(".sf-menu > .menu-item-has-children.is-open");
    if (!openEl) return;
    var trigger = openEl.querySelector(":scope > a");
    closeItem(openEl);
    if (trigger) trigger.focus();
  });

  /* ---------- sticky header shadow ---------- */
  var header = document.getElementById("site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- mobile off-canvas panel ---------- */
  var menuButton = document.getElementById("mobile-menu-button");
  var desktopMenu = document.getElementById("primary-menu");
  var panel = document.getElementById("mobile-menu-panel");

  if (menuButton && desktopMenu && panel) {
    var sheet = panel.querySelector(".kingster-mobile-panel__sheet");
    var mount = panel.querySelector(".kingster-mobile-panel__menu-mount");
    var closeBtn = panel.querySelector(".kingster-mobile-panel__close");
    var built = false;

    function buildMobileMenu() {
      if (built) return;
      built = true;
      var clone = desktopMenu.cloneNode(true);
      clone.removeAttribute("id");
      clone.classList.remove("kingster-desktop-menu");

      // Convert hover/focus-only submenus into tap-to-expand accordions.
      clone.querySelectorAll(".menu-item-has-children").forEach(function (li) {
        var trigger = li.querySelector(":scope > a");
        var sub = li.querySelector(":scope > .sub-menu, :scope > .sf-mega");
        if (!trigger || !sub) return;

        var toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "kingster-mobile-panel-toggle";
        toggle.innerHTML = trigger.textContent + ' <i class="fa fa-angle-down" aria-hidden="true"></i>';
        toggle.setAttribute("aria-expanded", "false");

        li.insertBefore(toggle, trigger.nextSibling);

        toggle.addEventListener("click", function () {
          var isOpen = li.classList.toggle("is-open");
          toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
      });

      mount.appendChild(clone);
    }

    function openPanel() {
      buildMobileMenu();
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      menuButton.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      if (closeBtn) closeBtn.focus();
    }

    function closePanel() {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      menuButton.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      menuButton.focus();
    }

    menuButton.addEventListener("click", function () {
      var isOpen = panel.classList.contains("is-open");
      if (isOpen) { closePanel(); } else { openPanel(); }
    });

    if (closeBtn) closeBtn.addEventListener("click", closePanel);

    panel.querySelector(".kingster-mobile-panel__scrim").addEventListener("click", closePanel);

    document.addEventListener("keydown", function (evt) {
      if (evt.key === "Escape" && panel.classList.contains("is-open")) closePanel();
    });

    // Close the panel automatically if the viewport grows past the mobile breakpoint.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080 && panel.classList.contains("is-open")) closePanel();
    });
  }

  /* ---------- homepage crossfade hero ---------- */
  var hero = document.querySelector(".kingster-hero");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".kingster-hero__slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".kingster-hero__dots button"));
    var index = 0;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function showSlide(next) {
      slides[index].classList.remove("is-active");
      if (dots[index]) dots[index].classList.remove("is-active");
      index = next;
      slides[index].classList.add("is-active");
      if (dots[index]) dots[index].classList.add("is-active");
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { showSlide(i); });
    });

    if (slides.length > 1 && !reduceMotion) {
      setInterval(function () {
        showSlide((index + 1) % slides.length);
      }, 6500);
    }
  }
})();
