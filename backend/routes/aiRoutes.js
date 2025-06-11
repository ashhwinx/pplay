const express = require('express');
const router = express.Router();
const verifyToken = require('../utils/verifyToken');
const { generateLoveLetter, generateQuiz } = require('../controllers/aiController');

// All routes are protected
router.use(verifyToken);

router.post('/love-letter', generateLoveLetter);
router.post('/quiz', generateQuiz);

module.exports = router;