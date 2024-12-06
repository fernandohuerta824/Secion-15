const checkID = require('../helpers/checkID');
const path = require('../helpers/path');
const { join } = require('path');
const fs = require('fs');
const Product = require('./../models/product');
const Order = require('../models/order');
const PDFDocument = require('pdfkit');
const User = require('../models/user');
const stripe = require('stripe')

const payment = new stripe.Stripe('sk_test_51Q9XvEFg7N67dTvFziFuOfWrIvqUNcAdnuD2wZ9PvD6nHb3KcWYVRvA7ZYVPbIZaUxEbpZ18B72av2xfPBZiUpCm00psWpwNlY')



module.exports.getIndex = async (req, res) => {
    try {
        const queryPage = parseInt(req.query.page);
        const totalItems = await Product.countDocuments();
        const limit = 6;
        const totalPages = Math.ceil(totalItems / limit);
        const page = queryPage < 1 || !Number.isFinite(queryPage) ? 1 : queryPage > totalPages ? totalPages : queryPage || 1;
        
        const products = await Product.find().skip((page - 1) * limit).limit(limit);
        
        const infoPage = {
            totalItems,
            totalPages,
            currentPage: page,
            prevPage: page <= 1 ? null : page - 1,
            nextPage: page >= totalPages ? null : page + 1,
            limit,
            currentProducts: products.length
        }

        res.render('shop/index', {
            docTitle: 'Home',
            products,
            infoPage,
            path: '/',
        })
    } catch (error) {
        console.log(error);
        
        res.status(500).send(error);
    }
    
}

module.exports.getProduct = async (req, res, next) => {
    try {
        
    
        const id = req.params.id;
        if(!checkID(id)) return res.redirect('/');
        const product = await Product.findById(id)
        if(!product) return res.redirect('/');
        
        
        res.render('shop/product-details', {
            docTitle: 'Product: ' + product.title,
            path: null,
            product,
            
            
        })
    } catch (error) {
        res.status(500).send(error);
    }
}

module.exports.getProductList = async (req, res) => { 
    try {
        const queryPage = parseInt(req.query.page);
        const totalItems = await Product.countDocuments();
        const limit = 6;
        const totalPages = Math.ceil(totalItems / limit);
        const page = queryPage < 1 || !Number.isFinite(queryPage) ? 1 : queryPage > totalPages ? totalPages : queryPage || 1;
        
        const products = await Product.find().skip((page - 1) * limit).limit(limit);
        
        const infoPage = {
            totalItems,
            totalPages,
            currentPage: page,
            prevPage: page <= 1 ? null : page - 1,
            nextPage: page >= totalPages ? null : page + 1,
            limit,
            currentProducts: products.length
        }
        res.render('shop/product-list', {
            products,
            docTitle: 'Products',
            path: '/products',
            infoPage,
            
            
            
        })
    } catch (error) {
        console.log(error);
        
        res.status(500).send(error);
    }
}; 

module.exports.getCart = async (req, res) => {
    try {
        const cart = await req.session.user.getCart();
        let session
        let sessionId
        if(cart.products.length > 0) {
            session = await payment.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: cart.products.map(p => {
                    return {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: p.title,
                                description: p.description,
                            },
                            unit_amount: p.price * 100, 
                        },
                        quantity: 2
                    }
                }),
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
            })
            sessionId = session.id
        } else {
            session = null
        }
        res.render('shop/cart', {
            docTitle: 'Cart',
            path: '/cart',
            cart,
            sessionId
        })
    } catch(error) {
        console.log(error);
        
        res.status(500).send(error);
    }
}

module.exports.postCart = async (req, res) => {
    try {
        
        if(!req.csrf.verify(req.session.secret, req.body._csrfAddToCart)) 
            return res.redirect('/');

        const id = req.body.id;
        if(!checkID(id)) return res.redirect('/');
        const product = await Product.findById(id);
        if(!product) return res.redirect('/');
        await req.session.user.addToCart(product)
        
        res.redirect('/cart')
    } catch (error) {
        console.log(error);
        
        res.status(500).send(error);
    }
}

