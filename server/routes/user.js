/**
 * User Routes
 * API для работы с пользователями
 */
import { Router } from 'express';
import { getUserData, createOrUpdateUser } from '../services/storage.js';

const router = Router();

/**
 * GET /api/user/:telegram_id
 * Получить данные пользователя
 */
router.get('/:telegram_id', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    
    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    const userData = await getUserData(telegram_id);
    
    if (!userData) {
      // Создаём нового пользователя
      const newUser = await createOrUpdateUser(telegram_id, {
        telegram_id: parseInt(telegram_id),
        created_at: new Date().toISOString(),
      });
      return res.json(newUser);
    }

    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

/**
 * POST /api/user/:telegram_id
 * Обновить данные пользователя
 */
router.post('/:telegram_id', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    const updates = req.body;

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    const userData = await createOrUpdateUser(telegram_id, updates);
    res.json(userData);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user data' });
  }
});

export default router;