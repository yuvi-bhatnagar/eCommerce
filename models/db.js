const mongoose = require("mongoose");

module.exports.init = async function () {
  await mongoose.connect("mongodb+srv://yuvrajbhatnagar36:yuvrajbhatnagar36@cluster0.iq1uuxm.mongodb.net/ECommerce?retryWrites=true&w=majority");
  console.log("Server is connected to database");
};
