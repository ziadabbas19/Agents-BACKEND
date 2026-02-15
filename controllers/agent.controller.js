const Agent = require('../models/agent.model');
const Area = require('../models/area-model')
const asyncHandler = require('express-async-handler');
const {createAgentSchema, updateAgentSchema} = require('../validators/agent.validator');

//CREATE NEW AGENT
exports.createAgent = asyncHandler(async(req, res)=>{
    const {error} = createAgentSchema.validate(req.body);
    if(error){
        res.status(400);
        throw new Error(error.details[0].message);
    }

    const {name, code, phone, notes, vacation, areas}=req.body;

    const  exists = await Agent.findOne({code});
    if(exists){
        res.status(400);
        throw new Error('Agent with this code is already exists')
    }



    //AREAS
    let areasIds = [];
    if(Area && areas.length > 0){
        // Get all existing areas in one query
        const existingAreas = await Area.find({name: {$in: areas}});
        const existingAreaNames = existingAreas.map(a => a.name)

        // Find which areas need to be created
        const newAreaNames = (areas.filter(name=>!existingAreaName.includes(name)))

        // Create new areas in bulk
        let newAreas =[];
        if (newAreaNames.length > 0){
            newAreas = await Area.insertMany(
                newAreaNames.map(name=>({name}))
            )
        }

        // Combine all area IDs
        areasIds = [...existingAreas, ...newAreas].map(a => a._id);
    }

    const agent = await Agent.create({
        name, code, phone, notes, vacation, areas: areasIds
    });

    res.status(201).json(agent);
});


//GET ALL AGENTS
exports.getAllAgents = asyncHandler(async (req, res) => {

    const page = parseInt(req.query.page) || (1);
    const limit = parseInt(req.query.limit) || (10);
    const skip = (page-1)*limit;

    // Build query
    let query = {isDeleted: {$ne: true}};

    // Search by name or code
    if(req.query.search){
        query.$or=[
            {name: {$regex: req.query.search, $options: 'i'}},
            {code: {$regex: req.query.search, $options: 'i'}}
        ]
    }

    // Filter by area
    if(req.query.area){
        const area = await Area.findOne({name: req.query.area})
        if(area){
            query.areas =area._id;
        }
    }

    const total = await Agent.countDocuments(query);
    const agents = await Agent.find(query)
        .populate('areas')
        .limit(limit)
        .skip(skip)
        .sort({createdAt: -1})


    res.json({
        agents,
        pagination:{
            page, limit, total,
            pages: Math.ceil(total/limit)
        }
    })

    // const agents = await Agent.find({isDeleted:{$ne:true}}).populate('areas');
    // res.json(agents);
})


//GET AGENT BY ID
exports.getAgent = asyncHandler(async(req, res)=>{
    const agent = await Agent.findById(req.params.id).populate('areas');
    if(!agent || agen.isDeleted){
        res.status(404);
        throw new Error('AGENT NOT FOUND');
    }
    res.json(agent);
});


//UPDATE AGENT
exports.updateAgent = asyncHandler(async(req, res)=>{

    // 1. Validate input first
    const {error} = updateAgentSchema.validate(req.body);
    if(error){
        res.status(400);
        throw new Error(error.details[0].message);
    }

    const { name, code, phone, notes, vacation, areas } = req.body;

    // 2. Find agent first (don't update yet)
    const agent = await Agent.findById(req.params.id);
    
    if(!agent || agent.isDeleted){
        res.status(404);
        throw new Error('AGENT NOT FOUND TO UPDATE')
    }

    //3. Check if code is unique (if changing)
    if(code && code !== agent.code){
        const codeExists = await Agent.findOne({code, _id: {$ne: agent._id}});
        if(codeExists){
            res.status(400);
            throw new Error('Agent code already exists');
        }
    }


    // 4. Handle areas efficiently (batch operation)
    let areasIds = agent.areas; // Keep existing if not updating
    
    if(areas && Array.isArray(areas) && areas.length > 0){
        // Get all existing areas in ONE query
        const existingAreas = await Area.find({name: {$in: areas}});
        const existingAreaNames = existingAreas.map(a => a.name);
        
        // Find new areas that need to be created
        const newAreaNames = areas.filter(name => !existingAreaNames.includes(name));
        
        // Create new areas in bulk if needed
        let newAreas = [];
        if(newAreaNames.length > 0){
            newAreas = await Area.insertMany(
                newAreaNames.map(name => ({name}))
            );
        }
        
        // Combine all area IDs
        areasIds = [...existingAreas, ...newAreas].map(a => a._id);
    }

    // 5. Update all fields at once
    agent.name = name || agent.name;
    agent.code = code || agent.code;
    agent.phone = phone !== undefined ? phone : agent.phone;
    agent.notes = notes !== undefined ? notes : agent.notes;
    agent.vacation = vacation || agent.vacation;
    agent.areas = areasIds;

    // 6. Save only ONCE
    await agent.save();
    
    // 7. Populate and return
    await agent.populate('areas');
    res.json(agent);
})


//     const { name, code, phone, notes, vacation, areas } = req.body;

//     const agent = await Agent.findByIdAndUpdate(req.params.id, req.body,{new:true});

//     if(!agent){
//         res.status(404);
//         throw new Error('AGENT NOT FOUND TO UPDATE')
//     }

//     let areasIds = [];
//     if(areas && Array.isArray(areas)){
//         for(const areaName of areas){
//             let area = await Area.findOne({name: areaName})
//             if(!area){
//                 area = await Area.create({name: areaName})
//             }
//             areasIds.push(area._id)
//         }
//     }

//     agent.name = name || agent.name;
//     agent.code = code || agent.code;
//     agent.phone = phone || agent.phone;
//     agent.notes = notes || agent.notes;
//     agent.vacation = vacation || agent.vacation;
//     agent.areas = areasIds.length ? areasIds : agent.areas;


//     await agent.save();
//     res.json(agent);


//DELETE AGENT
exports.deleteAgent = asyncHandler(async(req, res)=>{
    const agent  = await Agent.findById(req.params.id);
    if(!agent){
        res.status(404)
        throw new Error('AGENT  NOT FOUND TO DELETE');
    }

    if (agent.isDeleted) {
    res.status(400);
    throw new Error('Agent is already deleted');
    }

    agent.name = `${agent.name} - deleted`;
    agent.isDeleted = true;
    await agent.save();
    res.json({ message: `Agent '${agent.name.replace(/ - deleted$/, '')}' deleted` });
})

// REATORE AGENT
exports.restoreAgent = asyncHandler(async(req, res)=>{
    const agent = await Agent.findById(req.params.id)
        if(!agent.isDeleted){
            res.status(404);
            throw new Error('AGENT NOT FOUND TO RESTORE')
        }

        agent.name = agent.name.replace(/ - deleted$/, '');
        agent.isDeleted = false;
        await agent.save();
        res.json({ message: `Agent '${agent.name}' restored` });
    })


    // NEW: Get deleted agents
    exports.getDeletedAgents = asyncHandler(async(req, res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const total = await Agent.countDocuments({isDeleted: true});
    const agents = await Agent.find({isDeleted: true})
        .populate('areas')
        .limit(limit)
        .skip(skip)
        .sort({updatedAt: -1});
    
    res.json({
        agents,
        pagination: {
            page, limit, total,
            pages: Math.ceil(total/limit)
        }
    });
});
