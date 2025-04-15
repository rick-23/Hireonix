import express from 'express';
import { healthCheck } from '../utils/healthCheck';

const router = express.Router();

/* GET home page. */
router.get('/', healthCheck);

export default router;
