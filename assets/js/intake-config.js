/*
 * Applications go to formfunnel (reCAPTCHA v3 gate behind Azure Front Door and
 * its WAF), which forwards accepted submissions to the US Fellows intake Logic
 * App. No Logic App URL or other credential belongs in this file: the site
 * key below is public, and its secret lives only server-side.
 */
window.US_FELLOWS_INTAKE = {
  endpoint: "https://door.taolearning.org/api/form",
  formType: "usfellows",
  recaptchaSiteKey: "6LeI9_MtAAAAAP_VZ5ktV1QKgRHk62yOP49ujUM9",
  recaptchaAction: "usfellows_application",
  testMode: false
};
