# 🚀 FlowBit - Multi-Tenant Workflow Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

A production-ready MERN stack application demonstrating **multi-tenant architecture** with **n8n workflow integration**. Built for the FlowBit Technical Challenge.

## 🎯 **Key Features**

### Core Requirements ✅
- **🔐 JWT Authentication** - Email/password login with bcrypt + jsonwebtoken
- **🏢 Multi-Tenant Data Isolation** - Complete tenant separation with customerId
- **👥 Role-Based Access Control** - Admin/User roles with middleware protection
- **🎯 Dynamic Micro-Frontend Loading** - Tenant-specific screen registry
- **🔄 n8n Workflow Integration** - Automated ticket processing with webhooks
- **🐳 Containerized Development** - Full Docker setup with self-configuration

### Architecture Highlights
- **Tenant Isolation**: Every MongoDB query includes `customerId` filtering
- **Workflow Round-Trip**: FlowBit → n8n → FlowBit with status updates
- **Real-Time Updates**: UI polling for workflow status changes
- **Security**: JWT tokens, webhook secrets, tenant-aware middleware

## 🏗️ **System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    FlowBit Platform                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   React     │    │   Express   │    │   MongoDB   │     │
│  │  Frontend   │◄──►│   Backend   │◄──►│  Database   │     │
│  │  (Port 3000)│    │ (Port 3001) │    │ (Port 27017)│     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                             │                              │
│                             │ HTTP Webhooks                │
│                             ▼                              │
│                    ┌─────────────┐                         │
│                    │     n8n     │                         │
│                    │  Workflow   │                         │
│                    │  Engine     │                         │
│                    │ (Port 5678) │                         │
│                    └─────────────┘                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    Docker Network                          │
└─────────────────────────────────────────────────────────────┘

Flow: User → Frontend → Backend → n8n → Backend → User
```

### Component Roles:
- **Frontend**: React SPA with tenant-specific UI and JWT auth
- **Backend**: Express.js API with tenant isolation and RBAC
- **Database**: MongoDB with tenant-filtered collections
- **n8n**: Workflow automation engine for ticket processing

## 🚀 **Quick Start**

### Option 1: Docker (Recommended)
```bash
# Clone and start everything
git clone https://github.com/Sarish05/flowbit-assignment.git
cd flowbit-assignment
docker-compose up -d

# Wait for containers to start, then access:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# n8n: http://localhost:5678
```

### Option 2: Local Development
```bash
# Backend setup
cd backend
npm install
npm run seed    # Creates sample tenants and users
npm start       # Starts on port 3001

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev     # Starts on port 3000
```

## 👥 **Demo Credentials**

### LogisticsCo Tenant
- **Admin**: `admin@logisticsco.com` / `password123`
- **User**: `user@logisticsco.com` / `password123`

### RetailGmbH Tenant
- **Admin**: `admin@retailgmbh.com` / `password123`
- **User**: `user@retailgmbh.com` / `password123`

## 📁 **Project Structure**

```
flowbit-assignment/
├── backend/
│   ├── models/           # MongoDB schemas with tenant isolation
│   ├── routes/           # API endpoints with RBAC
│   ├── middleware/       # JWT auth & tenant middleware
│   ├── registry.json     # Tenant-screen mappings
│   └── seed.js          # Sample data creation
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # Auth context
│   │   └── api/         # API configuration
│   └── public/
├── docker-compose.yml    # Full stack containerization
└── README.md            # This file
```

## 👨‍💻 **Developer**

**Sarish Sunil Sonawane**
- GitHub: [@Sarish05](https://github.com/Sarish05)
- Email: [sarishsonawane2005@gmail.com](sarishsonawane2005@gmail.com)

---
