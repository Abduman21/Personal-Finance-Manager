import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ReportService } from '../services/report.service';

export class ReportController {
  static async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await ReportService.getDashboardOverview(req.user!._id);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  static async getReports(req: AuthRequest, res: Response): Promise<void> {
    try {
      const options = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        year: req.query.year ? Number(req.query.year) : undefined,
      };

      const data = await ReportService.getReports(req.user!._id, options);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}
