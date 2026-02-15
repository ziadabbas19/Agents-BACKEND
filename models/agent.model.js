const mongoose = require('mongoose');


const agentSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    code:{
        type: String,
        required: true,
        unique: true
    },
    phone: String,
    notes: String,
    vacation:{
        type: [String],
        required: true,
        default:[]
    },

    areas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area'
    }],

    isDeleted: { type: Boolean, default: false },
},{timestamps:true})


// Indexes 
agentSchema.index({ code: 1 });
agentSchema.index({ isDeleted: 1 });
agentSchema.index({ name: 1 });
agentSchema.index({ createdAt: -1 });


module.exports = mongoose.model('Agent', agentSchema)