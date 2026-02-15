const express  =  require('express');
const router = express.Router();
const {createDailyLog, getDailyLogByDate, updateDailyLog} = require('../controllers/dailyLog.controller');
const {protect, isAdmin}  = require('../middlewares/auth.middleware');


router.post('/', protect, isAdmin, createDailyLog);
router.get('/:date',  protect, isAdmin, getDailyLogByDate);
router.put('/:id', protect, isAdmin, updateDailyLog);


module.exports = router;