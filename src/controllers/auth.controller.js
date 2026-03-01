const bcrypt = require("bcrypt");
const User = require("../models/User");
const authUtil = require('../utils/authentication');

exports.getSignup = (req, res) => {
  res.render("auth/register", { hideNavbar: true });
};

exports.signup = async (req, res) => {
  try {
    const userInputPassword = req.body.password;
    const userInputEmail = req.body.email;
    const userInputConfirmEmail = req.body["confirm-email"];

    if (userInputEmail !== userInputConfirmEmail) {
      return res.status(400).send("Emails do not match!");
    }

    const hashedPassword = await bcrypt.hash(userInputPassword, 12);

    const newUser = new User({
      email: userInputEmail,
      confirmEmail: userInputConfirmEmail,
      password: hashedPassword,
      name: req.body.fullname,
      street: req.body.street,
      postalCode: req.body.postal,
      city: req.body.city,
    });

    await newUser.save();

    res.redirect("/login");

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).send("Something went wrong during signup.");
  }
};

exports.getLogin = (req, res) => {
  res.render("auth/login", { hideNavbar: true });
};

exports.login = async (req, res) => {
  try {
    const userInputEmail = req.body.email;
    const userInputPassword = req.body.password;

    const user = await User.findOne({ email: userInputEmail });

    if (!user) {
      return res.status(400).send("Incorrect Email address!");
    }

    const passwordIsCorrect = await bcrypt.compare(
      userInputPassword,
      user.password
    );

    if (!passwordIsCorrect) {
      return res.status(400).send("Incorrect Password!");
    }

    authUtil.createUserSession(req, user, () => {
      if (user.role === 'admin') {
        return res.redirect('/admin');
      }
      if (user.role === 'seller') {
        return res.redirect('/seller');
      }
      res.redirect("/products");
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Something went wrong during login.");
  }
};

exports.logout = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Couldn't log out. Try again!");
    }
    res.redirect('/login');
  });
};
