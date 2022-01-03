const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Content = require('./models/content');
const methodOverride = require('method-override');
const ejsMate  = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const flash = require('connect-flash');
const session = require('express-session');

const contentRoutes = require('./routes/content');
const userRoutes    = require('./routes/users');

mongoose.connect('mongodb://localhost:27017/prati-lipi',{
    useNewUrlParser: true,
    useUnifiedTopology : true,
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

const sessionConfig = {
    secret : 'thinkofabetterSecret',
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        expires : Date.now() + 1000 * 60 * 60 *24 * 7,
        maxAge :  1000 * 60 * 60 *24 * 7
    }
}


app.use(session(sessionConfig));
app.use(flash());

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));

app.use(express.static('public'));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())
  


app.use((req,res,next) =>{
    res.locals.currentUser = req.user;
    res.locals.success     = req.flash('success');
    res.locals.error       = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/contents', contentRoutes);


app.get('/',(req,res) =>{
    res.render('home');
})

app.all('*',(req,res,next) =>{
    next(new ExpressError('Page Not Found', 404));
})

app.use((err,req,res,next) =>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'OH NO ! SOMETHING WENT WRONG';  
    res.status(statusCode).render('error', {err});
})

app.listen(3000,() => {
    console.log('Serving on port 3000');
})