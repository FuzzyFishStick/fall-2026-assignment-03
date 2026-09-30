import { Router, Request, Response } from 'express';
import { getAllUsers, getUserById, createUser } from '../dal/users.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => 
{
  const users = await getAllUsers();
  res.status(200).json(users);
});

router.get('/:id', async (req: Request, res: Response) => 
{
  const id = Number(req.params.id);

  const user = await getUserById(id);

  if (!user) 
  {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.status(200).json(user);
});

router.post('/', async (req: Request, res: Response) => 
{
  const { name, email } = req.body;

  const user = await createUser({ name, email });

  res.status(201).json(user);
});

export default router;
