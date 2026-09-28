import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { RecurringService } from '../services/recurring.service';

export class RecurringController {
  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const items = await RecurringService.getAll(req.user!._id);
      res.status(200).json({ recurring: items });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const item = await RecurringService.create(req.user!._id, req.body);
      res.status(201).json({ message: 'Recurring transaction created successfully', recurring: item });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const item = await RecurringService.update(req.user!._id, id, req.body);
      if (!item) {
        res.status(404).json({ message: 'Recurring transaction not found or access denied.' });
        return;
      }
      res.status(200).json({ message: 'Recurring transaction updated successfully', recurring: item });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const success = await RecurringService.delete(req.user!._id, id);
      if (!success) {
        res.status(404).json({ message: 'Recurring transaction not found or access denied.' });
        return;
      }
      res.status(200).json({ message: 'Recurring transaction deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  static async process(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await RecurringService.processDue(req.user!._id);
      res.status(200).json({
        message: `Processed ${result.processedCount} due transaction(s).`,
        processedCount: result.processedCount,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}
