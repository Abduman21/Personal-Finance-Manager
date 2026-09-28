import { Router } from 'express';
import { RecurringController } from '../controllers/recurring.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createRecurringSchema, updateRecurringSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', RecurringController.getAll);
router.post('/', validateRequest(createRecurringSchema), RecurringController.create);
router.post('/process', RecurringController.process);
router.put('/:id', validateRequest(updateRecurringSchema), RecurringController.update);
router.delete('/:id', RecurringController.delete);

export default router;
