const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
    name: {
        type: String,
        required : true,
        unique: true
    }
},{timestamps:true});

areaSchema.index({ name: 1 });

module.exports = mongoose.model('Area', areaSchema)