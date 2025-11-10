import { Router } from 'express';
import * as taskController from '@/api/v1/internal/task/controller';
import * as taskDetailController from '@/api/v1/internal/task/detail/controller';
import * as categoryController from '@/api/v1/internal/category/controller';
import * as categoryDetailController from '@/api/v1/internal/category/detail/controller';

const router = Router();

// Task routes
router.get('/task', taskController.getHandler);
router.post('/task', taskController.postHandler);
router.get('/task/:id', taskDetailController.getHandler);

// Category routes
router.get('/category', categoryController.getHandler);
router.post('/category', categoryController.postHandler);
router.get('/category/:id', categoryDetailController.getHandler);
router.put('/category/:id', categoryDetailController.putHandler);
router.delete('/category/:id', categoryDetailController.deleteHandler);
router.patch('/category/:id/archive', categoryDetailController.patchHandler);

export default router;
