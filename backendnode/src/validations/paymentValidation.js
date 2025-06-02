exports.validatePayment = (req, res, next) => {
  try {
    const { amount, currency, paymentMethod } = req.body

    // Validações básicas
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" })
    }

    if (!currency) {
      return res.status(400).json({ error: "Currency is required" })
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" })
    }

    next()
  } catch (error) {
    return res.status(500).json({ error: "Validation error: " + error.message })
  }
}
