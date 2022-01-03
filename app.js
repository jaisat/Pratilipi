const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Content = require('./models/content');
const methodOverride = require('method-override');
const ejsMate  = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');

const { nextTick } = require('process');
const Joi = require('joi');
const ExpressError = require('./utils/ExpressError');
const content = require('./models/content');
const { validate } = require('./models/content');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

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

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));
app.use(express.static('public'));

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