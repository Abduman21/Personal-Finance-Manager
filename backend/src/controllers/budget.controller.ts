import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BudgetService } from '../services/budget.service';
import { ReportService } from '../services/report.service';

export class BudgetController {
  static async getBudgets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const period = (req.query.period as string) || ReportService.getCurrentPeriodString();
      const budgets = await BudgetService.getBudgetsWithProgress(req.user!._id, period);
      res.status(200).json({ period, budgets });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const budget = await BudgetService.create(req.user!._id, req.body);
      res.status(201).json({ message: 'Budget created successfully', budget });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const budget = await BudgetService.update(req.user!._id, id, req.body);
      if (!budget) {
        res.status(404).json({ message: 'Budget not found or access denied.' });
        return;
      }
      res.status(200).json({ message: 'Budget updated successfully', budget });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const success = await BudgetService.delete(req.user!._id, id);
      if (!success) {
        res.status(404).json({ message: 'Budget not found or access denied.' });
        return;
      }
      res.status(200).json({ message: 'Budget deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}
