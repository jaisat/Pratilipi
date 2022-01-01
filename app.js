const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Content = require('./models/content');
const methodOverride = require('method-override');
const ejsMate  = require('ejs-mate');

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

app.get('/',(req,res) =>{
    res.render('home');
})

app.get('/contents',async(req,res) => {
    const contents = await Content.find({});
    res.render('contents/index', {contents});
})

app.get('/contents/new', (req,res) => {
    res.render('contents/new');
})

app.get('/contents/:id', async(req,res) =>{
    const content = await Content.findById(req.params.id);
    res.render('contents/show', {content});
})

app.post('/contents', async(req,res) =>{
    const content = new Content(req.body.content);
    await content.save();
    res.redirect(`/contents/${content._id}`);
})

app.get('/contents/:id/edit' ,async(req,res) =>{
    const content = await Content.findById(req.params.id);
    res.render('contents/edit', {content});
})

app.put('/contents/:id', async(req,res) =>{
    const content =  await Content.findByIdAndUpdate(req.params.id, {... req.body.content});
    res.redirect(`/contents/${content._id}`);
})

app.delete('/contents/:id', async(req,res) =>{
    const { id } = req.params;
    await Content.findByIdAndDelete(id);
    res.redirect('/contents');
})

app.listen(3000,() => {
    console.log('Serving on port 3000');
})