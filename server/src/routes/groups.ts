import { Router } from 'express';
import { readJson, writeJson, getNextId } from '../json-store.js';

interface TemplateGroup {
  id: number;
  templates_group_name: string;
  campaign_template_id: number;
  [key: string]: unknown;
}

const router = Router();

const FILE = 'template-groups.json';

router.get('/', (_req, res) => {
  const groups = readJson<TemplateGroup[]>(FILE);
  res.json(groups);
});

router.post('/', (req, res) => {
  const body = req.body;
  if (!body.templates_group_name || !body.campaign_template_id) {
    res.status(400).json({ error: 'Missing templates_group_name or campaign_template_id' });
    return;
  }

  const groups = readJson<TemplateGroup[]>(FILE);
  const id = getNextId(groups);
  const newGroup = { id, ...body };
  groups.push(newGroup);
  writeJson(FILE, groups);

  res.status(201).json(newGroup);
});

export default router;
