import Router from 'koa-router';

import BackupsController from '@controllers/backupsController';
import { retrieveUser, hasCredential } from '@utilities/middlewares';

const router = new Router({ prefix: '/backups' });

router.use(retrieveUser);

router.get(
  '/',
  hasCredential('getBackup'),
  BackupsController.list,
);
router.post(
  '/create',
  hasCredential('createBackup'),
  BackupsController.create,
);
router.post(
  '/restore',
  hasCredential('restoreBackup'),
  BackupsController.restore,
);

export default router;
