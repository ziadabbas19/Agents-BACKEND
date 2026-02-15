const mongoose = require('mongoose');

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MONGOOSE CONNECTED');
    }  catch(err){
        console.error('error in mongoDbconnection', err.message);
        process.exit(1);
    }
}

module.exports = connectDB;