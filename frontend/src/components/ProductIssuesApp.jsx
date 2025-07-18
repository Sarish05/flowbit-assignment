import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import axios from '../api/config'

const ProductIssuesApp = () => {
  const { user, isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState(null)

  // For demo purposes, we'll use the same ticket backend but with different UI context
  const { data: issuesData, isLoading, error } = useQuery({
    queryKey: ['product-issues'],
    queryFn: async () => {
      const response = await axios.get('/api/tickets?category=product')
      return response.data
    },
    refetchInterval: 5000
  })

  const createIssueMutation = useMutation({
    mutationFn: async (issueData) => {
      const response = await axios.post('/api/tickets', {
        ...issueData,
        category: 'product'
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['product-issues'])
      setShowCreateModal(false)
      toast.success('Product issue created successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create product issue')
    }
  })

  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const response = await axios.put(`/api/tickets/${id}`, updates)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['product-issues'])
      setSelectedIssue(null)
      toast.success('Product issue updated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update product issue')
    }
  })

  const issues = issuesData?.tickets || []

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

  // Check if user has access to this screen
  if (user?.customerId !== 'retailgmbh') {
    return (
      <div className="empty-state">
        <h3>Access Denied</h3>
        <p>Product Issues are only available for RetailGmbH organization</p>
      </div>
    )
  }

  if (isLoading) {
    return <div className="loading">Loading product issues...</div>
  }

  if (error) {
    return <div className="error-message">Failed to load product issues</div>
  }

  return (
    <div>
      <div className="tickets-header">
        <div>
          <h2>Product Issues</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Track and resolve product-related customer issues • Total: {issues.length}
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Report Product Issue
        </button>
      </div>

      {issues.length === 0 ? (
        <div className="empty-state">
          <h3>No product issues found</h3>
          <p>Report your first product issue to get started</p>
        </div>
      ) : (
        <div className="tickets-grid">
          {issues.map((issue) => (
            <div key={issue._id} className="ticket-card">
              <div className="ticket-header">
                <h3 className="ticket-title">📦 {issue.title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span title={`Workflow: ${issue.workflowStatus}`}>
                    {getWorkflowStatusIcon(issue.workflowStatus)}
                  </span>
                  {isAdmin && (
                    <button 
                      onClick={() => setSelectedIssue(issue)}
                      style={{ padding: '0.25rem', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </div>
              
              <div className="ticket-meta">
                <span className={getStatusBadgeClass(issue.status)}>
                  {issue.status}
                </span>
                <span className={getPriorityBadgeClass(issue.priority)}>
                  {issue.priority}
                </span>
                <span>
                  {new Date(issue.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                {issue.description}
              </p>

              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                <div>Reported by: {issue.createdBy?.firstName} {issue.createdBy?.lastName}</div>
                {issue.assignedTo && (
                  <div>Assigned to: {issue.assignedTo.firstName} {issue.assignedTo.lastName}</div>
                )}
                <div>Workflow: {issue.workflowStatus}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Issue Modal */}
      {showCreateModal && (
        <CreateIssueModal 
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createIssueMutation.mutate(data)}
          isLoading={createIssueMutation.isPending}
        />
      )}

      {/* Edit Issue Modal (Admin only) */}
      {selectedIssue && isAdmin && (
        <EditIssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onSubmit={(data) => updateIssueMutation.mutate({ id: selectedIssue._id, ...data })}
          isLoading={updateIssueMutation.isPending}
        />
      )}
    </div>
  )
}

const CreateIssueModal = ({ onClose, onSubmit, isLoading }) => {
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
          <h3 className="modal-title">Report Product Issue</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product/Issue Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="e.g., Defective smartphone screen, Missing product parts"
            />
          </div>

          <div className="form-group">
            <label>Issue Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={4}
              placeholder="Detailed description of the product issue, including product model, order number, etc."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label>Priority Level</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="Low">Low - Minor cosmetic issues</option>
              <option value="Medium">Medium - Functional problems</option>
              <option value="High">High - Product not working</option>
              <option value="Critical">Critical - Safety concerns</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Reporting...' : 'Report Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EditIssueModal = ({ issue, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    status: issue.status,
    priority: issue.priority,
    assignedTo: issue.assignedTo?._id || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Edit Product Issue</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h4>📦 {issue.title}</h4>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>{issue.description}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="Open">Open - Awaiting review</option>
              <option value="In Progress">In Progress - Being resolved</option>
              <option value="Resolved">Resolved - Issue fixed</option>
              <option value="Closed">Closed - Completed</option>
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
              {isLoading ? 'Updating...' : 'Update Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductIssuesApp
