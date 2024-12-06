const {Router} = require('express');

const adminControllers = require('../controllers/admin')
const isAuth = require('./../middleware/is-auth')
const router = Router();
const productValidator = require('./../validation/productValidator');

router.use(isAuth);
router.get('/add-product', adminControllers.getAddProduct);
router.post('/add-product', productValidator, adminControllers.postAddProducts);
router.get('/products', adminControllers.getAdminProducts);
router.get('/edit-product/:id',adminControllers.getEditProduct);
router.post('/edit-product', productValidator ,adminControllers.postEditProduct)
router.delete('/product/:id', adminControllers.deleteProduct);



module.exports = router;
