const checkID = require('../helpers/checkID');
const product = require('../models/product');
const Product = require('../models/product');
const {validationResult} = require('express-validator');
const getStatusField = require('../helpers/getStatusField');
const fs = require('fs');
const path = require('../helpers/path');


module.exports.getAddProduct =  (req, res, next) => {
    const status = getStatusField();
    try {
        
        res.render('admin/form-product' ,{
            docTitle: 'Add Product',
            path: '/admin/add-product',
            editing: null,
            values: {
                title : {...status, value: ''},
                price : {...status, value: ''},
                description: {...status, value: ''},
                image: {...status, value: ''},
            }
        })
    } catch (error) {
        console.log(error);
        
    }
};

module.exports.postAddProducts = async (req, res, next) => {
    try {
        if(!req.csrf.verify(req.session.secret, req.body._csrfProductForm))
            return res.redirect('/admin/add-product');

        const errors = validationResult(req).array();

        const {title, price, description} = req.body;
        const image = req.file;
       
        
        const imgError = {error: {msg: ''}, class: 'form-control--error'};
        if(!image) 
            imgError.error.msg = 'Invalid image file';


        if(errors.length > 0 || !image) {
            

            if(image) {
                fs.unlink(image.path, (err) => {
                    if(err) console.log(err);
                }) 
                
                imgError.error.msg = 'Please select the image again';
            }

            


            return res.status(422).render('admin/form-product' ,{
                docTitle: 'Add Product',
                path: '/admin/add-product',
                editing: null,
                values: {
                    title : {...getStatusField('title', errors), value: title},
                    price : {...getStatusField('price', errors), value: price},
                    description: {...getStatusField('description', errors), value: description},
                    image: imgError,
                }
                
            })
        }
            

        const imageURL = image.path;
        const product = new Product({
            title, 
            price, 
            description, 
            imageURL, 
            userId: req.session.user._id
        });
    
        await product.save();

        res.redirect('/');
    } catch(error) {
        
        error.message = 'An error ocurred when adding a product: ' + error.message;
        error.status = 500;
        throw error;
    }
};

module.exports.getAdminProducts = async (req, res, next) => {
    try {
        
        
        res.render('admin/product-list', {
            products: await Product.find({userId: req.session.user._id}),
            docTitle: 'Admin Products',
            path: '/admin/products',
               
        })
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports.getEditProduct = async (req, res, next) => {
    try {
       
        
        const id = req.params.id;
        if(!checkID(id)) return res.redirect('/admin/products');
        const product = await Product.findById(id)
        if(!product) return res.redirect('/');

        const status = getStatusField();
        if(product.userId.toString() !== req.session.user._id.toString()) return res.redirect('/');

        
        
        res.render('admin/form-product', {
            docTitle: 'Edit product: ' + product.title,
            path: '/admin/products',
            editing: true,
            values: {
                id:  product._id,
                title: {...status, value: product.title},
                price: {...status, value: product.price},
                description: {...status, value: product.description},
                image: {...status, value: product.imageURL},
                title: {...status, value: product.title},
            }
            
        })
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports.postEditProduct = async (req, res) => {
    try {
        if(!req.csrf.verify(req.session.secret, req.body._csrfProductForm))
            return res.redirect('/admin/products');

        
        const id = req.body.id

        if(!checkID(id)) return res.redirect('/admin/products');



        const product = await Product.findOne({_id: id, userId: req.session.user._id})

        product.title = req.body.title;
        product.price = +req.body.price;
        product.description = req.body.description;
        

        const errors = validationResult(req).array();

        if(errors.length > 0) 
            return res.status(422).render('admin/form-product' ,{
                docTitle: 'Edit Product',
                path: '/admin/products',
                editing: true,
                values: {
                    id: product._id,
                    title: {...getStatusField('title', errors), value: product.title},
                    price: {...getStatusField('price', errors), value: product.price},
                    description: {...getStatusField('description', errors), value: product.description},
                    image: {error: null, class: ''},
                    title: {...getStatusField('title', errors), value: product.title},
                }
                
            })
        
        


        if(!product || product.userId.toString() !== req.session.user._id.toString()) 
            return res.redirect('/admin/products');

        const image = req.file;
        if(image) {
            fs.unlink(path + "\\" +  product.imageURL, (err) => {
                if(err) console.log(err);
            }) 
            product.imageURL = image.path;
        } 
        
        
        await product.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error);
        
        res.status(500).send(error);
    }
}



module.exports.deleteProduct = async (req, res) => {
    try {
        //Obtener el valor del fetch
        const id = req.params.id;
        const csrf = req.headers['csrf-token'];
        
        if(!checkID(id) ) return res.status(404).json({
            ok: false,
            message: 'Product not found',
        })
        

        if(!req.csrf.verify(req.session.secret, csrf)) return res.status(403).json({
            ok: false,
            message: 'Invalid csrf token'
        })

        const result = await Product.deleteOne({_id: id, userId: req.session.user._id});
        
        if(result.deletedCount === 0) return res.status(404).json({
            ok: false,
            message: 'Product not found',
        })

        fs.unlink(path + "\\" +  product.imageURL, (err) => {
            if(err) console.log(err);
        }) 

        res.status(200).json({
            ok: true,
            message: 'Product deleted'
        })
    } catch (error) {
        
        res.status(500).json({
            ok: false,
            message: 'An error ocurred when deleting the product'
        })
    }
}



