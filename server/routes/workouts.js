/**
 * Workouts Routes
 * API для работы с тренировками
 */
import { Router } from 'express';
import { 
  getWorkouts, 
  addWorkout, 
  deleteWorkout, 
  getAchievements,
  updateAchievements 
} from '../services/storage.js';

const router = Router();

/**
 * GET /api/workouts/:telegram_id
 * Получить тренировки пользователя
 */
router.get('/:telegram_id', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    
    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    const workouts = await getWorkouts(telegram_id);
    res.json(workouts || []);
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Failed to get workouts' });
  }
});

/**
 * POST /api/workout
 * Добавить новую тренировку
 */
router.post('/', async (req, res) => {
  try {
    const { telegram_id, date, type, duration, moodBefore, moodAfter, note } = req.body;

    if (!telegram_id || !type) {
      return res.status(400).json({ error: 'telegram_id and type are required' });
    }

    const workout = {
      id: Date.now().toString(),
      date: date || new Date().toISOString().split('T')[0],
      type,
      duration: duration || 30,
      moodBefore: moodBefore || 3,
      moodAfter: moodAfter || 3,
      note: note || '',
      createdAt: new Date().toISOString(),
    };

    await addWorkout(telegram_id, workout);
    res.json(workout);
  } catch (error) {
    console.error('Add workout error:', error);
    res.status(500).json({ error: 'Failed to add workout' });
  }
});

/**
 * DELETE /api/workout/:telegram_id/:workout_id
 * Удалить тренировку
 */
router.delete('/:telegram_id/:workout_id', async (req, res) => {
  try {
    const { telegram_id, workout_id } = req.params;

    if (!telegram_id || !workout_id) {
      return res.status(400).json({ error: 'telegram_id and workout_id are required' });
    }

    await deleteWorkout(telegram_id, workout_id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

/**
 * GET /api/workouts/:telegram_id/achievements
 * Получить достижения пользователя
 */
router.get('/:telegram_id/achievements', async (req, res) => {
  try {
    const { telegram_id } = req.params;

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    const achievements = await getAchievements(telegram_id);
    res.json(achievements || {});
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

/**
 * POST /api/workouts/:telegram_id/achievements
 * Обновить достижения пользователя
 */
router.post('/:telegram_id/achievements', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    const achievements = req.body;

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    await updateAchievements(telegram_id, achievements);
    res.json({ success: true });
  } catch (error) {
    console.error('Update achievements error:', error);
    res.status(500).json({ error: 'Failed to update achievements' });
  }
});

export default router;