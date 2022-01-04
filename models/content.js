const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContentSchema = new Schema({
    title: String,
    image: String,
    story: String,
    like: Number,
    datePublished: Date,
    likes: [{type: Schema.Types.ObjectId, ref : 'User'}],
    author :{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }
});

module.exports = mongoose.model('Content',ContentSchema);
