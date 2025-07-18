import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import axios from '../api/config'

const TicketsApp = () => {
  const { user, isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)

  // Fetch tickets
  const { data: ticketsData, isLoading, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await axios.get('/api/tickets')
      return response.data
    },
    refetchInterval: 5000 // Poll every 5 seconds for workflow updates
  })

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData) => {
      const response = await axios.post('/api/tickets', ticketData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tickets'])
      setShowCreateModal(false)
      toast.success('Support ticket created successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create ticket')
    }
  })

  // Update ticket mutation (Admin only)
  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const response = await axios.put(`/api/tickets/${id}`, updates)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tickets'])
      setSelectedTicket(null)
      toast.success('Ticket updated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update ticket')
    }
  })

  const tickets = ticketsData?.tickets || []

  const getStatusBadgeClass = (status) => {
    const classes = {
      'Open': 'status-open',
      'In Progress': 'status-in-progress', 
      'Resolved': 'status-resolved',
      'Closed': 'status-closed'
    }
    return `status-badge ${classes[status] || 'status-open'}`
  }

  const getPriorityBadgeClass = (priority) => {
    const classes = {
      'Low': 'priority-low',
      'Medium': 'priority-medium',
      'High': 'priority-high', 
      'Critical': 'priority-critical'
    }
    return `priority-badge ${classes[priority] || 'priority-medium'}`
  }

  const getWorkflowStatusIcon = (workflowStatus) => {
    const icons = {
      'Pending': '⏳',
      'Processing': '🔄',
      'Completed': '✅'
    }
    return icons[workflowStatus] || '❓'
  }

  if (isLoading) {
    return <div className="loading">Loading tickets...</div>
  }

  if (error) {
    return <div className="error-message">Failed to load tickets</div>
  }

  return (
    <div>
      <div className="tickets-header">
        <div>
          <h2>Support Tickets</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Tenant: {user?.customerId} • Total: {tickets.length}
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Create Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <h3>No tickets found</h3>
          <p>Create your first support ticket to get started</p>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="ticket-card">
              <div className="ticket-header">
                <h3 className="ticket-title">{ticket.title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span title={`Workflow: ${ticket.workflowStatus}`}>
                    {getWorkflowStatusIcon(ticket.workflowStatus)}
                  </span>
                  {isAdmin && (
                    <button 
                      onClick={() => setSelectedTicket(ticket)}
                      style={{ padding: '0.25rem', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </div>
              
              <div className="ticket-meta">
                <span className={getStatusBadgeClass(ticket.status)}>
                  {ticket.status}
                </span>
                <span className={getPriorityBadgeClass(ticket.priority)}>
                  {ticket.priority}
                </span>
                <span>
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                {ticket.description}
              </p>

              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                <div>Created by: {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}</div>
                {ticket.assignedTo && (
                  <div>Assigned to: {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</div>
                )}
                <div>Workflow: {ticket.workflowStatus}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal 
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createTicketMutation.mutate(data)}
          isLoading={createTicketMutation.isPending}
        />
      )}

      {/* Edit Ticket Modal (Admin only) */}
      {selectedTicket && isAdmin && (
        <EditTicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onSubmit={(data) => updateTicketMutation.mutate({ id: selectedTicket._id, ...data })}
          isLoading={updateTicketMutation.isPending}
        />
      )}
    </div>
  )
}

const CreateTicketModal = ({ onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Create New Ticket</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="Brief description of the issue"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={4}
              placeholder="Detailed description of the issue"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EditTicketModal = ({ ticket, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    status: ticket.status,
    priority: ticket.priority,
    assignedTo: ticket.assignedTo?._id || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Edit Ticket</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h4>{ticket.title}</h4>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>{ticket.description}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TicketsApp
