const express = require('express');
const Ticket = require('../models/Ticket');
const { verifyWebhookSecret } = require('../middleware/auth');

const router = express.Router();

// n8n webhook callback for ticket processing completion
router.post('/ticket-done', verifyWebhookSecret, async (req, res) => {
  try {
    const { ticketId, status, workflowData } = req.body;

    console.log(`Webhook received for ticket ${ticketId}:`, req.body);

    // Find and update ticket
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Update ticket based on workflow response
    const updates = {
      workflowStatus: 'Completed',
      updatedAt: new Date()
    };

    // Update status if provided by workflow
    if (status && ['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      updates.status = status;
    } else {
      // Default behavior: move to "In Progress" after workflow processing
      updates.status = 'In Progress';
    }

    // Store any additional workflow data
    if (workflowData) {
      updates.workflowData = workflowData;
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      updates,
      { new: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('assignedTo', 'firstName lastName email');

    console.log(`Ticket ${ticketId} updated successfully:`, {
      status: updatedTicket.status,
      workflowStatus: updatedTicket.workflowStatus
    });

    // In a real app, you'd broadcast this update via WebSocket
    // For now, we'll just log it
    console.log(`Broadcasting update for ticket ${ticketId} to tenant ${updatedTicket.customerId}`);

    res.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Server error processing webhook' });
  }
});

// Health check endpoint for n8n
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'flowbit-webhook-receiver'
  });
});

module.exports = router;
