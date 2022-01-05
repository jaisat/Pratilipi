const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContentSchema = new Schema({
    title: String,
    image: String,
    story: String,
    likeCount : Number,
    viewCount : Number,
    datePublished: Date,
    likes: [{type: Schema.Types.ObjectId, ref : 'Like'}],
    views: [{type: Schema.Types.ObjectId, ref : 'Like'}],
    author :{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }
});

module.exports = mongoose.model('Content',ContentSchema);
