const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ViewSchema = new Schema({
    view : {type: Schema.Types.ObjectId, ref : 'User'}
});

module.exports = mongoose.model('View',ViewSchema);
