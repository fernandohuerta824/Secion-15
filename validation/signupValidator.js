const User = require('../models/user');
const {body} = require('express-validator');
module.exports = 
[
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .bail()
        .isLength({
            min: 6,
            max: 60
        })
        .withMessage('El nombre debe contener mas de 5 caracteres y menos de 60')
        .escape(),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('El apellido es obligatorio')
        .bail()
        .isLength({
            min: 6,
            max: 60
        })
        .withMessage('El apellido debe contener mas de 5 caracteres y menos de 60')
        .escape(),

    body('email')
        .normalizeEmail({all_lowercase: true})
        .isEmail()
        .withMessage('Ingrese un email valido')
        .bail()
        .custom(async (value, {req}) => {
            const user = await User.findOne({email: value});

            if(user) 
                return Promise.reject('There is already an account with that email')
            
            return true;
        }),
        

    body('password')
        .trim()
        .isLength({
            min: 8,
            max: 40
        }).withMessage('La contraseña debe contener mas de 5 caracteres y menos de 49')
        .bail()
        .isAlphanumeric()
        .withMessage('Solo se permiten numeros y letras en la contraseña')
        .bail()
        .custom((value, {req}) => {
            if(value !== req.body.confirmPassword.trim()) throw new Error('Las contraseñas no coinciden');
            return true;
        }),
]