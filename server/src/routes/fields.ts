import { Router } from 'express';
import { campaignFields, adsetFields, adFields } from '../seed.js';

const router = Router();

const fieldMap: Record<string, typeof campaignFields> = {
  campaign: campaignFields,
  adset: adsetFields,
  ad: adFields,
};

router.get('/:level', (req, res) => {
  const fields = fieldMap[req.params.level];
  if (!fields) {
    res.status(400).json({ error: `Invalid level: ${req.params.level}. Use campaign, adset, or ad.` });
    return;
  }
  res.json(fields);
});

export default router;
