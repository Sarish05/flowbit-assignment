#  FlowBit - Multi-Tenant Workflow Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

A production-ready MERN stack application demonstrating **multi-tenant architecture** with **n8n workflow integration**. Built for the FlowBit Technical Challenge.

##  **Key Features**

### Core Requirements 
- ** JWT Authentication** - Email/password login with bcrypt + jsonwebtoken
- ** Multi-Tenant Data Isolation** - Complete tenant separation with customerId
- ** Role-Based Access Control** - Admin/User roles with middleware protection
- ** Dynamic Micro-Frontend Loading** - Tenant-specific screen registry
- ** n8n Workflow Integration** - Automated ticket processing with webhooks
- ** Containerized Development** - Full Docker setup with self-configuration

### Architecture Highlights
- **Tenant Isolation**: Every MongoDB query includes customerId filtering
- **Workflow Round-Trip**: FlowBit  n8n  FlowBit with status updates
- **Real-Time Updates**: UI polling for workflow status changes
- **Security**: JWT tokens, webhook secrets, tenant-aware middleware

##  **Quick Start**

### Option 1: Docker (Recommended)
`ash
# Clone and start everything
git clone https://github.com/Sarish05/flowbit-assignment.git
cd flowbit-assignment
docker-compose up -d

# Wait for containers to start, then access:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# n8n: http://localhost:5678
`

### Option 2: Local Development
`ash
# Backend setup
cd backend
npm install
npm run seed    # Creates sample tenants and users
npm start       # Starts on port 3001

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev     # Starts on port 3000
`

##  **Demo Credentials**

### LogisticsCo Tenant
- **Admin**: dmin@logisticsco.com / password123
- **User**: user@logisticsco.com / password123

### RetailGmbH Tenant
- **Admin**: dmin@retailgmbh.com / password123
- **User**: user@retailgmbh.com / password123

##  **Assignment Compliance**

### Core Requirements Met:
-  **R1**: JWT Auth with customerId and role
-  **R2**: Tenant data isolation 
-  **R3**: Hard-coded registry with tenant mappings
-  **R4**: Dynamic React shell with lazy loading
-  **R5**: n8n workflow ping with callback
-  **R6**: Full Docker containerization

##  **Developer**

**Sarish Sunil Sonawane**
- GitHub: [@Sarish05](https://github.com/Sarish05)
- Email: [Contact for FlowBit Assignment]

---

** Ready for Demo!** This implementation demonstrates a production-ready multi-tenant platform with complete workflow integration!
