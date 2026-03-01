const Product = require("../models/Product");
const Seller = require("../models/Seller");
const Category = require("../models/Category");
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isApproved: true,
      isActive: true,
      isDeleted: false,
    });
    res.render("shop/index", { products, hideNavbar: false });
  } catch (error) {
    console.error("Get products Error!", error);
    res.status(500).send("Failed to load Products!");
  }
};

exports.getAddProduct = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render("seller/add-product", { categories, hideNavbar: false });
  } catch (error) {
    console.error("Get add product error!", error);
    res.status(500).send("Failed to get Add product!");
  }
};

exports.addProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) {
      return res.status(400).send("Seller profile not found!");
    }
    const categoryId = req.body.categoryId;
    if (!categoryId) {
      return res.status(400).send("Category must be selected!");
    }

    let category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).send("Selected category not found!");
    }
    if (!req.file) {
      return res.status(400).send("Product image is required!");
    }
    const imagePath = req.file.path;
    const newProduct = new Product({
      sellerId: seller._id,
      categoryId: category._id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      stock: req.body["stock-quantity"],
      images: imagePath,

      isApproved: false,
      isActive: false,
      isDeleted: false,
    });
    await newProduct.save();
    res.redirect("/seller");
  } catch (error) {
    console.error("Add product Error!", error);
    res.status(500).send("Failed to create product");
  }
};

exports.productDetails = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).send("Product Not found!");
    }
    res.render("shop/product-detail", { product, hideNavbar: false });
  } catch (error) {
    console.error("Product Details Error!", error);
    res.status(500).send("Failed to see product Detail!");
  }
};
