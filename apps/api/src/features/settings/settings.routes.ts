import { Router } from 'express';

import { sendSuccess } from '../../lib/http/response.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorize.js';

const settingsRoutes = Router();

settingsRoutes.use(authenticate);

settingsRoutes.get('/profile', authorizeRoles('admin'), (request, response) =>
  sendSuccess(response, 200, 'Admin settings profile fetched successfully.', {
    organization: 'Aegis Core SOC Lab',
    activeUser: request.user,
    branding: {
      logoPath: '/branding/aegiscore-logo.svg',
      proposalCoverReference: 'docs/branding/proposal-cover.png',
    },
  }),
);

export { settingsRoutes };
