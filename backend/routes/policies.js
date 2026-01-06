import express from 'express';
import policyController from '../controllers/policies.js';

const router = express.Router();

router.get('/', policyController.getAll);

router.get('/dashboard', policyController.dashboard);

router.post('/', policyController.create); 

router.get('/:id', policyController.getById);

router.put('/:id/cancel', policyController.cancel);

router.put('/:id/renew', policyController.renew);

// router.get('/active', policyController.getActive);

// router.get('/expiring', policyController.getExpiring);

export default router;
