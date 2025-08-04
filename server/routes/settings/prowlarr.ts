import type { ProwlarrSettings } from '@server/lib/settings';
import { getSettings } from '@server/lib/settings';
import { Router } from 'express';

const prowlarrRoutes = Router();

prowlarrRoutes.get('/', (_req, res) => {
  const settings = getSettings();
  return res.status(200).json(settings.prowlarr);
});

prowlarrRoutes.post('/', (req, res) => {
  const settings = getSettings();
  const newIndexer = req.body as ProwlarrSettings;
  const last = settings.prowlarr[settings.prowlarr.length - 1];
  newIndexer.id = last ? last.id + 1 : 0;
  settings.prowlarr = [...settings.prowlarr, newIndexer];
  settings.save();
  return res.status(201).json(newIndexer);
});

prowlarrRoutes.put('/:id', (req, res, next) => {
  const settings = getSettings();
  const idx = settings.prowlarr.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) {
    return next({ status: 404, message: 'Settings instance not found' });
  }
  settings.prowlarr[idx] = { ...req.body, id: Number(req.params.id) } as ProwlarrSettings;
  settings.save();
  return res.status(200).json(settings.prowlarr[idx]);
});

prowlarrRoutes.delete('/:id', (req, res, next) => {
  const settings = getSettings();
  const idx = settings.prowlarr.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) {
    return next({ status: 404, message: 'Settings instance not found' });
  }
  const removed = settings.prowlarr.splice(idx, 1);
  settings.save();
  return res.status(200).json(removed[0]);
});

export default prowlarrRoutes;
