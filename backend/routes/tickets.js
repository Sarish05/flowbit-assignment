const express = require('express');
const axios = require('axios');
const Ticket = require('../models/Ticket');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all tickets for current tenant
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { customerId } = req.user;
    const { status, priority, page = 1, limit = 10 } = req.query;

    // Build query with tenant isolation
    const query = { customerId };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;
    
    const tickets = await Ticket.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ticket.countDocuments(query);

    res.json({
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching tickets' });
  }
});

// Get single ticket
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { customerId } = req.user;
    
    const ticket = await Ticket.findOne({ 
      _id: req.params.id, 
      customerId 
    })
    .populate('createdBy', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching ticket' });
  }
});

// Create new ticket and trigger n8n workflow
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { customerId, userId } = req.user;
    const { title, description, priority } = req.body;

    // Create ticket
    const ticket = new Ticket({
      title,
      description,
      priority: priority || 'Medium',
      customerId,
      createdBy: userId,
      workflowStatus: 'Pending'
    });

    await ticket.save();

    // Populate user data for response
    await ticket.populate('createdBy', 'firstName lastName email');

    // Trigger n8n workflow (non-blocking)
    try {
      if (process.env.N8N_WEBHOOK_URL) {
        const workflowPayload = {
          ticketId: ticket._id,
          customerId: ticket.customerId,
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          createdAt: ticket.createdAt,
          callbackUrl: `${process.env.API_BASE_URL || 'http://localhost:5000'}/webhook/ticket-done`,
          webhookSecret: process.env.WEBHOOK_SECRET
        };

        // Fire and forget - don't wait for n8n response
        axios.post(process.env.N8N_WEBHOOK_URL, workflowPayload, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          },
          auth: {
            username: 'admin@flowbit.com',
            password: 'Password123'
          }
        }).then(() => {
          console.log(`Workflow triggered for ticket ${ticket._id}`);
          // Update workflow status
          Ticket.findByIdAndUpdate(ticket._id, { 
            workflowStatus: 'Processing' 
          }).exec();
        }).catch(error => {
          console.error('Failed to trigger n8n workflow:', error.message);
        });
      }
    } catch (workflowError) {
      console.error('n8n workflow trigger failed:', workflowError.message);
    }

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error creating ticket' });
  }
});

// Update ticket (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { customerId } = req.user;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.customerId;
    delete updates.createdBy;
    delete updates._id;

    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, customerId },
      updates,
      { new: true }
    )
    .populate('createdBy', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating ticket' });
  }
});

// Delete ticket (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { customerId } = req.user;
    
    const ticket = await Ticket.findOneAndDelete({ 
      _id: req.params.id, 
      customerId 
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting ticket' });
  }
});

module.exports = router;
