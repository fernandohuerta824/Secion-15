const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
const MongoDBStore = require('connect-mongo')
// const https = require('https')
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const rootDir = require('./helpers/path');
const {handler404} = require('./controllers/404');
const User = require('./models/user');
const { default: mongoose } = require('mongoose');
const Csrf = require('csrf')
const flash = require('connect-flash');
const { handler505 } = require('./controllers/500');
const multer = require('multer')
const crypto = require('crypto');
const { default: helmet } = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

require('dotenv').config();

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.njj8za8.mongodb.net/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority&appName=Cluster0`;
// const User = require('./models/user');


const app = express();

// const privateKey = fs.readFileSync('server.key')
// const certificate = fs.readFileSync('server.cert')


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        const hash = crypto.createHash('sha256');
        hash.update(file.originalname + new Date().toISOString())
        const filename = hash.digest('hex')
        cb(null,  filename + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg'  || file.mimetype === 'image/jpeg' ) 
        cb(null, true) 
    else
        cb(null, false)
}

// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(helmet({strictTransportSecurity: false}))
app.use(compression())
// app.use(morgan('combined', { stream: accessLogStream }))



app.use(session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
    },

    store: MongoDBStore.create({
        mongoUrl: uri,
        collectionName: 'sessions',
        ttl: 60 * 60 * 24 * 30,
        stringify: false, 
    })
}))


app.use(async (req, res, next) => {
    try {
        if(!req.session.user) return next();
        const user = await User.findById(req.session.user._id);

        if(!user) return next();

        req.session.user = user;

        next();
    } catch(error) {
        console.log(error);
    }
    
})

app.use(async (req, res, next) => {
    const csrf = new Csrf({
        saltLength: 8,
        secretLength: 32
    })
    
    
    if(!req.session.secret)
        req.session.secret = await csrf.secret();
    res.locals.csrfToken = csrf.create(req.session.secret);
    res.locals.isLoggedIn = req.session.isLoggedIn; 
    req.csrf = csrf;

    
    next();
})

app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(rootDir, 'images')));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter}).single('image'));


app.use(shopRoutes);
app.use(authRoutes);

app.use('/admin',adminRoutes);


app.use(handler404)

app.use((error, req, res, next) => {
    console.log(error);
    
    res.status(500).render('500', {docTitle: 'Error 500', path: null, })

} )

mongoose.connect(uri, {serverApi: {version: '1', strict: true, deprecationErrors: true}, dbName: 'shop', minPoolSize: 1, maxPoolSize: 10})
.then(result => {
    // https.createServer({key: privateKey, cert: certificate}, app).listen(process.env.PORT || 3001, () => console.log('Server running on port ' + (process.env.PORT || 3001)))  
    app.listen(process.env.PORT || 3001, () => console.log('Server running on port ' + (process.env.PORT || 3001)))
})
.catch(error => console.log(error));






