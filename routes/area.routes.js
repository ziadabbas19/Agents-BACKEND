const express =require('express');
const router = express.Router();
const {createArea, getAllAreas, updateArea, deleteArea} = require('../controllers/area.controller');
const {protect, isAdmin} =  require('../middlewares/auth.middleware');

router.post('/', protect, isAdmin, createArea);
router.get('/',protect, getAllAreas);
router.put('/:id', protect, isAdmin, updateArea);
router.delete('/:id', protect, isAdmin, deleteArea);

module.exports = router;