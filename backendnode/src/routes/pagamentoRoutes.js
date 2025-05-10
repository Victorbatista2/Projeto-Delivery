const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validatePayment } = require('../validations/paymentValidation');

router.post('/process', validatePayment, paymentController.processPayment);
router.get('/status/:paymentId', paymentController.getPaymentStatus);

module.exports = router;