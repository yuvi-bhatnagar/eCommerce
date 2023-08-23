const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const session = require("express-session");
const mail = require("./utils/sendMail");
const generateRandomToken = require("./utils/generateToken");

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("uploads"));
app.use(function (req, res, next) {
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
const Cart = require("./models/carts");
const productData = require("./models/productData");

// Initial Products
try {
  if(Product.find().length === 0){
    Product.insertMany(productData);
  }
  
} catch (error) {
  console.log(error);
}

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

// -----Scripts --------------------------------
app.get("/productJS", function (req, res) {
  res.sendFile(__dirname + "/public/js/product.js");
});
app.get("/cartJS", function (req, res) {
  res.sendFile(__dirname + "/public/js/cart.js");
});
app.get("/adminJS", function (req, res) {
  res.sendFile(__dirname + "/public/js/admin.js");
});

app.get("/products", function (req, res) {
  if (req.session.isLoggedin) {
    res.render("products", { username: req.session.username });
    return;
  }
  res.render("login", { error: "" });
});
app.get("/cart", function (req, res) {
  if (req.session.isLoggedin) {
    res.render("cart", { username: req.session.username });
    return;
  }
  res.render("login", { error: "" });
});
app.get("/adminProducts", function (req, res) {
  if (req.session.isLoggedin) {
    res.render("adminProducts", { username: req.session.username });
    return;
  }
  res.render("login", { error: "" });
});

app.get("/get-products", async (req, res) => {
  try {
    const products = await Product.find().exec();

    res.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching products." });
  }
});

app.get("/cart-products", async (req, res) => {
  try {
    const products = await Cart.find({ user: req.session.username });
    res.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching products." });
  }
});

app.get("/verifyMail", function (req, res) {
  if (!req.session.isLoggedin) {
    res.render("login", { error: "" });
  }
  const token = req.query.token;
  const user = User.updateOne({ verification: token }, { isActive: true })
    .then(() => {
      res.render("login", { error: "" });
    })
    .catch((error) => {
      console.error("Error updating user:", error);
      res.render("login", { error: "Error verifying email." });
    });
});
app.get("/changePass", function (req, res) {
  res.render("changePassword", { user: req.session.username, error: "" });
});
app.get("/forgotPass", function (req, res) {
  res.render("forgotPass");
});
app.get("/resetPass", async function (req, res) {
  const token = req.query.token;
  const user = await User.findOne({ verification: token });
  const username = user.username;
  res.render("changePassword", { user: username, error: "" });
});
app.get("/checkMail", function (req, res) {
  res.render("checkMail");
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
        error: "Username is incorrect",
      });
    }
    if (!user.isActive) {
      return response.render("login", {
        error: "pls verifiy your account",
      });
    }
    if (user.password !== password) {
      return response.render("login", {
        error: "password is incorrect",
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
  const verificationToken = generateRandomToken(16);
  const newUser = new User({
    username: username,
    email: email,
    password: password,
    isActive: false,
    isAdmin: false,
    verification: verificationToken,
  });

  try {
    await newUser.save();
    const verificationLink = `http://localhost:8000/verifyMail?token=${verificationToken}`;
    const htmlContent = `<p>verify your email: <a href="${verificationLink}">click here to verify!</a></p>`;
    const emailSubject = "Email Verification";
    mail.sendHtmlEmail(email, htmlContent, emailSubject);
    console.log("Verification email sent");
    response.redirect("login");
  } catch (error) {
    response.redirect("signup");
    response.status(500).send("An error occurred while creating the user.");
  }
});

app.post("/admin", upload.single("item"), async function (req, res, next) {
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

app.post('/adminUpdate', async function (req, res) {
  const curProduct = req.query.curProduct;
  const action = req.body.action;
  if (action === "update") {
    const updateData = {};
    if (req.body.name !== "") {
      updateData.productName = req.body.name;
    }
    if (req.body.description !== "") {
      updateData.productDesc = req.body.description;
    }
    if (req.body.price !== "") {
      updateData.productPrice = req.body.price;
    }
    if (req.body.quantity !== "") {
      updateData.quantity = req.body.quantity;
    }
    if (Object.keys(updateData).length > 0) {
      await Products.updateOne({ productName: curProduct }, { $set: updateData });
    }
  }
  else{
    const image= await Products.findOne({ productName: curProduct});
    fs.unlink(__dirname+'/uploads/'+image.productImage,(err => {
      if (err) console.log(err);
    }));
    await Products.deleteOne({productName: curProduct});
  }
  res.redirect('adminProducts');
});

app.post("/changePass", async function (req, res) {
  const pass = req.body.newPassword;
  const username = req.query.user;
  const user = await User.findOne({ username });
  const email = user.email;
  User.updateOne({ username: username }, { password: pass })
    .then(function () {
      console.log("Pass updated successfully");
      const htmlContent = `<p>Your password is changed successfully.</p>`;
      const sub = "Password Change";
      mail.sendHtmlEmail(email, htmlContent, sub);
      req.session.isLoggedin = false;
      res.render("login", { error: "" });
    })
    .catch(function (err) {
      console.log("error" + err);
    });
});

app.post("/forgotPass", async function (req, res) {
  const email = req.body.email;
  const user = await User.findOne({ email: email });
  const token = user.verification;
  const verificationLink = `http://localhost:8000/resetPass?token=${token}`;
  const htmlContent = `<p>Click to change password <a href="${verificationLink}">click here!</a></p>`;
  const emailSubject = "Forgot Password";
  mail.sendHtmlEmail(email, htmlContent, emailSubject);
  console.log("Verification email sent");
  res.redirect("checkMail");
});

app.post("/cart", async function (req, res) {
  const product = req.body;
  const user = req.session.username;
  const presentProduct = await Cart.findOne({
    user: user,
    productName: product.productName,
  });
  if (presentProduct) {
    await Cart.updateOne(
      { user: user, productName: product.productName },
      { quantity: presentProduct.quantity + 1}
    );
    return;
  } else {
    const newInCart = new Cart({
      user: user,
      productName: product.productName,
      productPrice: product.productPrice,
      quantity: 1,
      productImage: product.productImage,
      productDesc: product.productDesc,
    });
    await newInCart.save();
    return;
  }
});

app.post("/deleteFromCart", async function (req, res) {
  try {
    const user = req.body.user;
    const product = req.body.product;
    await Cart.deleteOne({ user: user, productName: product });
    res.json({ redirect: "/cart" });
  } catch (error) {
    console.error("Error deleting from cart:", error);
    res.status(500).send("Error deleting from cart");
  }
});

app.post('/increaseQuantity',async function (req, res) {
  try{
    const user = req.body.user;
    const product = req.body.product;
    const curQuantity = req.body.quantity;
    const totalQuantity= await Products.findOne({productName:product});
    if(curQuantity>=totalQuantity.quantity){
      return;
    }
    else{
      await Cart.updateOne({user:user,productName:product},{quantity:curQuantity+1});
      res.json({redirect:"/cart"});
    }
  }
  catch(error) {
    console.error("Error in increasing quantity:", error);
    res.status(500).send("Error increasing quantity");
  }
});

app.post('/decreaseQuantity',async function (req, res) {
  try{
    const user = req.body.user;
    const product = req.body.product;
    const curQuantity = req.body.quantity;
    if(curQuantity==1){
      return;
    }
    else{
      await Cart.updateOne({user:user,productName:product},{quantity:curQuantity-1});
      res.json({redirect:"/cart"});
    }
  }
  catch(error) {
    console.error("Error in increasing quantity:", error);
    res.status(500).send("Error increasing quantity");
  }
});

// ---------------server listeners --------------------
app.listen(8000, function () {
  console.log("Server is running on port 8000");
});
