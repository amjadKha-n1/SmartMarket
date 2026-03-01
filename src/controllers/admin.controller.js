const Seller = require("../models/Seller");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

exports.adminProfile = async (req, res) => {
  res.render("admin/profile", { hideNavbar: false });
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const allSellers = await Seller.countDocuments({});
    const pendingSellersCount = await Seller.countDocuments({
      status: "pending",
    });
    const allProducts = await Product.countDocuments({ isDeleted: false });
    const pendingProductsCount = await Product.countDocuments({
      isApproved: false,
      isDeleted: false,
    });
    const totalUsersCount = await User.countDocuments({
      role: { $in: ["customer", "seller"] },
    });
    const totalOrdersCount = await Order.countDocuments();
    const orderStats = await Order.aggregate([
      { $group: { _id: "$items.status", count: { $sum: 1 } } },
    ]);
    const orderCountByStatus = {};
    orderStats.forEach((status) => {
      orderCountByStatus[status._id] = status.count;
    });
    const latestSellers = await Seller.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email");
    const latestProducts = await Product.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "sellerId",
        populate: { path: "userId", select: "email name" },
      });
    res.render("admin/dashboard", {
      hideNavbar: false,
      stats: {
        allSellers,
        pendingSellersCount,
        allProducts,
        pendingProductsCount,
        totalUsersCount,
        totalOrdersCount,
      },
      orderCountByStatus,
      latestSellers,
      latestProducts,
    });
  } catch (error) {
    console.error("Admin dashboard error!", error);
    res.status(500).send("Failed to load admin dashboard!");
  }
};
exports.allSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({})
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    res.render("admin/sellers", { sellers, hideNavbar: false });
  } catch (error) {
    console.error("Error fetching all Sellers!", error);
    res.status(500).send("Failed to load All Sellers!");
  }
};

exports.allProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false })
      .populate({
        path: "sellerId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ created: -1 });
    res.render("admin/products", { products, hideNavbar: false });
  } catch (error) {
    console.error("Error fetching all Products!", error);
    res.status(500).send("Failed to load All products");
  }
};

exports.approveSellers = async (req, res) => {
  try {
    const sellerId = req.params.id;
    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).send("Seller not found!");
    }
    if (seller.status !== "rejected" && seller.status !== "pending") {
      return res.status(400).send("Seller already processed!");
    }
    seller.status = "approved";
    await seller.save();

    await User.updateOne({ _id: seller.userId }, { $set: { role: "seller" } });

    res.redirect("/admin");
  } catch (error) {
    console.error("Approve seller error!", error);
    res.status(500).send("Something went wrong while approving seller.");
  }
};

exports.rejectSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).send("Seller not found!");
    }
    if (seller.status !== "pending" && seller.status !== "approved") {
      return res.status(400).send("Seller already processed");
    }
    seller.status = "rejected";
    await seller.save();

    await User.updateOne(
      { _id: seller.userId },
      { $set: { role: "customer" } }
    );

    res.redirect("/admin");
  } catch (error) {
    console.error("Reject seller error!", error);
    res.status(500).send("Something went wrong while rejecting seller.");
  }
};

exports.listPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isApproved: false }).populate(
      "sellerId",
      "name email"
    );
    res.render("admin/products", { products, hideNavbar: false });
  } catch (error) {
    console.error("List pending products Error", error);
    res.status(500).send("Failed to load products");
  }
};
exports.approveProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    const redirectUrl = req.body.redirect || "/admin";
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).send("Product not found!");
    }
    product.isApproved = true;
    product.isActive = true;

    await product.save();
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Approve Product error", error);
    res.status(500).send("Failed to approve product!");
  }
};

exports.rejectProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndDelete(productId);
    res.redirect("/admin");
  } catch (error) {
    console.error("Reject Product error", error);
    res.status(500).send("Failed to reject product!");
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("items.product")
      .populate("items.seller")
      .populate("user");
    res.render("admin/orders", { orders, hideNavbar: false });
  } catch (error) {
    console.error("Get orders error!", error);
    res.status(500).send("Failed to get orders!");
  }
};
