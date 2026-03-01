const express = require("express");
const router = express.Router();
const orderControllers = require("../controllers/order.controller");

const isAuth = require("../middlewares/isAuth");
const isSeller = require("../middlewares/isSeller");

router.post("/orders", isAuth, orderControllers.createOrder);

router.get(
  "/orders/:orderId/success",
  isAuth,
  orderControllers.getOrderSuccess
);

router.get("/orders", isAuth, orderControllers.getUserOrders);

router.get("/orders/:orderId", isAuth, orderControllers.getOrderDetails);

router.get(
  "/seller/orders",
  isAuth,
  isSeller,
  orderControllers.getSellerOrders
);

router.post(
  "/seller/orders/:orderId/items/:itemId",
  isAuth,
  isSeller,
  orderControllers.updateOrderStatus
);

module.exports = router;

module.exports = router;
