import express from 'express';
import { eventSourcingController } from './eventSourcingController';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = express.Router();

// Apply middleware to all routes - requires authentication
router.use(authMiddleware);

// Get all events
router.get('/', eventSourcingController.getAllEvents);

// Get event types
router.get('/types', eventSourcingController.getEventTypes);

// Get event by ID
router.get('/:id', eventSourcingController.getEventById);

// Create event
router.post('/', eventSourcingController.createEvent);

// Delete event
router.delete('/:id', eventSourcingController.deleteEvent);

// Get events by aggregate type and ID
router.get('/aggregate/:type/:id', eventSourcingController.getEventsByAggregate);

export default router;