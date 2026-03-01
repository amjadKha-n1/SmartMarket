const stripe = require("../config/stripe");
const Order = require("../models/Order");

exports.getPaymentPage = async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) return res.status(404).send("Order not found");
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).send("Unauthorized");
  }
  if (order.status !== "pending") {
    return res.redirect("/orders");
  }

  res.render("payments/checkout", {
    order,
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
  });
};

exports.createPaymentIntent = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).send("Order not found!");
    }
    if (order.paymentStatus === "paid") {
      return res.status(400).send("Order already paid!");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.priceAtTime * 100),
      currency: "usd",
      metaData: {
        orderId: order._id.toString(),
      },
    });

    order.paymentIntentId = paymentIntent._id;
    await order.save();

    res.render("payments/pay", {
      hideNavbar: false,
      order,
      clientSecret: paymentIntent.client_secret,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("Payment Intent Error!", error);
    res.status(500).send("Failed to Create Payment Intent!");
  }
};

exports.paymentSuccess = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).send("Order not found!");
    }
    order.paymentStatus = "paid";
    await order.save();

    res.redirect("/orders" + order._id);
  } catch (error) {
    console.error("Payment success error!", error);
    res.status(500).send(" payment confirmation Failed !");
  }
};
