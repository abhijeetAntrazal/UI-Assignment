import express from 'express';
import patientController from '../controllers/patient.js'; 

const router = express.Router(); 


router.get('/', patientController.getAll);


router.get('/:phone', patientController.getByPhone);


router.post('/', patientController.create);

router.put('/:id', patientController.update);


router.delete('/:id', patientController.delete);


// router.get('/search', patientController.search);


router.get('/email/:email', patientController.getByEmail);

 
router.get('/name/:name', patientController.getByName);


export default router;
