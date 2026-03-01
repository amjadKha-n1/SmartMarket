const Seller = require("../models/Seller");
module.exports = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "seller") {
      return res.status(403).render("errors/403", { hideNavbar: true });
    }
    const seller = await Seller.findOne({ userId: req.user._id });

    if (!seller) {
      return res.status(403).render("errors/403", { hideNavbar: true });
    }

    req.seller = seller;
  } catch (error) {
    console.error("isSeller Middleware error!", error);
    res.status(500).send("Seller authentication failed!");
  }
  next();
};
