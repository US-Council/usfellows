import { intakeConfig } from "../config/intake";

const form = document.querySelector<HTMLFormElement>("#fellowship-application");

if (form) {
  const steps = Array.from(form.querySelectorAll<HTMLFieldSetElement>(".form-step"));
  const back = document.querySelector<HTMLButtonElement>("#application-back");
  const next = document.querySelector<HTMLButtonElement>("#application-next");
  const submit = document.querySelector<HTMLButtonElement>("#application-submit");
  const status = document.querySelector<HTMLElement>("#application-status");
  const bar = document.querySelector<HTMLElement>("#application-progress-bar");
  const track = bar?.parentElement;
  const stepText = document.querySelector<HTMLElement>("#application-step-text");
  const stepName = document.querySelector<HTMLElement>("#application-step-name");
  const review = document.querySelector<HTMLElement>("#application-review");
  const shell = document.querySelector<HTMLElement>(".application-shell");
  const program = document.querySelector<HTMLSelectElement>("#program");
  const scholarFields = Array.from(form.querySelectorAll<HTMLElement>("[data-scholar-fields]"));
  const scholarPrograms = [
    "International R&D Scholar",
    "Resident R&D Scholar",
    "Trusted R&D Scholar",
    "Principal R&D Scholar",
    "Distinguished R&D Scholar"
  ];
  const scholarDataFields = [
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
    "distinguished_record_url"
  ];
  const draftKey = "us_fellows_application_v1";
  let current = 0;

  function escapeHtml(value: string): string {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
  }

  function formDataObject(): Record<string, FormDataEntryValue | FormDataEntryValue[]> {
    const result: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
    new FormData(form!).forEach((value, key) => {
      if (key === "company_website") return;
      const existing = result[key];
      result[key] = existing ? ([] as FormDataEntryValue[]).concat(existing, value) : value;
    });
    return result;
  }

  function setStatus(message: string, type: "" | "error" | "success" = ""): void {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status${type ? ` is-${type}` : ""}`;
  }

  function errorFor(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): HTMLElement | null {
    return document.querySelector<HTMLElement>(`#${CSS.escape(field.id)}-error`);
  }

  function validate(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): boolean {
    if (field.disabled || field.type === "hidden") return true;
    const valid = field.checkValidity();
    field.setAttribute("aria-invalid", String(!valid));
    const error = errorFor(field);
    if (error) {
      error.classList.toggle("is-visible", !valid);
      field.setAttribute("aria-describedby", error.id);
    }
    return valid;
  }

  function updateScholarFields(): void {
    const selection = program?.value ?? "";
    const isScholar = scholarPrograms.includes(selection);

    scholarFields.forEach((panel) => {
      const active = isScholar && (panel.dataset.scholarFor === "all" || panel.dataset.scholarFor === selection);
      panel.hidden = !active;
      panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea").forEach((field) => {
        field.disabled = !active;
        field.required = active && field.hasAttribute("data-required");
        if (!active) {
          field.removeAttribute("aria-invalid");
          errorFor(field)?.classList.remove("is-visible");
        }
      });
    });
  }

  function validateStep(): boolean {
    let firstInvalid: HTMLElement | null = null;
    const fields = steps[current]?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea") ?? [];
    for (const field of fields) {
      if (!validate(field) && !firstInvalid) firstInvalid = field;
    }
    if (firstInvalid) firstInvalid.focus();
    return firstInvalid === null;
  }

  function saveDraft(): void {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ ...formDataObject(), _step: current }));
    } catch {
      // Storage can be unavailable in privacy modes; the form still works without drafts.
    }
  }

  function restoreDraft(): void {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) ?? "null") as Record<string, unknown> | null;
      if (!draft) return;

      Object.entries(draft).forEach(([key, value]) => {
        if (key === "_step") return;
        const controls = form!.elements.namedItem(key);
        if (!controls) return;
        const list = controls instanceof RadioNodeList ? Array.from(controls) : [controls];
        list.forEach((control) => {
          if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement)) return;
          if (control instanceof HTMLInputElement && ["checkbox", "radio"].includes(control.type)) {
            control.checked = ([] as unknown[]).concat(value).includes(control.value);
          } else {
            control.value = String(value ?? "");
          }
        });
      });
      current = Math.min(Number(draft._step) || 0, steps.length - 1);
    } catch {
      // Ignore malformed or inaccessible local drafts.
    }
  }

  function buildReview(): void {
    if (!review) return;
    const data = formDataObject();
    const labels: Record<string, string> = {
      first_name: "Name",
      email: "Email",
      fellowship_program: "Program",
      primary_mission: "Mission",
      appointment_pathway: "Pathway",
      field_of_study: "Field",
      resume_url: "Résumé/CV",
      why_apply: "Why fellowship",
      proposed_contribution: "Proposed contribution"
    };
    const scholarLabels: Record<string, string> = {
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
      distinguished_record_url: "Distinguished public record"
    };
    const rows = Object.entries(labels).map(([key, label]) => {
      let value: unknown = data[key] ?? "Not provided";
      if (key === "first_name") {
        value = [data.first_name, data.middle_name, data.last_name].filter(Boolean).join(" ");
      }
      return `<dt>${label}</dt><dd>${escapeHtml(String(value))}</dd>`;
    });
    for (const [key, label] of Object.entries(scholarLabels)) {
      if (data[key]) rows.push(`<dt>${label}</dt><dd>${escapeHtml(String(data[key]))}</dd>`);
    }
    review.innerHTML = `<h2>Application summary</h2><dl class="review-list">${rows.join("")}</dl>`;
  }

  function showStep(index: number, focus = true): void {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== current; });
    if (back) back.hidden = current === 0;
    if (next) next.hidden = current === steps.length - 1;
    if (submit) submit.hidden = current !== steps.length - 1;

    const number = current + 1;
    const name = steps[current]?.dataset.step ?? "";
    if (stepText) stepText.textContent = `Page ${number} of ${steps.length}`;
    if (stepName) stepName.textContent = name;
    if (bar) bar.style.width = `${(number / steps.length) * 100}%`;
    track?.setAttribute("aria-valuemax", String(steps.length));
    track?.setAttribute("aria-valuenow", String(number));
    track?.setAttribute("aria-valuetext", `Page ${number} of ${steps.length}: ${name}`);
    if (current === steps.length - 1) buildReview();
    if (focus) {
      steps[current]?.querySelector<HTMLElement>("legend")?.focus();
      shell?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  form.addEventListener("input", (event) => {
    const field = event.target;
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
      validate(field);
      saveDraft();
    }
  });
  form.addEventListener("change", (event) => {
    if (event.target === program) updateScholarFields();
    saveDraft();
  });

  next?.addEventListener("click", () => {
    if (validateStep()) {
      setStatus("");
      saveDraft();
      showStep(current + 1);
    } else {
      setStatus("Complete the highlighted required fields before continuing.", "error");
    }
  });

  back?.addEventListener("click", () => {
    setStatus("");
    saveDraft();
    showStep(current - 1);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateStep()) {
      setStatus("Correct the highlighted fields before submitting.", "error");
      return;
    }
    const honeypot = form.elements.namedItem("company_website");
    if (honeypot instanceof HTMLInputElement && honeypot.value) return;
    if (!submit) return;

    submit.disabled = true;
    setStatus("Submitting your application…");

    if (intakeConfig.testMode) {
      localStorage.removeItem(draftKey);
      form.reset();
      updateScholarFields();
      setStatus("Test submission accepted. No Dynamics record was created.", "success");
      submit.disabled = false;
      return;
    }

    try {
      const payload = new FormData(form);
      scholarDataFields.forEach((name) => {
        if (!payload.has(name)) payload.append(name, "");
      });
      const response = await fetch(intakeConfig.endpoint, { method: "POST", body: payload });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      localStorage.removeItem(draftKey);
      form.reset();
      updateScholarFields();
      setStatus("Your application has been received. US Fellows will contact you at the email address provided.", "success");
      submit.disabled = false;
      showStep(0, false);
    } catch {
      setStatus("We could not submit your application. Your draft remains saved; please try again later.", "error");
      submit.disabled = false;
    }
  });

  restoreDraft();
  const requestedProgram = new URLSearchParams(window.location.search).get("program");
  if (program && !program.value && requestedProgram && Array.from(program.options).some((option) => option.value === requestedProgram)) {
    program.value = requestedProgram;
  }
  updateScholarFields();
  showStep(current, false);
}
