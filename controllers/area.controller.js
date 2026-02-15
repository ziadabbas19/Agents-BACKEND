const Area = require('../models/area-model');
const asyncHandler = require('express-async-handler');

//ADD NEW AREA
exports.createArea = asyncHandler(async(req, res)=>{
    console.log("✅ دخلنا في createDailyLog");
    const {name} = req.body;

    if(!name){
        res.status(400)
        throw new Error('AREA NAME IS REQUIRED');
    }

    const exists = await Area.findOne({name});
    if(exists){
        res.status(400)
        throw new Error('AREA IS ALREADY EXISTS')
    }

    const area = await Area.create({name})
    res.status(201).json(area);
});



//GET  ALL AREAS
exports.getAllAreas = asyncHandler(async(req, res)=>{
    const areas  = await Area.find();
    res.json(areas)
});


//UPDATE  AREA
exports.updateArea = asyncHandler(async(req, res)=>{
    const area = await Area.findByIdAndUpdate(req.params.id, req.body, {new:true});
    if(!area){
        res.status(404);
        throw new Error('AREA NOT FOUND TO UPDATE');
    }

    res.json(area);
})


//DELETE AREA
exports.deleteArea = asyncHandler(async(req, res)=>{
    const area = await Area.findByIdAndDelete(req.params.id)
    if(!area){
        res.status(400)
        throw new Error('AREA NOT FOUND TO DELETE')
    }
    res.json({ message: `${area.name} deleted` });
})