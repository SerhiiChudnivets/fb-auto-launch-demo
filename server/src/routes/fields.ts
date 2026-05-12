import { Router } from 'express';
import { readJson } from '../json-store.js';

const router = Router();

const VALID_LEVELS = ['campaign', 'adset', 'ad'] as const;

router.get('/:level', (req, res) => {
  const { level } = req.params;
  if (!(VALID_LEVELS as readonly string[]).includes(level)) {
    res.status(400).json({ error: `Invalid level: ${level}. Use campaign, adset, or ad.` });
    return;
  }
  const fields = readJson(`fields/${level}.json`);
  res.json(fields);
});

export default router;
