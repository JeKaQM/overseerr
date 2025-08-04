import type { QbittorrentSettings } from '@server/lib/settings';
import { getSettings } from '@server/lib/settings';
import { Router } from 'express';

const qbittorrentRoutes = Router();

qbittorrentRoutes.get('/', (_req, res) => {
  const settings = getSettings();
  return res.status(200).json(settings.qbittorrent);
});

qbittorrentRoutes.post('/', (req, res) => {
  const settings = getSettings();
  const newClient = req.body as QbittorrentSettings;
  const last = settings.qbittorrent[settings.qbittorrent.length - 1];
  newClient.id = last ? last.id + 1 : 0;
  settings.qbittorrent = [...settings.qbittorrent, newClient];
  settings.save();
  return res.status(201).json(newClient);
});

qbittorrentRoutes.put('/:id', (req, res, next) => {
  const settings = getSettings();
  const idx = settings.qbittorrent.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) {
    return next({ status: 404, message: 'Settings instance not found' });
  }
  settings.qbittorrent[idx] = {
    ...req.body,
    id: Number(req.params.id),
  } as QbittorrentSettings;
  settings.save();
  return res.status(200).json(settings.qbittorrent[idx]);
});

qbittorrentRoutes.delete('/:id', (req, res, next) => {
  const settings = getSettings();
  const idx = settings.qbittorrent.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) {
    return next({ status: 404, message: 'Settings instance not found' });
  }
  const removed = settings.qbittorrent.splice(idx, 1);
  settings.save();
  return res.status(200).json(removed[0]);
});

export default qbittorrentRoutes;
