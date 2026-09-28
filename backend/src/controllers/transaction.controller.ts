import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TransactionService } from '../services/transaction.service';
import { convertTransactionsToCSV } from '../utils/csvExporter';

export class TransactionController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const transaction = await TransactionService.create(req.user!._id, req.body);
      res.status(201).json({ message: 'Transaction created successfully', transaction });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as any,
        categoryId: req.query.categoryId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await TransactionService.getFiltered(req.user!._id, filters);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const transaction = await TransactionService.getById(req.user!._id, id);
      if (!transaction) {
        res.status(404).json({ message: 'Transaction not found or access denied.' });
        return;
      }
      res.status(200).json({ transaction });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const transaction = await TransactionService.update(req.user!._id, id, req.body);
      if (!transaction) {
        res.status(404).json({ message: 'Transaction not found or access denied.' });
        return;
      }
      res.status(200).json({ message: 'Transaction updated successfully', transaction });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const success = await TransactionService.delete(req.user!._id, id);
      if (!success) {
        res.status(404).json({ message: 'Transaction not found or access denied.' });
        return;
      }
      res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  static async exportCSV(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as any,
        categoryId: req.query.categoryId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        search: req.query.search as string,
      };

      const transactions = await TransactionService.getAllForExport(req.user!._id, filters);
      const csvData = convertTransactionsToCSV(transactions);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=financeflow-transactions-${Date.now()}.csv`);
      res.status(200).send(csvData);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}
