import { Router } from 'express';
import db from '../db.js';

const router = Router();

const VALID_LEVELS = ['campaign', 'adset', 'ad'] as const;

function isValidLevel(level: string): level is (typeof VALID_LEVELS)[number] {
  return (VALID_LEVELS as readonly string[]).includes(level);
}

function withLevelId(rows: { id: number; name: string; description: string }[]) {
  return rows.map((row, idx) => ({ ...row, id: idx + 1 }));
}

router.get('/', (_req, res) => {
  const campaign_templates = withLevelId(db.prepare(
    "SELECT id, name, description FROM templates WHERE level = 'campaign' ORDER BY id",
  ).all() as { id: number; name: string; description: string }[]);
  const adset_templates = withLevelId(db.prepare(
    "SELECT id, name, description FROM templates WHERE level = 'adset' ORDER BY id",
  ).all() as { id: number; name: string; description: string }[]);
  const ad_templates = withLevelId(db.prepare(
    "SELECT id, name, description FROM templates WHERE level = 'ad' ORDER BY id",
  ).all() as { id: number; name: string; description: string }[]);

  res.json({ campaign_templates, adset_templates, ad_templates });
});

router.get('/:level', (req, res) => {
  const { level } = req.params;
  if (!isValidLevel(level)) {
    res.status(400).json({ error: `Invalid level: ${level}` });
    return;
  }
  const rows = db.prepare(
    'SELECT id, name, description, values_json FROM templates WHERE level = ? ORDER BY id',
  ).all(level);
  res.json(rows);
});

router.post('/:level', (req, res) => {
  const { level } = req.params;
  if (!isValidLevel(level)) {
    res.status(400).json({ error: `Invalid level: ${level}` });
    return;
  }

  const { values } = req.body;
  if (!Array.isArray(values)) {
    res.status(400).json({ error: 'Body must contain "values" array' });
    return;
  }

  const nameField = values.find((v: { name: string }) => v.name === 'template_name');
  const name = nameField?.value ?? `${level}_template`;
  const description = `${level} template`;

  const result = db.prepare(
    'INSERT INTO templates (level, name, description, values_json) VALUES (?, ?, ?, ?)',
  ).run(level, name, description, JSON.stringify(values));

  res.status(201).json({
    id: result.lastInsertRowid,
    name,
    description,
    level,
  });
});

export default router;
