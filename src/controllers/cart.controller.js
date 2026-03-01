const Cart = require("../models/Cart");
const Product = require("../models/Product");


exports.getCart = async (req, res) => {
  try {
    
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.productId"
    );

    if (!cart) {
      cart = {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    }

    res.render("user/cart", { cart, hideNavbar: false });
  } catch (error) {
    console.log("get Cart Error!", error);
    res.status(500).send("Failed to load cart!");
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).send('User not logged in');
    }
    const productId = req.params.productId;

    const product = await Product.findById(productId);

    if (!product || !product.isApproved || !product.isActive) {
      return res.status(404).send("Product not available!");
    }

    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
    }
    
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      if (cart.items[existingItemIndex].quantity < product.stock) {
        
        cart.items[existingItemIndex].quantity += 1;
        cart.items[existingItemIndex].subtotal =
          cart.items[existingItemIndex].quantity *
          cart.items[existingItemIndex].priceAtTime;
      }
    } else {
      
      cart.items.push({
        productId: product._id,
        seller: product.sellerId,
        quantity: 1,
        priceAtTime: product.price,
        subtotal: product.price,
      });
    }

    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

    await cart.save();

    res.redirect("/products");
  } catch (error) {
    console.error("Add to cart error!", error);
    res.status(500).send("Failed to add to cart!");
  }
};

exports.decreaseQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not available");
    }
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.redirect('/cart');
    }
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.redirect("/cart");
    }
    if (cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
      cart.items[itemIndex].subtotal =
        cart.items[itemIndex].quantity * cart.items[itemIndex].priceAtTime;
    } else {
      cart.items.splice(itemIndex, 1);
    }
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

    await cart.save();
    res.redirect("/cart");
  } catch (error) {
    console.log("Decrease quantity error!", error);
    res.status(500).send("Failed to decrease quantity!");
  }
};

exports.increaseQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not available!");
    }
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.redirect('cart');
    }
    const findIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (findIndex === -1) {
      return res.redirect("/cart");
    }
    if (cart.items[findIndex].quantity < product.stock) {
      cart.items[findIndex].quantity += 1;
      cart.items[findIndex].subtotal =
        cart.items[findIndex].quantity * cart.items[findIndex].priceAtTime;
    }
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

    await cart.save();
    res.redirect("/cart");
  } catch (error) {
    console.log("Increase quantity error!", error);
    res.status(500).send("Failed to increase quantity!");
  }
};

exports.removeProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.redirect("/cart");
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

    await cart.save();

    res.redirect("/cart");
  } catch (error) {
    console.error("Remove product error!", error);
    res.status(500).send("Failed to remove product!");
  }
};
