const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.productId"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).send("Cart is empty!");
    }

    for (const item of cart.items) {
      if (!item.productId) {
        return res.status(400).send("Product no longer exists!");
      }

      if (item.quantity > item.productId.stock) {
        return res
          .status(400)
          .send(`Not enough stock for ${item.productId.title}!`);
      }
    }

    const orderItems = cart.items.map((item) => ({
      product: item.productId._id,
      seller: item.seller,
      title: item.productId.title,
      priceAtTime: item.priceAtTime,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const order = new Order({
      user: userId,
      items: orderItems,
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      status: "pending",
    });
    await order.save();

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity },
      });
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    await cart.save();

    res.redirect(`/orders/${order._id}/success`);
  } catch (error) {
    console.error("Create Order Error!", error);
    res.status(500).send("Failed to create Order!");
  }
};

exports.getOrderSuccess = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).send("No order found!");
    }
    res.render("user/order-success", { order, hideNavbar: false });
  } catch (error) {
    console.error("Order Success error!", error);
    res.status(500).send("Failed to load order!");
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.render("user/orders", { orders, hideNavbar: false });
  } catch (error) {
    console.error("User Orders error!", error);
    res.status(500).send("Failed to load User Orders!");
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const orders = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id,
    })
      .populate("items.product")
      .populate("items.status");
    if (!orders) {
      return res.status(404).send("Order not found!");
    }
    res.render("user/order-detail", { orders, hideNavbar: false });
  } catch (error) {
    console.error("Order details error!", error);
    res.status(500).send("Failed to get order details!");
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.seller._id;

    const orders = await Order.find({ "items.seller": sellerId })
      .populate({
        path: "items.seller",
        populate: { path: "userId", select: "email name" },
      })
      .populate("user", "email name")
      .populate("items.product", "title")
      .sort({ createdAt: -1 });

    const sellerOrders = orders.map((order) => {
      const sellerItems = order.items.filter(
        (item) => item.seller._id.toString() === sellerId.toString()
      );
      return {
        _id: order._id,
        user: order.user,

        createdAt: order.createdAt,
        items: sellerItems,
      };
    });

    res.render("seller/orders", { orders: sellerOrders, hideNavbar: false });
  } catch (error) {
    console.error("Get seller orders error!", error);
    res.status(500).send("Failed to get seller Orders!");
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId, itemId } = req.params;

    const allowedStatuses = [
      "pending",
      "paid",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).send("Invalid order status");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send("Order not found");
    }

    if (req.user.role === "seller") {
      const sellerId = req.seller._id.toString();
      const ownsItem = order.items.some(
        (item) => item.seller.toString() === sellerId
      );

      if (!ownsItem) {
        return res.status(403).send("Not authorized");
      }
    }
    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).send("Order item not found!");
    }
    item.status = status;
    await order.save();

    res.redirect(
      req.user.role === "admin" ? "/admin/orders" : "/seller/orders"
    );
  } catch (error) {
    console.error("Update order status error", error);
    res.status(500).send("Failed to update order status");
  }
};
