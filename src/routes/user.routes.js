const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const upload = require("../middlewares/cloudinaryStorage");

const isAuth = require("../middlewares/isAuth");

router.get("/becomeSeller", isAuth, userController.becomeSeller);
router.post(
  "/becomeSeller",
  isAuth,
  upload.single("storeLogo"),
  userController.submitBecomeSeller
);

router.get("/profile", isAuth, userController.userProfile);

router.get("/about", userController.getAboutPage);

module.exports = router;
