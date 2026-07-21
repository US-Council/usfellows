(function () {
  "use strict";
  var form = document.getElementById("fellowship-application");
  if (!form) return;
  var steps = Array.prototype.slice.call(form.querySelectorAll(".form-step")),
    current = 0;
  var back = document.getElementById("application-back"),
    next = document.getElementById("application-next"),
    submit = document.getElementById("application-submit"),
    status = document.getElementById("application-status"),
    bar = document.getElementById("application-progress-bar"),
    track = bar.parentElement,
    stepText = document.getElementById("application-step-text"),
    stepName = document.getElementById("application-step-name"),
    review = document.getElementById("application-review");
  var program = document.getElementById("program"),
    scholarFields = Array.prototype.slice.call(
      form.querySelectorAll("[data-scholar-fields]"),
    ),
    scholarPrograms = [
      "International R&D Scholar",
      "Resident R&D Scholar",
      "Trusted R&D Scholar",
      "Principal R&D Scholar",
      "Distinguished R&D Scholar",
    ],
    scholarDataFields = [
      "scholar_research_focus",
      "thesis_summary",
      "home_advisor",
      "advisor_endorsement_url",
      "solicitation_ids",
      "collaboration_request",
      "scholar_guidance_consent",
      "resident_time_commitment",
      "resident_development_goals",
      "trusted_clearance_confirmation",
      "trusted_full_time_engagement",
      "trusted_verification_consent",
      "principal_role_type",
      "principal_role_summary",
      "principal_evidence_url",
      "distinguished_review_route",
      "distinguished_impact_summary",
      "distinguished_contribution",
      "distinguished_record_url",
    ];
  var draftKey = "us_fellows_application_v1";
  function updateScholarFields() {
    var selection = program.value,
      isScholar = scholarPrograms.indexOf(selection) !== -1;
    scholarFields.forEach(function (panel) {
      var active =
        isScholar &&
        (panel.dataset.scholarFor === "all" ||
          panel.dataset.scholarFor === selection);
      panel.hidden = !active;
      panel.querySelectorAll("input,select,textarea").forEach(function (el) {
        el.disabled = !active;
        el.required = active && el.hasAttribute("data-required");
        if (!active) {
          el.removeAttribute("aria-invalid");
          var err = errorFor(el);
          if (err) err.classList.remove("is-visible");
        }
      });
    });
  }
  function show(index, focus) {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach(function (s, i) {
      s.hidden = i !== current;
    });
    back.hidden = current === 0;
    next.hidden = current === steps.length - 1;
    submit.hidden = current !== steps.length - 1;
    var n = current + 1,
      name = steps[current].dataset.step;
    stepText.textContent = "Page " + n + " of " + steps.length;
    stepName.textContent = name;
    bar.style.width = (n / steps.length) * 100 + "%";
    track.setAttribute("aria-valuemax", String(steps.length));
    track.setAttribute("aria-valuenow", String(n));
    track.setAttribute(
      "aria-valuetext",
      "Page " + n + " of " + steps.length + ": " + name,
    );
    if (current === steps.length - 1) buildReview();
    if (focus !== false) steps[current].querySelector("legend").focus();
    window.scrollTo({
      top: document.querySelector(".application-shell").offsetTop - 100,
      behavior: "smooth",
    });
  }
  function errorFor(el) {
    return document.getElementById(el.id + "-error");
  }
  function validate(el) {
    if (el.disabled || el.type === "hidden") return true;
    var ok = el.checkValidity();
    el.setAttribute("aria-invalid", ok ? "false" : "true");
    var err = errorFor(el);
    if (err) {
      err.classList.toggle("is-visible", !ok);
      el.setAttribute("aria-describedby", err.id);
    }
    return ok;
  }
  function validateStep() {
    var valid = true,
      first = null;
    steps[current]
      .querySelectorAll("input,select,textarea")
      .forEach(function (el) {
        if (!validate(el)) {
          valid = false;
          if (!first) first = el;
        }
      });
    if (first) first.focus();
    return valid;
  }
  function dataObject() {
    var obj = {};
    new FormData(form).forEach(function (v, k) {
      if (k === "company_website") return;
      if (obj[k]) obj[k] = [].concat(obj[k], v);
      else obj[k] = v;
    });
    return obj;
  }
  function save() {
    try {
      var d = dataObject();
      d._step = current;
      localStorage.setItem(draftKey, JSON.stringify(d));
    } catch (e) {}
  }
  function restore() {
    try {
      var d = JSON.parse(localStorage.getItem(draftKey) || "null");
      if (!d) return;
      Object.keys(d).forEach(function (k) {
        if (k === "_step") return;
        var els = form.elements[k];
        if (!els) return;
        var list =
          els.length && !els.tagName ? Array.prototype.slice.call(els) : [els];
        list.forEach(function (el) {
          if (el.type === "checkbox" || el.type === "radio")
            el.checked = [].concat(d[k]).indexOf(el.value) !== -1;
          else el.value = d[k];
        });
      });
      current = Math.min(Number(d._step) || 0, steps.length - 1);
    } catch (e) {}
  }
  function buildReview() {
    var d = dataObject(),
      labels = {
        first_name: "Name",
        email: "Email",
        fellowship_program: "Program",
        primary_mission: "Mission",
        appointment_pathway: "Pathway",
        field_of_study: "Field",
        resume_url: "Résumé/CV",
        why_apply: "Why this program",
        proposed_contribution: "Proposed contribution",
      },
      scholarLabels = {
        scholar_research_focus: "Research focus",
        thesis_summary: "Thesis/project",
        home_advisor: "Home advisor",
        advisor_endorsement_url: "Advisor endorsement",
        solicitation_ids: "Opportunity IDs",
        collaboration_request: "Collaboration request",
        resident_time_commitment: "20+ hour commitment",
        resident_development_goals: "Resident development goals",
        trusted_clearance_confirmation: "Active clearance confirmation",
        trusted_full_time_engagement: "Full-time national-mission engagement",
        trusted_verification_consent: "Verification consent",
        principal_role_type: "Principal role",
        principal_role_summary: "Principal leadership record",
        principal_evidence_url: "Principal evidence",
        distinguished_review_route: "Distinguished review route",
        distinguished_impact_summary: "National-impact record",
        distinguished_contribution: "Continuing contribution",
        distinguished_record_url: "Distinguished public record",
      },
      html = '<h2>Application summary</h2><dl class="review-list">';
    Object.keys(labels).forEach(function (k) {
      var v = d[k] || "Not provided";
      if (k === "first_name")
        v = [d.first_name, d.middle_name, d.last_name]
          .filter(Boolean)
          .join(" ");
      html +=
        "<dt>" + labels[k] + "</dt><dd>" + escapeHtml(String(v)) + "</dd>";
    });
    Object.keys(scholarLabels).forEach(function (k) {
      if (!d[k]) return;
      html +=
        "<dt>" +
        scholarLabels[k] +
        "</dt><dd>" +
        escapeHtml(String(d[k])) +
        "</dd>";
    });
    review.innerHTML = html + "</dl>";
  }
  function escapeHtml(v) {
    var d = document.createElement("div");
    d.textContent = v;
    return d.innerHTML;
  }
  function setStatus(message, type) {
    status.textContent = message;
    status.className = "form-status" + (type ? " is-" + type : "");
  }
  form.addEventListener("input", function (e) {
    if (e.target.matches("input,select,textarea")) {
      validate(e.target);
      save();
    }
  });
  form.addEventListener("change", function (e) {
    if (e.target === program) updateScholarFields();
    save();
  });
  next.addEventListener("click", function () {
    if (validateStep()) {
      setStatus("", "");
      save();
      show(current + 1);
    } else
      setStatus(
        "Complete the highlighted required fields before continuing.",
        "error",
      );
  });
  back.addEventListener("click", function () {
    setStatus("", "");
    save();
    show(current - 1);
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateStep()) {
      setStatus("Correct the highlighted fields before submitting.", "error");
      return;
    }
    var cfg = window.US_FELLOWS_INTAKE || {},
      endpoint = cfg.endpoint || "";
    if (form.elements.company_website.value) return;
    submit.disabled = true;
    setStatus("Submitting your application…", "");
    var payload = new FormData(form);
    scholarDataFields.forEach(function (name) {
      if (!payload.has(name)) payload.append(name, "");
    });
    if (cfg.testMode) {
      setTimeout(function () {
        localStorage.removeItem(draftKey);
        form.reset();
        updateScholarFields();
        setStatus(
          "Test submission accepted. No Dynamics record was created.",
          "success",
        );
        submit.disabled = false;
      }, 300);
      return;
    }
    if (!endpoint || endpoint.indexOf("__US_FELLOWS") === 0) {
      setStatus(
        "The secure application endpoint has not been configured. Your draft remains saved in this browser.",
        "error",
      );
      submit.disabled = false;
      return;
    }
    fetch(endpoint, { method: "POST", body: payload })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json().catch(function () {
          return { success: true };
        });
      })
      .then(function () {
        localStorage.removeItem(draftKey);
        form.reset();
        updateScholarFields();
        setStatus(
          "Your application has been received. US Fellows will contact you at the email address provided.",
          "success",
        );
        submit.disabled = false;
        show(0, false);
      })
      .catch(function () {
        setStatus(
          "We could not submit your application. Your draft remains saved; please try again later.",
          "error",
        );
        submit.disabled = false;
      });
  });
  restore();
  try {
    var requestedProgram = new URLSearchParams(window.location.search).get(
      "program",
    );
    if (!program.value && requestedProgram) {
      var hasOption = Array.prototype.some.call(program.options, function (o) {
        return o.value === requestedProgram;
      });
      if (hasOption) program.value = requestedProgram;
    }
  } catch (e) {}
  updateScholarFields();
  show(current, false);
})();
