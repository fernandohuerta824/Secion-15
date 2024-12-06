const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: String,
    price: Number,
    imageURL: String,
    description: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports =  mongoose.model('Product', productSchema, 'products')



// const { ObjectId } = require('mongodb');
// const connectDB = require('./../helpers/database')

// class Product {

//     constructor(title, price, description, imageURL, userId, id = null) {
//         this.title = title;
//         this.price = parseFloat(price);
//         this.description = description;
//         this.imageURL = imageURL;
//         this.userId = userId;
//         this._id = !id ? null : new ObjectId(id);
//     }

//     async save() {
//         const db = await connectDB();
//         if(!this._id) return db.collection('products').insertOne(this);
//         else return db.collection('products').updateOne({_id: this._id}, {$set: this});
//     }

//     static async delete(id) {
//         const db = await connectDB();
//         return db.collection('products').deleteOne({_id: new ObjectId(id)});
//     }

//     static async all() {
//         const db = await connectDB();
//         const productsJSON = await db.collection('products').find().toArray();
//         const products = productsJSON.map(p => new Product(p.title, p.price, p.description, p.imageURL, p.userId, p._id));
//         return products;
//     }

//     static async find(id) {
//         const db = await connectDB();
//         const productJSON = await db.collection('products').findOne({_id: new ObjectId(id)});
//         if(!productJSON) return null;
//         return new Product(productJSON.title, productJSON.price, productJSON.description, productJSON.imageURL, productJSON.userId, productJSON._id)
//     }
// }

// module.exports = Product;