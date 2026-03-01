const express = require("express");
const router = express.Router();

const cartControllers = require("../controllers/cart.controller");

const isAuth = require("../middlewares/isAuth");

const requireAuth = require("../middlewares/requireAuth");

router.get("/cart", isAuth, requireAuth, cartControllers.getCart);

router.post(
  "/cart/add/:productId",
  isAuth,
  requireAuth,
  cartControllers.addToCart
);

router.post(
  "/cart/:productId/decrease",
  isAuth,
  requireAuth,
  cartControllers.decreaseQuantity
);

router.post(
  "/cart/:productId/increase",
  isAuth,
  requireAuth,
  cartControllers.increaseQuantity
);

router.post(
  "/cart/:productId/remove",
  isAuth,
  requireAuth,
  cartControllers.removeProduct
);

module.exports = router;
