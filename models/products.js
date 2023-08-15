const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    productName: String,
    productPrice:Number,
    quantity:{
        type:Number,
        default:0,
    },
    productImage:String,
    productDesc:String,
    isActive:{
        type:Boolean,
        default:true
    },
})

const Products = mongoose.model("Products", productSchema)

module.exports = Products;