import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const FleetManagementApp = () => {
  const { user } = useAuth()

  // Check if user has access to this screen
  if (user?.customerId !== 'logisticsco') {
    return (
      <div className="empty-state">
        <h3>Access Denied</h3>
        <p>Fleet Management is only available for LogisticsCo organization</p>
      </div>
    )
  }

  const fleetVehicles = [
    {
      id: 'TRUCK-001',
      type: 'Delivery Truck',
      driver: 'John Smith', 
      status: 'On Route',
      location: 'Downtown Chicago',
      fuelLevel: 85,
      lastUpdate: '10 mins ago'
    },
    {
      id: 'VAN-002',
      type: 'Delivery Van',
      driver: 'Sarah Johnson',
      status: 'Available', 
      location: 'Warehouse',
      fuelLevel: 92,
      lastUpdate: '5 mins ago'
    },
    {
      id: 'TRUCK-003',
      type: 'Heavy Truck',
      driver: 'Mike Wilson',
      status: 'Maintenance',
      location: 'Service Center',
      fuelLevel: 45,
      lastUpdate: '2 hours ago'
    }
  ]

  const getStatusColor = (status) => {
    const colors = {
      'Available': '#10b981',
      'On Route': '#3b82f6', 
      'Maintenance': '#f59e0b',
      'Offline': '#6b7280'
    }
    return colors[status] || '#6b7280'
  }

  const getVehicleIcon = (type) => {
    const icons = {
      'Delivery Truck': '🚚',
      'Delivery Van': '🚐',
      'Heavy Truck': '🚛'
    }
    return icons[type] || '🚗'
  }

  const getFuelColor = (level) => {
    if (level > 70) return '#10b981'
    if (level > 30) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div>
      <div className="tickets-header">
        <div>
          <h2>Fleet Management</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Monitor and manage delivery vehicles and drivers
          </p>
        </div>
        <button className="btn btn-primary">
          + Add Vehicle
        </button>
      </div>

      <div className="tickets-grid">
        {fleetVehicles.map((vehicle) => (
          <div key={vehicle.id} className="ticket-card">
            <div className="ticket-header">
              <h3 className="ticket-title">
                {getVehicleIcon(vehicle.type)} {vehicle.id}
              </h3>
              <span 
                className="status-badge"
                style={{ 
                  backgroundColor: getStatusColor(vehicle.status) + '20',
                  color: getStatusColor(vehicle.status)
                }}
              >
                {vehicle.status}
              </span>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                <strong>Type:</strong> {vehicle.type}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                <strong>Driver:</strong> {vehicle.driver}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                <strong>Location:</strong> {vehicle.location}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                <strong>Last Update:</strong> {vehicle.lastUpdate}
              </div>
              
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                  Fuel Level: {vehicle.fuelLevel}%
                </span>
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
                    width: `${vehicle.fuelLevel}%`, 
                    height: '100%', 
                    backgroundColor: getFuelColor(vehicle.fuelLevel),
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                View Details
              </button>
              <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                Assign Route
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '1rem' }}>🚛 Fleet Overview</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fff', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#10b981' }}>1</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Available Vehicles</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fff', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#3b82f6' }}>1</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>On Route</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fff', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f59e0b' }}>1</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>In Maintenance</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fff', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#6b7280' }}>74%</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Avg Fuel Level</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FleetManagementApp
