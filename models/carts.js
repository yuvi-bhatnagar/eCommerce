const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    user:String,
    productName: String,
    productPrice:Number,
    quantity:{
        type:Number,
        default:1,
    },
    productImage:String,
    productDesc:String
})

const Cart = mongoose.model("Cart", cartSchema)

module.exports = Cart;