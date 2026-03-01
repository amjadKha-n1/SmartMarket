const express = require("express");

const router = express.Router();

const productControllers = require("../controllers/product.controller");
const upload = require("../middlewares/cloudinaryStorage");

const isSeller = require("../middlewares/isSeller");
const isAuth = require("../middlewares/isAuth");

router.get("/", productControllers.getAllProducts);
router.get("/products", productControllers.getAllProducts);
router.get(
  "/seller/add-product",
  isAuth,
  isSeller,
  productControllers.getAddProduct
);

router.post(
  "/seller/add-product",
  isAuth,
  isSeller,
  upload.single("image"),
  productControllers.addProduct
);
module.exports = router;

router.get(
  "/products/:productId/product-detail",
  productControllers.productDetails
);
