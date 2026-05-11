import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT id, name, data_json FROM template_groups ORDER BY id').all() as {
    id: number;
    name: string;
    data_json: string;
  }[];

  const groups = rows.map((row) => ({
    id: row.id,
    ...JSON.parse(row.data_json),
  }));

  res.json(groups);
});

router.post('/', (req, res) => {
  const body = req.body;
  if (!body.templates_group_name || !body.campaign_template_id) {
    res.status(400).json({ error: 'Missing templates_group_name or campaign_template_id' });
    return;
  }

  const result = db.prepare(
    'INSERT INTO template_groups (name, data_json) VALUES (?, ?)',
  ).run(body.templates_group_name, JSON.stringify(body));

  res.status(201).json({ id: result.lastInsertRowid, ...body });
});

export default router;
