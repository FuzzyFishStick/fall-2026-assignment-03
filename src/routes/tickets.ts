import { Router, Request, Response } from 'express';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
} from '../dal/tickets.js';
import authMiddleware from '../middleware/auth.js';
import {
  insertTimeLog,
  getTotalHoursForTicket,
} from '../dal/timeLogs.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const limit =
    req.query.limit !== undefined ? Number(req.query.limit) : undefined;

  const offset =
    req.query.offset !== undefined ? Number(req.query.offset) : undefined;

  const status =
    typeof req.query.status === 'string' ? req.query.status : undefined;

  if (
    (limit !== undefined &&
      (!Number.isInteger(limit) || limit < 0)) ||
    (offset !== undefined &&
      (!Number.isInteger(offset) || offset < 0))
  ) {
    res.status(400).json({ error: 'Invalid pagination parameters' });
    return;
  }

  const tickets = await getAllTickets({
    limit,
    offset,
    status,
  });

  res.status(200).json(tickets);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const ticket = await getTicketById(id);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.status(200).json(ticket);
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { title, description } = req.body;

  if (
    typeof title !== 'string' ||
    title.trim() === '' ||
    (description !== undefined && description !== null &&
      typeof description !== 'string')
  ) {
    res.status(400).json({ error: 'Invalid ticket payload' });
    return;
  }

  const ticket = await createTicket({
    title,
    description: description ?? null,
    creator_id: res.locals.userId,
  });

  res.status(201).json(ticket);
});

router.patch(
  '/:id/status',
  authMiddleware,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    if (
      status !== 'TODO' &&
      status !== 'IN_PROGRESS' &&
      status !== 'DONE'
    ) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const ticket = await updateTicketStatus(id, status);

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.status(200).json(ticket);
  },
);

// POST /tickets/:id/time
router.post(
  '/:id/time',
  authMiddleware,
  async (req: Request, res: Response) => {
    const ticketId = Number(req.params.id);
    const userId = res.locals.userId;
    const { hours } = req.body;

    if (
      !Number.isInteger(ticketId) ||
      ticketId < 1 ||
      typeof hours !== 'number' ||
      hours <= 0
    ) {
      res.status(400).json({ error: 'Invalid time log payload' });
      return;
    }

    const timeLog = await insertTimeLog(ticketId, userId, hours);

    res.status(201).json(timeLog);
  },
);

router.get(
  '/:id/time',
  async (req: Request, res: Response) => {
    const ticketId = Number(req.params.id);

    if (!Number.isInteger(ticketId) || ticketId < 1) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const totalHours = await getTotalHoursForTicket(ticketId);

    res.status(200).json({
      ticket_id: ticketId,
      total_hours: totalHours,
    });
  },
);

export default router;
