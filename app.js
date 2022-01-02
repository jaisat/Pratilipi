const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Content = require('./models/content');
const methodOverride = require('method-override');
const ejsMate  = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const {contentSchema} = require('./schemas');
const { nextTick } = require('process');
const Joi = require('joi');
const ExpressError = require('./utils/ExpressError');
const content = require('./models/content');
const { validate } = require('./models/content');

mongoose.connect('mongodb://localhost:27017/prati-lipi',{
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology : true
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

const validateContent = (req,res,next) =>{
    const {error} = contentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/',(req,res) =>{
    res.render('home');
})

app.get('/contents',catchAsync( async(req,res) => {
    const contents = await Content.find({});
    res.render('contents/index', {contents});
}));

app.get('/contents/new', (req,res) => {
    res.render('contents/new');
})

app.get('/contents/:id',catchAsync( async(req,res) =>{
    const content = await Content.findById(req.params.id);
    res.render('contents/show', {content});
}));

app.post('/contents', validateContent, catchAsync( async(req,res,next) =>{
        var date = new Date(); 
        var dd = date.getDate(); 
        var mm = date.getMonth() + 1; 
        var yyyy = date.getFullYear(); 
        var newDate = dd + "/" + mm + "/" +yyyy;
        req.body.content.datePublished = newDate;

        const content = new Content(req.body.content);
        await content.save();
        res.redirect(`/contents/${content._id}`);
}))

app.get('/contents/:id/edit' , catchAsync(async(req,res) =>{
    const content = await Content.findById(req.params.id);
    res.render('contents/edit', {content});
}));

app.put('/contents/:id', validateContent ,catchAsync(async(req,res) =>{
    const content =  await Content.findByIdAndUpdate(req.params.id, {... req.body.content});
    res.redirect(`/contents/${content._id}`);
}));

app.delete('/contents/:id', async(req,res) =>{
    const { id } = req.params;
    await Content.findByIdAndDelete(id);
    res.redirect('/contents');
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