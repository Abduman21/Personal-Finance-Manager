import { Router } from 'express';
import { SavingsController } from '../controllers/savings.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  contributeSavingsGoalSchema,
} from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', SavingsController.getAll);
router.post('/', validateRequest(createSavingsGoalSchema), SavingsController.create);
router.put('/:id', validateRequest(updateSavingsGoalSchema), SavingsController.update);
router.post('/:id/contribute', validateRequest(contributeSavingsGoalSchema), SavingsController.contribute);
router.delete('/:id', SavingsController.delete);

export default router;
