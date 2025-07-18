import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import axios from '../api/config'
import TicketsApp from './TicketsApp'
import AdminPanel from './AdminPanel'
import ProductIssuesApp from './ProductIssuesApp'
import ShipmentTrackingApp from './ShipmentTrackingApp'
import FleetManagementApp from './FleetManagementApp'

// Helper function for tenant display names
const getTenantDisplayName = (customerId) => {
  const tenantNames = {
    'logisticsco': 'LogisticsCo',
    'retailgmbh': 'RetailGmbH'
  }
  return tenantNames[customerId] || customerId
}

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()

  // Fetch available screens for current tenant
  const { data: screensData, isLoading } = useQuery({
    queryKey: ['screens'],
    queryFn: async () => {
      const response = await axios.get('/auth/me/screens')
      return response.data
    }
  })

  const screens = screensData?.screens || []

  // Build navigation items without duplication
  const baseNavItems = [
    { name: 'Dashboard', route: '/dashboard', icon: '🏠' }
  ]

  // Add tenant-specific screens from registry
  const tenantScreens = screens.map(screen => ({
    name: screen.name,
    route: `/dashboard${screen.route}`,
    icon: screen.icon || '📱'
  }))

  // Add admin-only items
  const adminItems = isAdmin ? [
    { name: 'Admin Panel', route: '/dashboard/admin', icon: '⚙️' }
  ] : []

  const navItems = [...baseNavItems, ...tenantScreens, ...adminItems]

  if (isLoading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>FlowBit</h2>
          <div className="tenant-info">
            <div><strong>{getTenantDisplayName(user?.customerId)}</strong></div>
            <div>{user?.firstName} {user?.lastName}</div>
            <div className="tenant-badge" style={{ marginTop: '0.5rem' }}>
              {user?.role}
            </div>
          </div>
        </div>

        <nav>
          <ul className="nav-menu">
            {navItems.map((item) => (
              <li key={item.route} className="nav-item">
                <Link 
                  to={item.route} 
                  className={`nav-link ${location.pathname === item.route ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <button 
            onClick={logout}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <div>
            <h1 className="header-title">
              {location.pathname === '/dashboard' ? 'Dashboard' : 
               location.pathname === '/dashboard/tickets' ? 'Support Tickets' :
               location.pathname === '/dashboard/products' ? 'Product Issues' :
               location.pathname === '/dashboard/shipments' ? 'Shipment Tracking' :
               location.pathname === '/dashboard/fleet' ? 'Fleet Management' :
               location.pathname === '/dashboard/admin' ? 'Admin Panel' : 'Dashboard'}
            </h1>
          </div>
          <div className="user-menu">
            <div className="user-info">
              Welcome, {user?.firstName}!
            </div>
          </div>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/tickets" element={<TicketsApp />} />
            <Route path="/products" element={<ProductIssuesApp />} />
            <Route path="/shipments" element={<ShipmentTrackingApp />} />
            <Route path="/fleet" element={<FleetManagementApp />} />
            {isAdmin && <Route path="/admin" element={<AdminPanel />} />}
          </Routes>
        </main>
      </div>
    </div>
  )
}

const DashboardHome = () => {
  const { user } = useAuth()
  
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Welcome to FlowBit</h2>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Multi-tenant workflow platform for {getTenantDisplayName(user?.customerId)}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="ticket-card">
          <h3 style={{ marginBottom: '1rem' }}>🎫 Support Tickets</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Manage and track customer support requests with automated workflows
          </p>
          <Link to="/dashboard/tickets" className="btn btn-primary">
            View Tickets
          </Link>
        </div>

        {user?.customerId === 'retailgmbh' && (
          <div className="ticket-card">
            <h3 style={{ marginBottom: '1rem' }}>📦 Product Issues</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Track and resolve product-related customer issues
            </p>
            <Link to="/dashboard/products" className="btn btn-primary">
              View Product Issues
            </Link>
          </div>
        )}

        {user?.customerId === 'logisticsco' && (
          <>
            <div className="ticket-card">
              <h3 style={{ marginBottom: '1rem' }}>🚚 Shipment Tracking</h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Monitor and track shipment deliveries in real-time
              </p>
              <Link to="/dashboard/shipments" className="btn btn-primary">
                Track Shipments
              </Link>
            </div>

            <div className="ticket-card">
              <h3 style={{ marginBottom: '1rem' }}>🚛 Fleet Management</h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Manage delivery vehicles and driver assignments
              </p>
              <Link to="/dashboard/fleet" className="btn btn-primary">
                Manage Fleet
              </Link>
            </div>
          </>
        )}

        {user?.role === 'Admin' && (
          <div className="ticket-card">
            <h3 style={{ marginBottom: '1rem' }}>⚙️ Admin Panel</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Administrative tools and tenant management dashboard
            </p>
            <Link to="/dashboard/admin" className="btn btn-primary">
              Admin Panel
            </Link>
          </div>
        )}

       
      </div>

      
    </div>
  )
}

export default Dashboard
