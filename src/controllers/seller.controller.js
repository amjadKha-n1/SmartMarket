const Seller = require("../models/Seller");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");

exports.sellerProfile = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).send("Seller not found!");
    }
    res.render("seller/profile", { seller, hideNavbar: false });
  } catch (error) {
    console.error("Seller Profile error!", error);
    res.status(500).send("Failed to load Seller profile!");
  }
};

async function getSellerTotalSales(sellerId) {
  const products = await Product.find({ sellerId });

  let totalSales = 0;
  for (const product of products) {
    totalSales += product.price * product.soldCount;
  }

  return totalSales;
}
exports.getSellerDashboard = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });

    const totalProducts = await Product.countDocuments({
      sellerId: seller._id,
    });
    const totalSales = await getSellerTotalSales(seller._id);

    const totalOrders = await Order.countDocuments({
      "items.seller": seller._id,
    });

    const sellerProducts = await Product.find({
      sellerId: seller._id,
      isDeleted: false,
    }).populate("sellerId", "status");

    const orders = await Order.find({ "items.seller": seller._id })
      .populate("items.product")
      .populate("items.seller")
      .sort({ createdAt: -1 });
    const sellerOrders = orders.map((order) => {
      const sellerItems = order.items.filter(
        (item) => item.seller._id.toString() === seller._id.toString()
      );
      return {
        _id: order._id,
        total: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
        items: sellerItems,
      };
    });
    const orderStats = await Order.aggregate([
      {
        $match: {
          "items.seller": seller._id,
        },
      },

      {
        $group: {
          _id: "$items.status",
          count: { $sum: 1 },
        },
      },
    ]);
    const orderCountByStatus = {};
    orderStats.forEach((status) => {
      orderCountByStatus[status._id] = status.count;
    });
    res.render("seller/dashboard", {
      hideNavbar: false,
      stats: {
        totalProducts,
        totalSales,
        totalOrders,
      },
      orderCountByStatus,
      orders: sellerOrders,
      sellerProducts,
      seller,
    });
  } catch (error) {
    console.error("Seller dashboard Error!", error);
    res.status(500).send("Failed to load Seller dashboard!");
  }
};

exports.allProducts = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const products = await Product.find({ sellerId: sellerId })
      .populate({
        path: "sellerId",
        populate: { path: "userId", select: "email name" },
      })
      .populate("categoryId", "name");
    res.render("seller/products", { products, hideNavbar: false });
  } catch (error) {
    console.error("All products error!", error);
    res.status(500).send("Failed to get all products!");
  }
};

exports.getEditStore = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) {
      return res.status(400).send("Seller not found!");
    }
    res.render("seller/store-settings", { seller, hideNavbar: false });
  } catch (error) {
    console.error("Edit store Failed");
    res.status(500).send("Failed to edit store!");
  }
};

exports.editStore = async (req, res) => {
  try {
    const updateData = {
      storeName: req.body.storeName,
      storeDescription: req.body.description,
    };

    if (req.file) {
      updateData.storeLogo = req.file.path;
    }

    const seller = await Seller.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true }
    );

    if (!seller) {
      return res.status(400).send("Seller not found!");
    }
    res.redirect("/seller");
  } catch (error) {
    console.error("Edit store Failed!", error);
    res.status(500).send("Failed to Edit the store!");
  }
};

exports.getEditProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    const categories = await Category.find({});
    res.render("seller/edit-product", {
      product,
      categories,
      hideNavbar: false,
    });
  } catch (error) {
    console.error("Edit Product error!", error);
    res.status(500).send("Failed to Edit Store!");
  }
};

exports.editProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      categoryId: req.body.categoryId,
      price: req.body.price,
      stock: req.body.stock,
    };
    if (req.file) {
      updateData.images = req.file.path;
    }
    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true }
    );
    if (!product) {
      return res.status(404).send("Product not found!");
    }
    await product.save();
    res.redirect("/seller");
  } catch (error) {
    console.error("Edit Product error!", error);
    res.status(500).send("Failed to Edit Product!");
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const sellerId = req.seller._id;

    const product = await Product.findOne({
      _id: productId,
      sellerId,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).send("Product not found or not authorized");
    }

    const hasActiveOrders = await Order.exists({
      items: {
        $elemMatch: {
          product: productId,
          seller: sellerId,
          status: { $in: ["pending", "paid", "shipped"] },
        },
      },
    });

    if (hasActiveOrders) {
      return res.status(400).send("Cannot delete product with active orders");
    }

    product.isDeleted = true;
    product.isActive = false;
    await product.save();

    res.redirect("/seller");
  } catch (error) {
    console.error("Delete Product Error!", error);
    res.status(500).send("Failed to delete Product");
  }
};
