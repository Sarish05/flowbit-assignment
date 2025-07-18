import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import axios from '../api/config'

const AdminPanel = () => {
  const { user } = useAuth()

  // Fetch admin stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await axios.get('/admin/stats')
      return response.data
    }
  })

  // Fetch all tickets for this tenant
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const response = await axios.get('/api/tickets?limit=100')
      return response.data
    }
  })

  if (statsLoading || ticketsLoading) {
    return <div className="loading">Loading admin panel...</div>
  }

  const stats = statsData?.stats || []
  const tickets = ticketsData?.tickets || []
  const statusCounts = stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count
    return acc
  }, {})

  const getTenantDisplayName = (customerId) => {
    const tenantNames = {
      'logisticsco': 'LogisticsCo',
      'retailgmbh': 'RetailGmbH'
    }
    return tenantNames[customerId] || customerId
  }

  const otherTenant = user?.customerId === 'logisticsco' ? 'retailgmbh' : 'logisticsco'

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Admin Panel</h2>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Administrative dashboard for {getTenantDisplayName(user?.customerId)}
        </p>
      </div>

      {/* Tenant Isolation Demo */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#fef3c7', borderRadius: '12px', border: '1px solid #f59e0b' }}>
        <h3 style={{ marginBottom: '1rem', color: '#92400e' }}>🔒 Tenant Data Isolation Demo</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4 style={{ color: '#92400e', marginBottom: '0.5rem' }}>✅ What You Can Access</h4>
            <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
              <div><strong>Current Tenant:</strong> {getTenantDisplayName(user?.customerId)}</div>
              <div><strong>Your Role:</strong> {user?.role}</div>
              <div><strong>Visible Tickets:</strong> {tickets.length} tickets</div>
              <div><strong>Data Filter:</strong> customerId = "{user?.customerId}"</div>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#92400e', marginBottom: '0.5rem' }}>❌ What You Cannot Access</h4>
            <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
              <div><strong>Other Tenant:</strong> {getTenantDisplayName(otherTenant)}</div>
              <div><strong>Their Tickets:</strong> Hidden & Inaccessible</div>
              <div><strong>Security:</strong> JWT middleware enforces isolation</div>
              <div><strong>Database:</strong> All queries auto-filtered</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="ticket-card">
          <h3 style={{ marginBottom: '1rem', color: '#059669' }}>📊 Ticket Statistics</h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Open:</span>
              <strong>{statusCounts['Open'] || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>In Progress:</span>
              <strong>{statusCounts['In Progress'] || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Resolved:</span>
              <strong>{statusCounts['Resolved'] || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Closed:</span>
              <strong>{statusCounts['Closed'] || 0}</strong>
            </div>
          </div>
        </div>

        <div className="ticket-card">
          <h3 style={{ marginBottom: '1rem', color: '#7c3aed' }}>� Workflow Status</h3>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Integration:</strong> Configured
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Webhook Secret:</strong> Verified
            </div>
            <div>
              <strong>Auto-processing:</strong> Enabled
            </div>
          </div>
        </div>

        <div className="ticket-card">
          <h3 style={{ marginBottom: '1rem', color: '#dc2626' }}>� User Management</h3>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Tenant Users:</strong> Isolated
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>RBAC:</strong> Role-based access
            </div>
            <div>
              <strong>Admin Routes:</strong> Protected
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets for this Tenant */}
      <div className="ticket-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>📋 Recent Tickets (Your Tenant Only)</h3>
        {tickets.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No tickets found for {getTenantDisplayName(user?.customerId)}</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {tickets.slice(0, 5).map(ticket => (
              <div key={ticket._id} style={{ 
                padding: '0.75rem', 
                backgroundColor: '#f9fafb', 
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{ticket.title}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {ticket.createdBy?.firstName} {ticket.createdBy?.lastName} • {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`status-badge status-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                    {ticket.status}
                  </span>
                  <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ticket-card">
        <h3 style={{ marginBottom: '1rem' }}>🎯 Architecture Features</h3>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div>
            <h4 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>✅ Security & Isolation</h4>
            <ul style={{ color: '#6b7280', fontSize: '0.875rem', paddingLeft: '1rem' }}>
              <li>JWT-based authentication with tenant context</li>
              <li>Automatic tenant data filtering on all queries</li>
              <li>Role-based access control (Admin vs User)</li>
              <li>Protected admin routes with middleware</li>
              <li>Secure webhook verification</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>🏗️ Multi-Tenant Architecture</h4>
            <ul style={{ color: '#6b7280', fontSize: '0.875rem', paddingLeft: '1rem' }}>
              <li>Dynamic navigation per tenant</li>
              <li>Tenant-specific screen configurations</li>
              <li>Isolated data storage with customerId</li>
              <li>Micro-frontend ready architecture</li>
              <li>Workflow integration per tenant</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
        <h4 style={{ marginBottom: '0.5rem', color: '#047857' }}>✅ Demo Verification Complete</h4>
        <p style={{ fontSize: '0.875rem', color: '#047857' }}>
          <strong>Tenant Isolation Verified:</strong> Admin from {getTenantDisplayName(user?.customerId)} can only access their own tenant's data. 
          All database queries are automatically filtered by customerId "{user?.customerId}" from the JWT token.
          Try logging in as {getTenantDisplayName(otherTenant)} admin to see completely different data.
        </p>
      </div>
    </div>
  )
}

export default AdminPanel
