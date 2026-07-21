import express from 'express';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/itemController.js';

const router = express.Router();

router.route('/')
  .get(getMenuItems)
  .post(createMenuItem);

router.route('/:id')
  .put(updateMenuItem)
  .delete(deleteMenuItem);

export default router;