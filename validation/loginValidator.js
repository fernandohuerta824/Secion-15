const User = require('../models/user');
const {body} = require('express-validator');
const bcrypt = require('bcryptjs');
module.exports = [
    body('password')
        .trim()
        .isLength({
            min: 8,
            max: 40
        }).withMessage('La contraseña debe contener mas de 5 caracteres y menos de 49')
        .bail()
        .isAlphanumeric()
        .withMessage('Solo se permiten numeros y letras en la contraseña'),
    body('email')
        .normalizeEmail({all_lowercase: true})
        .isEmail()
        .withMessage('Ingrese un Email Valido')
        .bail()
        .custom(async (email, {req}) => {
            const user = await User.findOne({email});
            const password = req.body.password;
            const message = 'Invalid email o password';
            if(!user) 
                return Promise.reject(message);
            else 
                if(!(await bcrypt.compare(password, user.password)))
                    return Promise.reject(message);
            
            req.session.user = user;
            return true;
        })
]