const {body} = require('express-validator');

module.exports = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('El titulo es obligatorio')
        .bail()
        .isLength({
            min: 6,
            max: 255
        })
        .withMessage('El titulo debe contener mas de 5 caracteres y menos de 255')
        .escape(),
    body('price')
        .toFloat()
        .custom((price, {req}) => {
            if(!isFinite(price) || price < 1)
                throw new Error('Ingrese un numero mayor o igual a 1')
            return true;
        }),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('La descripcion es obligatoria')
        .bail()
        .isLength({
            min: 15,
            max: 1000
        })
        .withMessage('La descripcion debe contener mas de 15 caracteres y menos de 1000')
        .escape(),
]