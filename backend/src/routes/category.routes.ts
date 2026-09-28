import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', CategoryController.getAll);
router.post('/', validateRequest(createCategorySchema), CategoryController.create);
router.put('/:id', validateRequest(updateCategorySchema), CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;
