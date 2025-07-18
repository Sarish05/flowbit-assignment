import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'

const Login = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register, handleSubmit, formState: { errors } } = useForm()

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    
    const result = await login(data.email, data.password)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
    
    setIsLoading(false)
  }

  const demoCredentials = [
    { 
      label: 'LogisticsCo Admin', 
      email: 'admin@logisticsco.com', 
      password: 'password123',
      tenant: 'LogisticsCo',
      role: 'Admin'
    },
    { 
      label: 'RetailGmbH Admin', 
      email: 'admin@retailgmbh.com', 
      password: 'password123',
      tenant: 'RetailGmbH',
      role: 'Admin'
    },
    { 
      label: 'LogisticsCo User', 
      email: 'user@logisticsco.com', 
      password: 'password123',
      tenant: 'LogisticsCo',
      role: 'User'
    },
    { 
      label: 'RetailGmbH User', 
      email: 'user@retailgmbh.com', 
      password: 'password123',
      tenant: 'RetailGmbH',
      role: 'User'
    }
  ]

  const fillDemo = (creds) => {
    const emailInput = document.querySelector('input[name="email"]')
    const passwordInput = document.querySelector('input[name="password"]')
    
    emailInput.value = creds.email
    passwordInput.value = creds.password
    
    // Trigger change events for react-hook-form
    emailInput.dispatchEvent(new Event('input', { bubbles: true }))
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>FlowBit</h1>
          <span className="tenant-badge">Multi-Tenant Platform</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format'
                }
              })}
              placeholder="Enter your email"
            />
            {errors.email && (
              <div className="error-message">{errors.email.message}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              placeholder="Enter your password"
            />
            {errors.password && (
              <div className="error-message">{errors.password.message}</div>
            )}
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          <p>Use your organization credentials to access FlowBit</p>
        </div>
      </div>
    </div>
  )
}

export default Login
