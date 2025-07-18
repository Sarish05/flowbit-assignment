import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const ShipmentTrackingApp = () => {
  const { user } = useAuth()

  // Check if user has access to this screen
  if (user?.customerId !== 'logisticsco') {
    return (
      <div className="empty-state">
        <h3>Access Denied</h3>
        <p>Shipment Tracking is only available for LogisticsCo organization</p>
      </div>
    )
  }

  const sampleShipments = [
    {
      id: 'LG001',
      destination: 'New York, NY',
      status: 'In Transit',
      estimatedDelivery: '2025-07-20',
      progress: 75
    },
    {
      id: 'LG002', 
      destination: 'Chicago, IL',
      status: 'Delivered',
      estimatedDelivery: '2025-07-18',
      progress: 100
    },
    {
      id: 'LG003',
      destination: 'Los Angeles, CA', 
      status: 'Processing',
      estimatedDelivery: '2025-07-22',
      progress: 25
    }
  ]

  const getStatusColor = (status) => {
    const colors = {
      'Processing': '#f59e0b',
      'In Transit': '#3b82f6',
      'Delivered': '#10b981',
      'Delayed': '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  return (
    <div>
      <div className="tickets-header">
        <div>
          <h2>Shipment Tracking</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Monitor and track shipment deliveries in real-time
          </p>
        </div>
        <button className="btn btn-primary">
          + New Shipment
        </button>
      </div>

      <div className="tickets-grid">
        {sampleShipments.map((shipment) => (
          <div key={shipment.id} className="ticket-card">
            <div className="ticket-header">
              <h3 className="ticket-title">🚚 Shipment {shipment.id}</h3>
              <span 
                className="status-badge"
                style={{ 
                  backgroundColor: getStatusColor(shipment.status) + '20',
                  color: getStatusColor(shipment.status)
                }}
              >
                {shipment.status}
              </span>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                <strong>Destination:</strong> {shipment.destination}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                <strong>Est. Delivery:</strong> {new Date(shipment.estimatedDelivery).toLocaleDateString()}
              </div>
              
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>Progress: {shipment.progress}%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#e5e7eb', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div 
                  style={{ 
                    width: `${shipment.progress}%`, 
                    height: '100%', 
                    backgroundColor: getStatusColor(shipment.status),
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                Track Details
              </button>
              <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                Update Status
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>📊 Shipment Statistics</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f59e0b' }}>1</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Processing</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#3b82f6' }}>1</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>In Transit</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#10b981' }}>1</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Delivered</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShipmentTrackingApp
