import express from 'express';
import { createKOT, getKOTById } from '../controllers/kotController.js';

const router = express.Router();

router.post('/', createKOT);      // POST /api/kot
router.get('/:id', getKOTById);   // GET /api/kot/:id

export default router;