const {DataTypes} = require('sequelize')
const sequelize = require('./../helpers/database');
const Product = require('./product');
const Order = require('./order');


const OrderItem = sequelize.define(
    'orderItem',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        quantity:{
            type: DataTypes.TINYINT,
            allowNull: false
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Product,
                key: 'id'
            }
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Order,
                key: 'id'
            }
        }
    }
)

module.exports = OrderItem;