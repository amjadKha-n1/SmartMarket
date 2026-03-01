const express = require("express");
const router = express.Router();

const categoryControllers = require("../controllers/category.controller");

const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const upload = require("../middlewares/cloudinaryStorage");

router.get("/categories", isAuth, categoryControllers.getAllCategories);

router.get(
  "/admin/add-category",
  isAuth,
  isAdmin,
  categoryControllers.getAddCategory
);

router.post(
  "/admin/add-category",
  isAuth,
  isAdmin,
  upload.single("image"),
  categoryControllers.addCategory
);

router.get(
  "/admin/:categoryId/edit-category",
  isAuth,
  isAdmin,
  categoryControllers.getEditCategory
);

router.post(
  "/admin/:categoryId/edit-category",
  isAuth,
  isAdmin,
  upload.single("image"),
  categoryControllers.editCategory
);

router.get(
  "/categories/:slug",
  isAuth,
  categoryControllers.getProductsByCategory
);

module.exports = router;
