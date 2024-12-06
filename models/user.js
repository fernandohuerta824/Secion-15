const moongose = require('mongoose')
const Product = require('./product')
const { default: mongoose } = require('mongoose');
const Order = require('./order');

const userSchema = new moongose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    resetToken: {
        token: String,
        tokenExpiration: Date
    },
    cart: {
        items: [
            {productId: { type: moongose.Schema.Types.ObjectId, ref: 'Product'}, quantity: Number}
        ]
    }
})

function sortCart(a, b) {
    if(a._id.toString() < b._id.toString())
        return -1;
}

/**
* 
* @param {Product} product 
* @returns {Products[]}
*/
userSchema.methods._mergeProduct = function (product) {
    return product.map((p, i) => {
        const quantity = this.cart.items[i].quantity;
        p.quantity = quantity;
        p.itemPrice = +(quantity * p.price.toFixed(2))
        return p;
            
    });
}

userSchema.methods.addToCart = function(product) {   
    const cartProductIndex = this.cart.items.findIndex(p => p._id.id.toString() === product._id.id.toString())
    if(cartProductIndex >= 0) {
         const newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        this.cart.items[cartProductIndex] = {_id:  product._id, quantity: newQuantity};
        
    } else {
        this.cart.items.push({_id:  product._id, quantity: 1});
    }
    return this.save();
}

userSchema.methods.getCart = async function() {
    const productsDB = await Product.find({_id: {$in: this.cart.items.map(p => p._id)}}).select('title price imageURL description');

    productsDB.sort(sortCart);
    this.cart.items.sort(sortCart);
    const cartProducts = this._mergeProduct(productsDB)

    if(productsDB.length !== this.cart.items.length) {
        const newCart = {items: []};
        await db.collection('users').updateOne({_id: this._id}, {$set: {cart: newCart}})
        this.cart.items = newCart;
    }
        
    return {
        products: cartProducts,
        totalPrice: +(cartProducts.reduce((acc, v) => acc + v.itemPrice, 0)).toFixed(2)
    } 
}

userSchema.methods.deleteToCart = async function(productId) {
    const cartProductIndex = this.cart.items.findIndex(p => p._id.id.toString() === productId.id.toString());
    
    if(cartProductIndex < 0) return;
            
    const [deleteProduct] = this.cart.items.splice(cartProductIndex, 1);
            
    return this.save();
}

userSchema.methods.addOrder = async function() {
    const {products, totalPrice} = await this.getCart();

    const correctProduct = products.map(p => {
        return {_id: p._id, price: p.price, quantity: p.quantity};
    });

    const order = new Order({products: correctProduct, totalPrice, date: new Date().toUTCString(), userId: this._id})

    order.save();
    this.cart = {items: []};
    this.save();
}

userSchema.methods.getOrders = async function() {

    const orders = await Order.find({userId: this._id});
    const newItems = await Promise.all(orders.map(async o => {
    const products = await Promise.all(o.products.map(async p => {
    const product = await Product.findOne({_id: p._id})
        return {_id: p._id, price: p.price, quantity: p.quantity, imageURL: product.imageURL, title: product.title, itemPrice: (p.quantity * p.price).toFixed(2)};
    }))        
        return {...o._doc, products: products};
    }))

        
    return newItems;
}
    

module.exports = mongoose.model('User', userSchema, 'users');

// const { ObjectId } = require("mongodb");
// const connectDB = require("../helpers/database");
// const Product = require("./product");

// class User {
    
//     constructor(username, email, id = null, cart = null) {
//         this.username = username;
//         this.email = email;
//         this._id = !id ? null : new ObjectId(id);
//         this.cart = !id ? {items: []} : cart ;
//     }

//     async save() {
//         const db =  await connectDB();
//         if(!this._id) return db.collection('users').insertOne(this);
//         else return db.collection('users').updateOne({_id: this._id}, {$set : this});
//     }

//     /**
//      * 
//      * @param {Product} product 
//      * @returns {Promise<any>}
//      */
//     async addToCart(product) {
//         const db =  await connectDB();
        
        
//         const cartProductIndex = this.cart.items.findIndex(p => p._id.id.toString() === product._id.id.toString())
//         if(cartProductIndex >= 0) {
//             const newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             this.cart.items[cartProductIndex] = {_id:  product._id, quantity: newQuantity};
        
//         } else {
//             this.cart.items.push({_id:  product._id, quantity: 1});
//         }

//         return db.collection('users').updateOne({_id: this._id}, {$set: {cart: this.cart}})
        
//     }

//     #sortCart(a, b) {
//         if(a._id.toString() < b._id.toString())
//             return -1;
//     }

//     /**
//      * 
//      * @param {Product} product 
//      * @returns {Products[]}
//      */
//     #mergeProductCart(product) {
//         return product.map((p, i) => {
//             const quantity = this.cart.items[i].quantity;
//             return {...p, quantity, itemPrice: +(quantity * p.price.toFixed(2))}
            
//         });
//     }

//     async getCart() {
//         const db =  await connectDB();

//         const productsDB = await  db.collection('products').find({_id: {$in: this.cart.items.map(p => p._id)}}, {projection: {_id: 1, title: 1, price: 1, imageURL: 1}}).toArray();

//         productsDB.sort(this.#sortCart);
//         this.cart.items.sort(this.#sortCart);
//         const cartProducts = this.#mergeProductCart(productsDB)

//         if(productsDB.length !== this.cart.items.length) {
//             const newCart = {items: []};
//             db.collection('users').updateOne({_id: this._id}, {$set: {cart: newCart}})
//             this.cart.items = newCart;
//         }
        
//         return {
//             products: cartProducts,
//             totalPrice: +(cartProducts.reduce((acc, v) => acc + v.itemPrice, 0)).toFixed(2)
//         } 
//     }

//     async deleteToCart(productId) {
//         const db =  await connectDB();

//         const cartProductIndex = this.cart.items.findIndex(p => p._id.id.toString() === productId.id.toString());

//         if(cartProductIndex < 0) return;
        
//         const [deleteProduct] = this.cart.items.splice(cartProductIndex, 1);
        
//         return db.collection('users').updateOne({_id: this._id}, {$set: {cart: this.cart}})
//     }

//     async addOrder() {
//         const db = await connectDB();
//         const products = await this.getCart();

        
//         await db.collection('orders').insertOne({...products, userId: this._id, date: new Date().toUTCString()});
//         this.cart = {items: []};
//         await db.collection('users').updateOne({_id: this._id}, {$set: {cart: this.cart}})
//     }

//     async getOrders() {
//         const db = await connectDB();
//         const orders = await db.collection('orders').find({userId: this._id}).toArray();
//         const newItems = await Promise.all(orders.map(async o => {
//             const products = await Promise.all(o.products.map(async p => {
//                 const product = await db.collection('products').findOne({_id: p._id}, {projection: {imageURL: 1}})
//                 return {...p, imageURL: product.imageURL};
//             }))
            
//             return {...o, items: products};
//         }))

        
//         return newItems;
//     }

//     static async find(id) {   
//         const db =  await connectDB();
//         const productJSON =  await db.collection('users').findOne({_id: new ObjectId(id)});
//         if(!productJSON) return null;
//         return new User(productJSON.username, productJSON.email, productJSON._id, productJSON.cart);
//     }
// }

// module.exports = User;