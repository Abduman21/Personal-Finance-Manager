import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', ReportController.getDashboard);
router.get('/analytics', ReportController.getReports);

export default router;
