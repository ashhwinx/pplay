const express = require('express');
const router = express.Router();
const verifyToken = require('../utils/verifyToken');
const {
  connectWithPartner,
  getCoupleInfo,
  addMilestone,
  updateCoupleSettings,
  disconnectCouple
} = require('../controllers/coupleController');

// All routes are protected
router.use(verifyToken);

router.post('/connect', connectWithPartner);
router.get('/info', getCoupleInfo);
router.post('/milestone', addMilestone);
router.put('/settings', updateCoupleSettings);
router.delete('/disconnect', disconnectCouple);

module.exports = router;