module.exports.postDeleteCartProduct = async (req ,res) => {
    try {
        
        const id = req.body.id;
        if(!checkID(id)) return res.redirect('/');
        const product = await Product.findById(id);
        if(!product) return res.redirect('/');
        await req.session.user.deleteToCart(product._id); 
        res.redirect('/cart')
    } catch (error) {
        console.log(error);
        
        res.status(500).send(error);
    }
}

module.exports.getCheckout = async (req, res) => {
    const cart = await req.session.user.getCart();
    console.log(cart)
    res.render('shop/checkout', {
        path: '/checkout',
        docTitle: 'Checkout',
        cart,
    })
}

module.exports.postOrders =  async (req, res) => {
    try {
        
        await req.session.user.addOrder();
        res.redirect('/orders')
    } catch (error) {
        console.log(error);
        
        res.status(500).send(error);
    }
}

module.exports.getOrders = async (req, res) => {
    try {
        const orders = await req.session.user.getOrders();
        res.render('shop/orders', {
            docTitle: 'Orders',
            path:'/orders',
            orders,
            
            
        })
        
    } catch (error) {
        console.log(error);
        
        res.status(500).send(error);
    }
}

module.exports.postInvoice = async (req, res) => {
    
    const id = req.body.id;
    if(!checkID(id)) return res.redirect('/orders');
    const invoiceName = 'invoice-' + id + '.pdf';
    const invoicePath = join('data', 'invoices', invoiceName);

    const orders = await req.session.user.getOrders(id);
    const order = orders.find(o => o._id.toString() === id.toString());
    if(!order || order.userId.toString() !== req.session.user._id.toString()) return res.redirect('/orders');
es.send(data);


    if(fs.existsSync(invoicePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
        return fs.createReadStream(invoicePath, { bufferSize: 64 * 1024 }).pipe(res);
    }


        

    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
    pdfDoc.pipe(res);



    const user = await User.findById(order.userId);
 

    // Estilos y configuración
    pdfDoc.fontSize(16).text('Invoice', { align: 'center' });
    pdfDoc.moveDown();

    // Datos generales de la orden
    pdfDoc.text('--------------------------------------------');
    pdfDoc.text('Order ID: ' + order._id);
    pdfDoc.text('Date: ' + new Date(order.date).toLocaleString());
    pdfDoc.text('--------------------------------------------');
    pdfDoc.moveDown();

    // Configuraciones de posición inicial para los productos
    let posY = 200; // Posición Y inicial para los productos
    const posXImage = 50; // Posición X para la imagen
    const posXText = 250; // Posición X para los textos

    order.products.forEach((p, i) => {
        // Mostrar la imagen del producto
        pdfDoc.image(join(path, p.imageURL), posXImage, posY, { width: 100, height: 100 });

        // Ajustar la posición de los detalles del producto
        const textOffset = 120; // Espacio entre la imagen y el texto
        const lineHeight = 15; // Espaciado entre líneas de texto

        pdfDoc.fontSize(12)
            .text('Product: ' + p.title, posXText, posY)
            .text('Price: $' + p.price, posXText, posY + lineHeight)
            .text('Quantity: ' + p.quantity, posXText, posY + lineHeight * 2)
            .text('Item Price: $' + p.itemPrice, posXText, posY + lineHeight * 3);

        // Dibujar una línea de separación
        if(i === 0 || i%3 !== 0) {
            pdfDoc.moveTo(50, posY + 120)
                .lineTo(550, posY + 120)
                .stroke();

            // Aumentar la posición Y para el próximo producto
            posY += 150; // Incrementar más el espacio entre productos
        } else {
            // Nueva pagina
            pdfDoc.addPage();
            posY = 50;
            
        }
        

        
    });
    // Mostrar el precio total al final

    posY += 50;
    pdfDoc.text('--------------------------------------------', 50, posY);
    pdfDoc.text(`User: ${user.firstName} ${user.lastName}`, 50, posY + 20);
    pdfDoc.text(`Email: ${user.email}`, 50, posY + 40);
    pdfDoc.text('--------------------------------------------', 50, posY + 60);
    
    posY += 100;
    pdfDoc.text('Total Price: $' + order.totalPrice, 50, posY);

    //Finalizar el PDF
    pdfDoc.end();
    
   
}