const express = require("express");
const router = express.Router();

const adminControllers = require("../controllers/admin.controller");
const isAdmin = require("../middlewares/isAdmin");
const isAuth = require("../middlewares/isAuth");

router.get("/", isAuth, isAdmin, adminControllers.getAdminDashboard);

router.get("/profile", isAuth, isAdmin, adminControllers.adminProfile);

router.get("/sellers", isAuth, isAdmin, adminControllers.allSellers);

router.get("/products", isAuth, isAdmin, adminControllers.allProducts);

router.post("/:id/approve", isAuth, isAdmin, adminControllers.approveSellers);

router.post("/:id/reject", isAuth, isAdmin, adminControllers.rejectSeller);

router.get("/products", isAuth, isAdmin, adminControllers.listPendingProducts);

router.post(
  "/:id/approveProduct",
  isAuth,
  isAdmin,
  adminControllers.approveProducts
);

router.post(
  "/:id/rejectProduct",
  isAuth,
  isAdmin,
  adminControllers.rejectProduct
);

router.get("/orders", isAuth, isAdmin, adminControllers.getAllOrders);

module.exports = router;
