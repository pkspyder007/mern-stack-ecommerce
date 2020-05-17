const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const ClientRouter = require("./routes/clients");
const CategoryRouter = require("./routes/category");
const BrandRouter = require("./routes/brand");
const ShopRouter = require("./routes/shops");
const AuthRouter = require("./routes/auth");
const ProductRouter = require("./routes/products");
const DeliveryRouter = require("./routes/delivery");
const PaymentRouter = require("./routes/payment");
const app = express();

//Middlewares
app.use(cors());
app.use(fileUpload());
app.use(express.json());

// Routers

app.use("/client", ClientRouter);
app.use("/shop", ShopRouter);
app.use("/auth", AuthRouter);
app.use("/product", ProductRouter);
app.use("/delivery", DeliveryRouter);
app.use("/category", CategoryRouter);
app.use("/brand", BrandRouter);
app.use("/payment", PaymentRouter);

const root = require("path").join("front-end", "build");
app.use(express.static('build'));

app.use("/uploads", express.static("uploads"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

//  Database connection
mongoose
  .connect(process.env.MONGO_URI_PROD, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log(`Connected To The Database. 🔥 `))
  .catch((err) => console.log(err));

// Server Initialization
const port = process.env.PORT || 4444;

app.listen(port, () => console.log(`Server running on port ${port} 🔥`));
