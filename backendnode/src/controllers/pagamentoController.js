const paymentService = require('../services/paymentService');

exports.processPayment = async (req, res) => {
  try {
    const validatedData = req.body;
    const result = await paymentService.process(validatedData);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const status = await paymentService.getStatus(paymentId);
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

