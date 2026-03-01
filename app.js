require("dotenv").config();

const path = require("path");

const express = require("express");

const expresslayouts = require("express-ejs-layouts");
const expressSession = require("express-session");

const isAuthMiddleware = require("./src/middlewares/isAuth");
const createSessionConfig = require("./src/config/session");
const connectDB = require("./src/config/database");
const authRoutes = require("./src/routes/auth.routes");
const productRoutes = require("./src/routes/product.routes");
const userRoutes = require("./src/routes/user.routes");
const adminRoutes = require("./src/routes/admin.routes");
const sellerRoutes = require("./src/routes/seller.routes");
const cartRoutes = require("./src/routes/cart.routes");
const categoryRoutes = require("./src/routes/category.routes");
const orderRoutes = require("./src/routes/order.routes");
const paymentRoutes = require("./src/routes/payment.routes");

const notFoundMiddleware = require("./src/middlewares/notFound");
const errorMiddleware = require("./src/middlewares/error");

connectDB();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));
app.set("layout", "layouts/main");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "src", "public")));

const sessionConfig = createSessionConfig();
app.use(expressSession(sessionConfig));

app.use(isAuthMiddleware);
app.use(expresslayouts);
app.use(authRoutes);
app.use(productRoutes);
app.use(userRoutes);
app.use("/admin", adminRoutes);
app.use(sellerRoutes);
app.use(cartRoutes);
app.use(categoryRoutes);
app.use(orderRoutes);
app.use(paymentRoutes);

app.use(notFoundMiddleware);

app.listen(3000);
