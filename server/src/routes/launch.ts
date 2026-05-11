import { Router } from 'express';
import db from '../db.js';
import { campaignLaunchFields, adsetLaunchFields, adLaunchFields } from '../seed.js';

const router = Router();

const launchFieldMap: Record<string, typeof campaignLaunchFields> = {
  campaign: campaignLaunchFields,
  adset: adsetLaunchFields,
  ad: adLaunchFields,
};

router.get('/fields/:level', (req, res) => {
  const fields = launchFieldMap[req.params.level];
  if (!fields) {
    res.status(400).json({ error: `Invalid level: ${req.params.level}` });
    return;
  }
  res.json(fields);
});

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT id, data_json FROM launch_groups ORDER BY id').all() as {
    id: number;
    data_json: string;
  }[];
  res.json(rows.map((r) => ({ id: r.id, ...JSON.parse(r.data_json) })));
});

router.post('/', (req, res) => {
  const body = req.body;
  if (!Array.isArray(body)) {
    res.status(400).json({ error: 'Body must be an array of launch groups' });
    return;
  }

  const insert = db.prepare('INSERT INTO launch_groups (data_json) VALUES (?)');
  const tx = db.transaction((groups: unknown[]) => {
    const ids: number[] = [];
    for (const group of groups) {
      const result = insert.run(JSON.stringify(group));
      ids.push(result.lastInsertRowid as number);
    }
    return ids;
  });

  const ids = tx(body);
  res.status(201).json({ ids, count: ids.length });
});

export default router;
