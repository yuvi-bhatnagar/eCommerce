const mongoose = require("mongoose");

module.exports.init = async function () {
  await mongoose.connect("mongodb://localhost:27017/Ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Server is connected to database");
};
