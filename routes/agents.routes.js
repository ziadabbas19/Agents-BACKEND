const express = require('express');
const router = express.Router();
const {createAgent, getAgent, getAllAgents, updateAgent, deleteAgent, restoreAgent} = require('../controllers/agent.controller');
const {protect, isAdmin} = require('../middlewares/auth.middleware');
const { route } = require('./auth.routes');
const { getAgentsList } = require('../controllers/dailyLog.controller');

router.route('/')
.post(protect, isAdmin, createAgent)
.get(protect, getAllAgents);

router.route('/:id')
.get(protect, getAgent)
.put(protect, isAdmin, updateAgent)
.delete(protect, isAdmin, deleteAgent)

router.put('/restore/:id', protect, isAdmin, restoreAgent)

router.get('/list',protect, getAgentsList)

module.exports = router;