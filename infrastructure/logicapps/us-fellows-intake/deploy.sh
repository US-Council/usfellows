#!/usr/bin/env bash
set -euo pipefail

subscription_name="${US_FELLOWS_AZURE_SUBSCRIPTION:-Microsoft Partner Network}"
resource_group_name="${US_FELLOWS_AZURE_RESOURCE_GROUP:-tli_interest}"
deployment_name="${US_FELLOWS_AZURE_DEPLOYMENT:-us-fellows-application-intake}"
location_name="${US_FELLOWS_AZURE_LOCATION:-eastus}"
workflow_name="${US_FELLOWS_WORKFLOW_NAME:-US_Fellows_Application_Intake}"
d365_organization="${US_FELLOWS_D365_ORGANIZATION:-org8a977f45.crm}"
office_connection_name="${US_FELLOWS_OUTLOOK_CONNECTION:-office365-2}"
workflow_definition="$(dirname "$0")/workflow-definition.json"

subscription_id="$(az account show --subscription "$subscription_name" --query id -o tsv)"
d365_connection_id="/subscriptions/$subscription_id/resourceGroups/$resource_group_name/providers/Microsoft.Web/connections/dynamicscrmonline"
d365_api_id="/subscriptions/$subscription_id/providers/Microsoft.Web/locations/$location_name/managedApis/dynamicscrmonline"
office_connection_id="/subscriptions/$subscription_id/resourceGroups/$resource_group_name/providers/Microsoft.Web/connections/$office_connection_name"
office_api_id="/subscriptions/$subscription_id/providers/Microsoft.Web/locations/$location_name/managedApis/office365"

if current_workflow="$(az resource show \
  --subscription "$subscription_id" \
  --resource-group "$resource_group_name" \
  --resource-type Microsoft.Logic/workflows \
  --name "$workflow_name" \
  -o json 2>/dev/null)"; then
  is_current="$(jq -r \
    --arg d365_connection_id "$d365_connection_id" \
    --arg d365_api_id "$d365_api_id" \
    --arg office_connection_id "$office_connection_id" \
    --arg office_api_id "$office_api_id" \
    --arg d365_organization "$d365_organization" \
    --slurpfile desired_definition "$workflow_definition" \
    '(.properties.state == "Enabled") and
     (.properties.definition == $desired_definition[0]) and
     (.properties.parameters["$connections"].value.dynamicscrmonline.connectionId == $d365_connection_id) and
     (.properties.parameters["$connections"].value.dynamicscrmonline.id == $d365_api_id) and
     (.properties.parameters["$connections"].value.office365.connectionId == $office_connection_id) and
     (.properties.parameters["$connections"].value.office365.id == $office_api_id) and
     (.properties.parameters.d365Organization.value == $d365_organization) and
     (.tags.program == "US Fellows") and
     (.tags.owner == "US Council") and
     (.tags.purpose == "Fellowship application intake")' \
    <<<"$current_workflow")"

  if [[ "$is_current" == "true" ]]; then
    printf '{"state":"Unchanged","workflow":"%s","outlookConnection":"%s"}\n' \
      "$workflow_name" "$office_connection_name"
    exit 0
  fi
fi

deployment_arguments=(
  --subscription "$subscription_id"
  --resource-group "$resource_group_name"
  --name "$deployment_name"
  --template-file "$(dirname "$0")/main.bicep"
  --parameters
  workflowName="$workflow_name"
  d365Organization="$d365_organization"
  d365ConnectionId="$d365_connection_id"
  d365ManagedApiId="$d365_api_id"
  office365ConnectionId="$office_connection_id"
  office365ManagedApiId="$office_api_id"
)

if [[ "${1:-}" == "--what-if" ]]; then
  az deployment group what-if "${deployment_arguments[@]}" --result-format ResourceIdOnly
else
  az deployment group create "${deployment_arguments[@]}" \
    --query '{state:properties.provisioningState,timestamp:properties.timestamp}' \
    -o json
fi
