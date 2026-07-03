# US Fellows application intake

This Logic App receives the multipart form from `apply.html`, rejects honeypot submissions, creates an applicant intake record in Dynamics 365 Leads, and only returns success after Dynamics confirms the record was created.

The workflow follows the proven USIVA intake pattern while using a smaller US Fellows-specific field contract. It intentionally does not contain a callback signature, connection credential, or production owner-team identifier.

## Required Azure configuration

- Consumption Logic App name: `US_Fellows_Application_Intake`
- Resource group and region approved by US Council
- Authorized Dynamics CRM Online API connection
- D365 organization name
- Request-trigger CORS/access-control configuration for `https://usfellows.org`

## Deploy/update

Deploy the Bicep resource with the approved existing Dynamics connector:

```sh
az deployment group create \
  --resource-group RESOURCE_GROUP \
  --template-file main.bicep \
  --parameters \
    d365ConnectionId=D365_CONNECTION_RESOURCE_ID \
    d365ManagedApiId=D365_MANAGED_API_RESOURCE_ID
```

Supply values based on `parameters.example.json` through the deployment layer. The connector identity becomes the default owner of new applicant leads unless a dedicated US Fellows assignment rule is configured in Dynamics.

After deployment, retrieve the `manual` trigger callback URL and configure `assets/js/intake-config.js`. This repository is a static site, so the callback is necessarily visible to browsers just as it is in the reference implementation. Treat it as a rotatable intake credential, retain server-side bot checks, and rotate it if abuse is detected.

## D365 record model

The current tenant’s established applicant-intake implementation uses the `leads` table. Each form submission creates a Lead whose subject begins `US Fellows Application`, with the complete application in `description` and key identity fields mapped to native Lead columns. If the organization later provisions a dedicated Applicant table or requires true D365 Incident records, update the connector action only after the target schema and required customer relationship are defined.

## Failure behavior

- D365 creation succeeds: HTTP 201 to the browser.
- D365 creation fails or times out: HTTP 500; the browser keeps the local draft.
- Honeypot is populated: HTTP 400 and no D365 record.
- Endpoint is not configured: the site does not pretend to submit; it tells the applicant that the draft remains local.

## Test safely

Set `testMode: true` in `assets/js/intake-config.js` only for local UI testing. Test mode never calls Azure or creates a D365 record. Restore it to `false` before deployment.
