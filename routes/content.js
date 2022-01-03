const express = require('express');
const router  = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Content = require('../models/content');
const {contentSchema} = require('../schemas');

const validateContent = (req,res,next) =>{
    const {error} = contentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/',catchAsync( async(req,res) => {
    const contents = await Content.find({});
    res.render('contents/index', {contents});
}));

router.get('/new', (req,res) => {
    res.render('contents/new');
});

router.get('/:id',catchAsync( async(req,res) =>{
    const content = await Content.findById(req.params.id);
    res.render('contents/show', {content});
}));

router.post('/', validateContent, catchAsync( async(req,res,next) =>{
        var date = new Date(); 
        var dd = date.getDate(); 
        var mm = date.getMonth() + 1; 
        var yyyy = date.getFullYear(); 
        var newDate = dd + "/" + mm + "/" +yyyy;
        req.body.content.datePublished = newDate;

        const content = new Content(req.body.content);
        await content.save();
        res.redirect(`/contents/${content._id}`);
}));

router.get('/:id/edit' , catchAsync(async(req,res) =>{
    const content = await Content.findById(req.params.id);
    res.render('contents/edit', {content});
}));

router.put('/:id', validateContent ,catchAsync(async(req,res) =>{
    const content =  await Content.findByIdAndUpdate(req.params.id, {... req.body.content});
    res.redirect(`/contents/${content._id}`);
}));

router.delete('/:id', async(req,res) =>{
    const { id } = req.params;
    await Content.findByIdAndDelete(id);
    res.redirect('/contents');
})

module.exports = router;