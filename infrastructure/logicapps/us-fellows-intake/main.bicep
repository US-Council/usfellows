param location string = resourceGroup().location
param workflowName string = 'US_Fellows_Application_Intake'
param d365Organization string = 'org8a977f45.crm'
param d365ConnectionId string
param d365ManagedApiId string

resource workflow 'Microsoft.Logic/workflows@2019-05-01' = {
  name: workflowName
  location: location
  tags: {
    program: 'US Fellows'
    owner: 'US Council'
    purpose: 'Fellowship application intake'
  }
  properties: {
    state: 'Enabled'
    definition: loadJsonContent('workflow-definition.json')
    parameters: {
      '$connections': {
        value: {
          dynamicscrmonline: {
            connectionId: d365ConnectionId
            connectionName: last(split(d365ConnectionId, '/'))
            id: d365ManagedApiId
          }
        }
      }
      d365Organization: {
        value: d365Organization
      }
    }
  }
}

output workflowResourceId string = workflow.id
