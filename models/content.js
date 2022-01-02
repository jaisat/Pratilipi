const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContentSchema = new Schema({
    title: String,
    image: String,
    story: String,
    datePublished: String
});

module.exports = mongoose.model('Content',ContentSchema);