#!/usr/bin/env node

/**
 * FlowBit n8n Workflow Setup Script
 * This script will create a workflow in n8n via the API
 */

const axios = require('axios');

const N8N_BASE_URL = 'http://localhost:5678';
const N8N_AUTH = Buffer.from('admin:password123').toString('base64');

// Workflow definition
const workflowDefinition = {
  "name": "FlowBit Ticket Processing",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "flowbit-ticket",
        "options": {}
      },
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300],
      "id": "webhook-trigger"
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "ticketId",
              "value": "={{$json.ticketId}}"
            },
            {
              "name": "customerId", 
              "value": "={{$json.customerId}}"
            },
            {
              "name": "title",
              "value": "={{$json.title}}"
            },
            {
              "name": "priority",
              "value": "={{$json.priority}}"
            },
            {
              "name": "callbackUrl",
              "value": "={{$json.callbackUrl}}"
            },
            {
              "name": "webhookSecret",
              "value": "={{$json.webhookSecret}}"
            }
          ]
        }
      },
      "name": "Extract Data",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [460, 300],
      "id": "extract-data"
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.customerId}}",
              "operation": "equal",
              "value2": "logisticsco"
            }
          ]
        }
      },
      "name": "Tenant Router",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [680, 300],
      "id": "tenant-check"
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "status",
              "value": "={{$json.priority === 'High' ? 'In Progress' : ($json.priority === 'Medium' ? 'Under Review' : 'Open')}}"
            },
            {
              "name": "workflowData",
              "value": "LogisticsCo Processing: Auto-assigned based on {{$json.priority}} priority. Ticket: {{$json.title}}"
            },
            {
              "name": "tenant",
              "value": "LogisticsCo"
            },
            {
              "name": "processedAt",
              "value": "={{new Date().toISOString()}}"
            }
          ]
        }
      },
      "name": "LogisticsCo Processing",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [900, 200],
      "id": "logistics-processing"
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "status",
              "value": "={{$json.priority === 'Low' ? 'Open' : 'In Progress'}}"
            },
            {
              "name": "workflowData",
              "value": "RetailGmbH Processing: Customer service review initiated for {{$json.priority}} priority ticket: {{$json.title}}"
            },
            {
              "name": "tenant",
              "value": "RetailGmbH"
            },
            {
              "name": "processedAt",
              "value": "={{new Date().toISOString()}}"
            }
          ]
        }
      },
      "name": "RetailGmbH Processing",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [900, 400],
      "id": "retail-processing"
    },
    {
      "parameters": {
        "url": "http://flowbit-backend:3001/api/webhooks/ticket-processed",
        "options": {
          "headers": {
            "X-Webhook-Secret": "={{$json.webhookSecret}}",
            "Content-Type": "application/json"
          }
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "ticketId",
              "value": "={{$json.ticketId}}"
            },
            {
              "name": "status",
              "value": "={{$json.status}}"
            },
            {
              "name": "workflowData",
              "value": "={{$json.workflowData}}"
            },
            {
              "name": "processedAt",
              "value": "={{$json.processedAt}}"
            },
            {
              "name": "tenant",
              "value": "={{$json.tenant}}"
            }
          ]
        }
      },
      "name": "Send Callback",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1120, 300],
      "id": "send-callback"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": {
          "success": true,
          "message": "Ticket processed successfully",
          "ticketId": "={{$json.ticketId}}",
          "status": "={{$json.status}}",
          "tenant": "={{$json.tenant}}"
        }
      },
      "name": "Success Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1340, 300],
      "id": "success-response"
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [
          {
            "node": "Extract Ticket Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extract Ticket Data": {
      "main": [
        [
          {
            "node": "Tenant Router",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Tenant Router": {
      "main": [
        [
          {
            "node": "LogisticsCo Processing",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "RetailGmbH Processing",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "LogisticsCo Processing": {
      "main": [
        [
          {
            "node": "Send Callback",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "RetailGmbH Processing": {
      "main": [
        [
          {
            "node": "Send Callback",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Send Callback": {
      "main": [
        [
          {
            "node": "Success Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1"
  },
  "id": "flowbit-ticket-workflow"
};

async function createWorkflow() {
  try {
    console.log(' FlowBit Workflow Setup Starting...');
    console.log(' Connecting to n8n at:', N8N_BASE_URL);
    
    // First, check if workflow already exists
    try {
      const existingWorkflows = await axios.get(`${N8N_BASE_URL}/api/v1/workflows`, {
        headers: {
          'Authorization': `Basic ${N8N_AUTH}`,
          'Content-Type': 'application/json'
        }
      });
      
      const existingWorkflow = existingWorkflows.data.find(w => w.name === workflowDefinition.name);
      if (existingWorkflow) {
        console.log('  Workflow already exists, updating...');
        const response = await axios.put(
          `${N8N_BASE_URL}/api/v1/workflows/${existingWorkflow.id}`, 
          workflowDefinition,
          {
            headers: {
              'Authorization': `Basic ${N8N_AUTH}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Workflow updated successfully!');
        console.log('Workflow ID:', response.data.id);
      } else {
        const response = await axios.post(`${N8N_BASE_URL}/api/v1/workflows`, workflowDefinition, {
          headers: {
            'Authorization': `Basic ${N8N_AUTH}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('New workflow created successfully!');
        console.log('Workflow ID:', response.data.id);
      }
    } catch (listError) {
      // If we can't list workflows, try to create a new one
      const response = await axios.post(`${N8N_BASE_URL}/api/v1/workflows`, workflowDefinition, {
        headers: {
          'Authorization': `Basic ${N8N_AUTH}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Workflow created successfully!');
      console.log('Workflow ID:', response.data.id);
    }
    
    console.log('Webhook URL:', `${N8N_BASE_URL}/webhook/flowbit-ticket`);
    console.log('Webhook Secret:', WEBHOOK_SECRET);
    console.log('Callback Endpoint: http://flowbit-backend:3001/api/webhooks/ticket-processed');
    console.log('');
    
    
  } catch (error) {
    console.error(' Failed to create/update workflow:', error.response?.data || error.message);
    
  }
}


// Run the setup
createWorkflow();
