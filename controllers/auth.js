const User = require('./../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { MailtrapTransport } = require("mailtrap");
const crypto = require('crypto')
const {validationResult} = require('express-validator');
const { values } = require('../validation/signupValidator');
const getStatusField = require('../helpers/getStatusField');

const transport = nodemailer.createTransport(MailtrapTransport({
    token: '006526eacf2fd8a778681fb12e15f6a7',
    testInboxId: 3041466,
}))

module.exports.getLogin = (req, res) => {;
    const status = getStatusField();
    res.render('auth/login', {
        docTitle: 'Login',
        path: '/login',
        values: {
            email: {...status, value: ''}
        }
    })
}

module.exports.postLogin = async (req, res) => {
    // res.cookie('Set-Cookie', 'otraCookie2=2')
    if(req.session.isLoggedIn) return res.redirect('/');
    if(!req.csrf.verify(req.session.secret, req.body._csrfLogin))
        return res.redirect('/login');

    const email = req.body.email;
    

    const errors = validationResult(req).array();

    if(errors.length > 0) 
        return res.render('auth/login', {
            docTitle: 'Login',
            path: '/login',
            values: {
                email: {...getStatusField('email', errors), value: email}
            }
        });
    // const sender = {
    //     address: "mailtrap@example.com",
    //     name: "Mailtrap Test",
    // };
    // const recipients = [
    //     "fernando.huerta4313@alumnos.udg.mx",
    // ];

    // await transport.sendMail({
    //     from: sender,
    //     to: recipients,
    //     subject: "You are awesome!",
    //     text: "Congrats for sending test email with Mailtrap!",
    //     category: "Integration Test",
    //     sandbox: true,
    // })

    req.session.isLoggedIn = true;
    await req.session.save(() => {
        res.redirect('/')
    });
    
    // res.cookie('loggedIn', 'true');
   
}

module.exports.postLogout = async (req, res) => {
    
    // res.cookie('Set-Cookie', 'otraCookie2=2')
    const isValid = req.csrf.verify(req.session.secret, req.body._csrfLogout);
    
    if(!isValid)
        return res.redirect('/')
    
    req.session.destroy(() => {
        res.redirect('/')
    })
}

module.exports.getSignup =  async (req, res, next) => {
    if(req.session.isLoggedIn) return res.redirect('/');

    const status = getStatusField();
    res.render('auth/signup', {
        path: '/signup',
        docTitle: 'Signup',
        isLogin: false,
        values: {
            firstName: {...status, value: ''},
            lastName : {...status, value: ''},
            email : {...status, value: ''},
            password : {...status, value: ''}
        }
      });
}

module.exports.postSignup = async (req, res, next) => {
    if(req.session.isLoggedIn) return res.redirect('/');
    try {
        if(!req.csrf.verify(req.session.secret, req.body._csrfSignup))
            return res.redirect('/login');

        const errors = validationResult(req).array();

        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const email = req.body.email;
        const password = req.body.password;
       
        
        console.log(errors);
        
        if(errors.length > 0) 
            return res.render('auth/signup', {
                path: '/signup',
                docTitle: 'Signup',
                isLogin: false,
                values: {
                    firstName: {...getStatusField('firstName', errors), values: firstName},
                    lastName : {...getStatusField('lastName', errors), values: lastName},
                    email : {...getStatusField('email', errors), values: email},
                    password : {...getStatusField('password', errors), values: password}
                }
            });
        

        
        const encryptPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: encryptPassword,
            cart: {items: []} 
        })
        
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.log(error);
    }
     
};

module.exports.getReset = (req, res) => {
    res.render('auth/reset', {
        path: '/reset',
        docTitle: 'Reset Password',
        isLogin: false,
        errorMessage: req.flash('error')
    });
}

module.exports.postReset = (req, res) => {
    const email = req.body.email;
    crypto.randomBytes(32, (error, buffer) => {
        if(error) {
            console.log(error);
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');

        User.findOne({email})
        .then(user => {
            if(!user) {
                req.flash('error', `The user ${email} don't exist`);
                res.redirect('/reset');
            }

            user.resetToken.token = token;
            user.resetToken.tokenExpiration = Date.now() + (1000 * 60 * 60) ; 
            

            return user.save();
        })
        .then(result => {
            const sender = {
                address: "mailtrap@example.com",
                name: "Mailtrap Test",
            };
            const recipients = [
                email,
            ];

            res.redirect('/')
            transport.sendMail({
                from: sender,
                to: recipients,
                subject: "Reset your password",
                text: "Congrats for sending test email with Mailtrap!",
                category: "Integration Test",
                sandbox: true,
                html:  `
                    <p>Your requested a password reset </p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
                `
            })

        })
        .catch(error => console.log(error));
    })
}

module.exports.getNewPassword = async(req, res) => {
    const token = req.params.token;
    const user = await User.findOne({'resetToken.token': token});

    if(!user) return res.redirect('/login')
    
    if(user.resetToken.tokenExpiration < Date.now()) {
        user.resetToken.token = null;
        user.resetToken.tokenExpiration = null;
        await user.save();
        return res.redirect('/login')
    }
    
    
    res.render('auth/newPassword', {
        path: '/new-password',
        docTitle: 'New Password',
        isLogin: false,
        userId: user._id.toString(),
        resetToken: token
    });
}

module.exports.postNewPassword = async(req, res) => {
    const password = req.body.password;
    const userId = req.body.userId;
    const token = req.body.resetToken;
    const _csrfLogin = req.body._csrfLogin;
    const user = await User.findById(userId);
    if (
        !user 
        || !req.csrf.verify(req.session.secret, _csrfLogin) 
        || token !== user.resetToken.token 
        || user.resetToken.tokenExpiration < Date.now()
    ){
        return res.redirect('/login');
    }
    user.password = await bcrypt.hash(password, 12);
    user.resetToken.token = null;
    user.resetToken.tokenExpiration = null;

    await user.save();

    res.redirect('/login');
}
