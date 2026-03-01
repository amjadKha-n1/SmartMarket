const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");

const isAuth = require("../middlewares/isAuth");

router.get("/payments/:orderId", isAuth, paymentController.getPaymentPage);

router.get("/pay/:orderId", isAuth, paymentController.createPaymentIntent);

router.get("/success/:orderId", isAuth, paymentController.paymentSuccess);

module.exports = router;
