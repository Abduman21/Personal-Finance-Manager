import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createTransactionSchema, updateTransactionSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', TransactionController.getAll);
router.get('/export/csv', TransactionController.exportCSV);
router.get('/:id', TransactionController.getById);
router.post('/', validateRequest(createTransactionSchema), TransactionController.create);
router.put('/:id', validateRequest(updateTransactionSchema), TransactionController.update);
router.delete('/:id', TransactionController.delete);

export default router;
