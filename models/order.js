const {Schema, model} = require('mongoose');



const orderSchema = new Schema({
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                
                ref: 'Product'
            },
            price: Number,
            quantity: Number
        }
    ],
    totalPrice: Number,
    date: Date,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

})

module.exports = model('Order', orderSchema, 'orders');

// const Order = sequelize.define(
//     'order',
//     {
//         id: {
//             type: DataTypes.INTEGER,
//             autoIncrement: true,
//             allowNull: false,
//             unique: true,
//             primaryKey: true
//         },
//         userId: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             references: {
//                 model: User,
//                 key: 'id'
//             }
//         }
//     }
// )

// module.exports = Order;