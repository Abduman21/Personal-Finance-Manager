import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SavingsService } from '../services/savings.service';

export class SavingsController {
  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const goals = await SavingsService.getAll(req.user!._id);
      res.status(200).json({ goals });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const goal = await SavingsService.create(req.user!._id, req.body);
      res.status(201).json({ message: 'Savings goal created successfully', goal });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const goal = await SavingsService.update(req.user!._id, id, req.body);
      if (!goal) {
        res.status(404).json({ message: 'Savings goal not found or access denied.' });
        return;
      }
      res.status(200).json({ message: 'Savings goal updated successfully', goal });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async contribute(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { amount } = req.body;
      const goal = await SavingsService.contribute(req.user!._id, id, amount);
      res.status(200).json({ message: 'Contribution added successfully', goal });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const success = await SavingsService.delete(req.user!._id, id);
      if (!success) {
        res.status(404).json({ message: 'Savings goal not found or access denied.' });
        return;
      }
      res.status(200).json({ message: 'Savings goal deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}
