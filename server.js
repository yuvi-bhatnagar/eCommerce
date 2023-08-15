const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const session = require("express-session");

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("uploads"));
app.use(function (req, res, next) {
  console.log(req.url,req.method);
  next();
});
app.use(
  session({
    secret: "it a session middleware",
    resave: true,
    saveUninitialized: true,
  })
);

// --------------------DATABASE------------------------

const db = require("./models/db");
db.init();
const User = require("./models/user");
const Product = require("./models/products");

// ---------GET request --------------------------------

app.get("/", function (request, response) {
  if (!request.session.isLoggedin) {
    return response.redirect("/login");
  }
  if (request.session.isAdmin) {
    return response.render("admin", { username: request.session.username });
  }
  response.render("index", { username: request.session.username });
});

app.get("/login", function (request, response) {
  if (request.session.isLoggedin) {
    response.redirect("/");
    return;
  }
  response.render("login", { error: null });
});

app.get("/signup", function (request, response) {
  if (request.session.isLoggedin) {
    response.redirect("/");
    return;
  }
  response.render("signup", { error: null });
});

app.get("/logout", function (request, response) {
  if (request.session.isLoggedin) {
    request.session.destroy(function (error) {
      if (error) {
        console.log(error);
      } else {
        response.render("login", { error: "" });
      }
    });
    return;
  }
  response.redirect("/login");
});
app.get("/productJS", function (req, res) {
  res.sendFile(__dirname+"/public/js/product.js");
});
app.get("/products", function (req, res) {
  if(req.session.isLoggedin){
    res.render("products", {username: req.session.username});
    return ;
  }
  res.render("login",{error:""});
})

app.get('/get-products', async (req, res) => {

  try {
      const products = await Product.find().exec();

      res.json({ products });
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'An error occurred while fetching products.' });
  }
});

app.get('/get-products-count', async (req, res) => {
  try {
      const count = await Product.countDocuments().exec();
      res.json({ count });
  } catch (error) {
      console.error('Error fetching product count:', error);
      res.status(500).json({ error: 'An error occurred while fetching product count.' });
  }
});

// -----------------POST request ----------------------

app.post("/login", async function (request, response) {
  if (request.session.isLoggedin) {
    return response.redirect("/");
  }
  const username = request.body.username;
  const password = request.body.password;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return response.render("login", {
        error: "Username or password is incorrect",
      });
    }
    if (user.password !== password) {
      return response.render("login", {
        error: "Username or password is incorrect",
      });
    }
    request.session.isLoggedin = true;
    request.session.username = user.username;
    if (user.isAdmin) {
      request.session.isAdmin = true;
    }
    return response.redirect("/");
  } catch (error) {
    console.error("Error during login:", error);
    response.status(500).send("An error occurred during login.");
  }
});

app.post("/signup", async function (request, response) {
  const username = request.body.username;
  const email = request.body.email;
  const password = request.body.password;
  const existingName = await User.findOne({ username });
  const existingUser = await User.findOne({ email });
  if (existingName) {
    return response.render("signup", {
      error: "Username is already taken",
    });
  }
  if (existingUser) {
    return response.render("signup", {
      error: "Email address is already exist",
    });
  }
  const newUser = new User({
    username: username,
    email: email,
    password: password,
    isActive: true,
    isAdmin: false,
  });

  try {
    await newUser.save();
    response.redirect("login");
  } catch (error) {
    response.redirect("login");
    response.status(500).send("An error occurred while creating the user.");
  }
});
app.post("/admin",upload.single("item"), async function (req, res, next) {
  try {
    const name = req.body.productName;
    const description = req.body.description;
    const quantity = req.body.quantity;
    const price = req.body.price;
    const item = req.file;
    const product = new Product({
      productName: name,
      productPrice: price,
      quantity: quantity,
      productDesc: description,
      productImage: item.filename,
    });
    await product.save();
    res.redirect("/");
  } catch (error) {
    res.redirect("/");
    res.status(500).send("An error occurred while adding the product");
  }
});

// ---------------server listeners --------------------
app.listen(8000, function () {
  console.log("Server is running on port 8000");
});
