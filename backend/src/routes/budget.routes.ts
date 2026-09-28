import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createBudgetSchema, updateBudgetSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', BudgetController.getBudgets);
router.post('/', validateRequest(createBudgetSchema), BudgetController.create);
router.put('/:id', validateRequest(updateBudgetSchema), BudgetController.update);
router.delete('/:id', BudgetController.delete);

export default router;
