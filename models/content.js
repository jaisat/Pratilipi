const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContentSchema = new Schema({
    title: String,
    image: String,
    story: String,
    likeCount : {
        type : Number,
        default: 0
    },
    viewCount : {
        type : Number,
        default: 0
    },
    datePublished: {
        type : Date,
        default: Date.now()
    },
    likes: [{type: Schema.Types.ObjectId, ref : 'Like'}],
    author :{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }
});

module.exports = mongoose.model('Content',ContentSchema);
