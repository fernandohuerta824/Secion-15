
const {Router} = require('express');

const shopControllers= require('../controllers/shop')
const isAuth = require('./../middleware/is-auth')


const router = Router();

router.get('/', shopControllers.getIndex)
router.get('/products', shopControllers.getProductList)
router.get('/cart', isAuth, shopControllers.getCart)
router.post('/cart', isAuth, shopControllers.postCart)
router.post('/cart-delete', isAuth, shopControllers.postDeleteCartProduct)
// router.get('/checkout', shopControllers.getCheckout);
// router.get('/checkout', shopControllers.getCheckout);
router.get('/orders', isAuth, shopControllers.getOrders);

router.post('/invoice', isAuth, shopControllers.postInvoice);
router.get('/checkout', isAuth, shopControllers.getCheckout);
router.get('/checkout/success', isAuth, shopControllers.postOrders);
router.get('/checkout/cancel', isAuth, shopControllers.getCheckout);



router.get('/product-details/:id', shopControllers.getProduct);

module.exports = router;
