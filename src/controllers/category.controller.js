const Category = require("../models/Category");
const Product = require("../models/Product");
const slugify = require("slugify");
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.render("shop/category", { categories, hideNavbar: false });
  } catch (error) {
    console.error("Getting all categories error!", error);
    res.status(500).send("Failed to get all categories");
  }
};

exports.getAddCategory = (req, res) => {
  res.render("admin/add-category", { hideNavbar: false });
};

exports.addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description || !req.file) {
      return res.status(400).send("All fields are required!");
    }
    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const exists = await Category.findOne({
      $or: [{ name }, { slug }],
    });
    if (exists) {
      return res.status(400).send("Category already exists!");
    }
    const imagePath = req.file.path;
    const category = new Category({
      name,
      slug,
      description,
      image: imagePath,
      isActive: true,
    });
    await category.save();
    res.redirect("/admin");
  } catch (error) {
    console.error("Add category error!", error);
    res.status(500).send("Failed to add category!");
  }
};

exports.getEditCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    res.render("admin/edit-category", { category, hideNavbar: false });
  } catch (error) {
    console.error("Edit Category error!", error);
    res.status(500).send("Failed to edit Category!");
  }
};

exports.editCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const updateData = {
      name: req.body.name,
      slug: req.body.slug,
      description: req.body.description,
    };
    if (req.file) {
      updateData.image = req.file.path;
    }
    const category = await Category.findByIdAndUpdate(categoryId, updateData, {
      new: true,
    });
    if (!category) {
      return res.status(404).send("Category not found");
    }
    res.redirect("/categories");
  } catch (error) {
    console.error("Edit Category error!", error);
    res.status(500).send("Failed to Edit Category!");
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.slug;
    const category = await Category.findOne({
      slug: categoryId,
      isActive: true,
    });
    if (!category) {
      return res.status(404).send("Category not found!");
    }
    const products = await Product.find({
      categoryId: category._id,
      isApproved: true,
      isActive: true,
    });
    res.render("shop/products-by-category", { products, hideNavbar: false });
  } catch (error) {
    console.error("Get products by category error!", error);
    res.status(500).send("Failed to get products by category!");
  }
};
