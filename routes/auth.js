const {Router} = require('express');
const { getLogin, postLogin, postLogout, getSignup, postSignup, getReset, postReset, getNewPassword, postNewPassword} = require('../controllers/auth');
const isAuth = require('./../middleware/is-auth')
const signupValidator = require('./../validation/signupValidator');
const loginValidator = require('./../validation/loginValidator');


const router = new Router();

router.get('/login', getLogin)
router.post('/login', loginValidator, postLogin)
router.post('/logout', isAuth, postLogout)
router.get('/signup', getSignup);
router.post('/signup', signupValidator, postSignup);
router.get('/reset', getReset);
router.post('/reset', postReset);
router.get('/reset/:token', getNewPassword);
router.post('/new-password', postNewPassword);



module.exports = router;