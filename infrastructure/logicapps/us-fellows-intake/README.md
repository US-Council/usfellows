# US Fellows application intake

This Logic App receives the multipart form from `apply.html`, rejects honeypot submissions, creates an applicant intake record in Dynamics 365 Leads, and only returns success after Dynamics confirms the record was created. When an International R&D Scholar applicant separately opts in, the workflow also sends the approved outreach, thesis, and funding-opportunity guide through Office 365 Outlook.

The workflow follows the proven USIVA intake pattern while using a smaller US Fellows-specific field contract. It intentionally does not contain a callback signature, connection credential, or production owner-team identifier.

## Required Azure configuration

- Consumption Logic App name: `US_Fellows_Application_Intake`
- Resource group and region approved by US Council
- Authorized Dynamics CRM Online API connection
- Authorized Office 365 Outlook API connection with an approved US Fellows sender
- D365 organization name
- Request-trigger CORS/access-control configuration for `https://usfellows.org`

## Deploy/update

Deploy the Bicep resource with the approved Dynamics and Office 365 Outlook connectors:

```sh
az deployment group create \
  --resource-group RESOURCE_GROUP \
  --template-file main.bicep \
  --parameters \
    d365ConnectionId=D365_CONNECTION_RESOURCE_ID \
    d365ManagedApiId=D365_MANAGED_API_RESOURCE_ID \
    office365ConnectionId=OFFICE365_CONNECTION_RESOURCE_ID \
    office365ManagedApiId=OFFICE365_MANAGED_API_RESOURCE_ID
```

For the established production target, use the idempotent deployment helper from the repository root:

```sh
infrastructure/logicapps/us-fellows-intake/deploy.sh --what-if
infrastructure/logicapps/us-fellows-intake/deploy.sh
```

The defaults target the existing `Microsoft Partner Network` subscription, `tli_interest` resource group, the colocated `dynamicscrmonline` connection, and Marisa's approved, connected `office365-2` Outlook OAuth connection. The workflow's logical connection key remains `office365`; its physical Azure connection is configurable with `US_FELLOWS_OUTLOOK_CONNECTION`, and the other target values can be overridden with the environment variables declared at the top of the script. Before deploying, the helper compares the live definition, connector bindings, organization, state, and managed tags to the repository source; a repeated run exits with `Unchanged` when they already match. The script does not contain callback signatures or connector credentials.

The Office 365 connection uses delegated OAuth and must show `Connected` before the guidance email can be delivered. If its token expires, reauthorize that API connection with the approved US Fellows mailbox; do not substitute an unrelated connected mailbox merely to make deployment succeed.

Supply values based on `parameters.example.json` through the deployment layer. The connector identity becomes the default owner of new applicant leads unless a dedicated US Fellows assignment rule is configured in Dynamics.

After deployment, retrieve the `manual` trigger callback URL and configure `assets/js/intake-config.js`. This repository is a static site, so the callback is necessarily visible to browsers just as it is in the reference implementation. Treat it as a rotatable intake credential, retain server-side bot checks, and rotate it if abuse is detected.

## D365 record model

The current tenant’s established applicant-intake implementation uses the `leads` table. Each form submission creates a Lead whose subject begins `US Fellows Application`, with the complete application in `description` and key identity fields mapped to native Lead columns. If the organization later provisions a dedicated Applicant table or requires true D365 Incident records, update the connector action only after the target schema and required customer relationship are defined.

Scholar-specific evidence is appended to the Lead description. The public form intentionally collects only confirmation of active clearance for Trusted Scholar applicants; it must never collect clearance level, sponsor, identifiers, project names, classified information, controlled technical data, or other protected details.

## International Scholar guidance email

The email branch runs only when both conditions are true:

- `fellowship_program` is `International R&D Scholar`.
- `scholar_guidance_consent` is `yes`.

The message turns the approved onboarding draft into a practical package checklist, opportunity-verification guide, specific-request standard, and set of confidentiality and permission safeguards. Delivery failure remains visible in Logic App run history but does not change a successfully created Dynamics application into a failed browser submission.

The separate research-scientist draft is represented publicly within `scholars-network.html`. It is intentionally not sent by this prospect-triggered workflow because scientist contact and role requests require staff review and explicit permission.

## Failure behavior

- D365 creation succeeds: HTTP 201 to the browser.
- International Scholar email is requested and succeeds: the applicant also receives the guidance message.
- Email delivery fails after D365 creation: HTTP 201 still returns; investigate the failed Outlook action in run history.
- D365 creation fails or times out: HTTP 500; the browser keeps the local draft.
- Honeypot is populated: HTTP 400 and no D365 record.
- Endpoint is not configured: the site does not pretend to submit; it tells the applicant that the draft remains local.

## Test safely

Set `testMode: true` in `assets/js/intake-config.js` only for local UI testing. Test mode never calls Azure or creates a D365 record. Restore it to `false` before deployment.
