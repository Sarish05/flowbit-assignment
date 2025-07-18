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
      "name": "Tenant Check",
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
              "value": "={{$json.priority === 'High' ? 'In Progress' : 'Open'}}"
            },
            {
              "name": "workflowData",
              "value": "LogisticsCo: Auto-processed based on priority"
            },
            {
              "name": "tenant",
              "value": "LogisticsCo"
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
              "value": "In Progress"
            },
            {
              "name": "workflowData",
              "value": "RetailGmbH: Auto-escalated for customer service review"
            },
            {
              "name": "tenant",
              "value": "RetailGmbH"
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
        "url": "http://flowbit-backend:3001/webhook/ticket-done",
        "options": {
          "headers": {
            "X-Webhook-Secret": "={{$json.webhookSecret}}"
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
            }
          ]
        }
      },
      "name": "Send Callback",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1120, 300],
      "id": "send-callback"
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [
          {
            "node": "Extract Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extract Data": {
      "main": [
        [
          {
            "node": "Tenant Check",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Tenant Check": {
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
    }
  },
  "active": true,
  "settings": {},
  "id": "flowbit-ticket-workflow"
};

async function createWorkflow() {
  try {
    console.log('🔄 Creating FlowBit workflow in n8n...');
    
    const response = await axios.post(`${N8N_BASE_URL}/api/v1/workflows`, workflowDefinition, {
      headers: {
        'Authorization': `Basic ${N8N_AUTH}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Workflow created successfully!');
    console.log('📋 Workflow ID:', response.data.id);
    console.log('🔗 Webhook URL:', `${N8N_BASE_URL}/webhook/flowbit-ticket`);
    
  } catch (error) {
    console.error('❌ Failed to create workflow:', error.response?.data || error.message);
    console.log('💡 Try creating the workflow manually in the n8n UI at http://localhost:5678');
  }
}

// Run the setup
createWorkflow();
