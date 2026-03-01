const express = require("express");

const router = express.Router();

const sellerControllers = require("../controllers/seller.controller");

const isSeller = require("../middlewares/isSeller");
const isAuth = require("../middlewares/isAuth");

const upload = require("../middlewares/cloudinaryStorage");

router.get("/seller", isAuth, isSeller, sellerControllers.getSellerDashboard);

router.get(
  "/seller/profile",
  isAuth,
  isSeller,
  sellerControllers.sellerProfile
);

router.get("/seller/products", isAuth, isSeller, sellerControllers.allProducts);

router.get(
  "/seller/editStore",
  isAuth,
  isSeller,
  sellerControllers.getEditStore
);

router.post(
  "/seller/editStore",
  isAuth,
  isSeller,
  upload.single("storeLogo"),
  sellerControllers.editStore
);

router.get(
  "/seller/:productId/edit-product",
  isAuth,
  isSeller,
  sellerControllers.getEditProduct
);

router.post(
  "/seller/:productId/edit-product",
  isAuth,
  isSeller,
  upload.single("productImage"),
  sellerControllers.editProduct
);

router.post(
  "/seller/:productId/delete-product",
  isAuth,
  isSeller,
  sellerControllers.deleteProduct
);

module.exports = router;
