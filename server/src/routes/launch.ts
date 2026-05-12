import { Router } from 'express';
import { readJson, writeJson, getNextId } from '../json-store.js';

interface LaunchGroup {
  id: number;
  [key: string]: unknown;
}

const router = Router();

const VALID_LEVELS = ['campaign', 'adset', 'ad'] as const;
const FILE = 'launch-groups.json';

router.get('/fields/:level', (req, res) => {
  const { level } = req.params;
  if (!(VALID_LEVELS as readonly string[]).includes(level)) {
    res.status(400).json({ error: `Invalid level: ${req.params.level}` });
    return;
  }
  const fields = readJson(`launch-fields/${level}.json`);
  res.json(fields);
});

router.get('/', (_req, res) => {
  const groups = readJson<LaunchGroup[]>(FILE);
  res.json(groups);
});

router.post('/', (req, res) => {
  const body = req.body;
  if (!Array.isArray(body)) {
    res.status(400).json({ error: 'Body must be an array of launch groups' });
    return;
  }

  const groups = readJson<LaunchGroup[]>(FILE);
  const ids: number[] = [];

  for (const group of body) {
    const id = getNextId(groups);
    const newGroup = { id, ...group };
    groups.push(newGroup);
    ids.push(id);
  }

  writeJson(FILE, groups);
  res.status(201).json({ ids, count: ids.length });
});

export default router;
