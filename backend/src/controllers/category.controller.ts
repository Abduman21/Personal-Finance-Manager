import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const categories = await CategoryService.getUserCategories(req.user!._id);
      res.status(200).json({ categories });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const category = await CategoryService.createCategory(req.user!._id, req.body);
      res.status(201).json({ message: 'Category created successfully', category });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const category = await CategoryService.updateCategory(req.user!._id, id, req.body);
      if (!category) {
        res.status(404).json({ message: 'Category not found or access denied.' });
        return;
      }
      res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await CategoryService.deleteCategory(req.user!._id, id);
      if (!result.success) {
        res.status(400).json({ message: result.message || 'Could not delete category.' });
        return;
      }
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}
