import { Router } from 'express';
import { readJson, writeJson, getNextId } from '../json-store.js';

interface TemplateRecord {
  id: number;
  name: string;
  description: string;
  values_json: { name: string; value: unknown }[];
}

const router = Router();

const VALID_LEVELS = ['campaign', 'adset', 'ad'] as const;

function isValidLevel(level: string): level is (typeof VALID_LEVELS)[number] {
  return (VALID_LEVELS as readonly string[]).includes(level);
}

router.get('/', (_req, res) => {
  const campaign_templates = readJson<TemplateRecord[]>('templates/campaign.json')
    .map(({ id, name, description }) => ({ id, name, description }));
  const adset_templates = readJson<TemplateRecord[]>('templates/adset.json')
    .map(({ id, name, description }) => ({ id, name, description }));
  const ad_templates = readJson<TemplateRecord[]>('templates/ad.json')
    .map(({ id, name, description }) => ({ id, name, description }));

  res.json({ campaign_templates, adset_templates, ad_templates });
});

router.get('/:level', (req, res) => {
  const { level } = req.params;
  if (!isValidLevel(level)) {
    res.status(400).json({ error: `Invalid level: ${level}` });
    return;
  }
  const templates = readJson<TemplateRecord[]>(`templates/${level}.json`);
  const rows = templates.map((t) => ({
    ...t,
    values_json: JSON.stringify(t.values_json),
  }));
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

  const filePath = `templates/${level}.json`;
  const templates = readJson<TemplateRecord[]>(filePath);

  const nameField = values.find((v: { name: string }) => v.name === 'template_name');
  const name = nameField?.value ?? `${level}_template`;
  const description = `${level} template`;
  const id = getNextId(templates);

  const newTemplate: TemplateRecord = { id, name, description, values_json: values };
  templates.push(newTemplate);
  writeJson(filePath, templates);

  res.status(201).json({ id, name, description, level });
});

export default router;
