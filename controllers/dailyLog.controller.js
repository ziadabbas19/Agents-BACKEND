const asyncHandler = require('express-async-handler');
const DailyLog = require('../models/dailyLog.model');
const Agent = require('../models/agent.model')

// @desc    إنشاء تسجيل توزيع يومي جديد
// @route   POST /api/dailylog
// @access  Admin
exports.createDailyLog = asyncHandler(async(req, res)=>{


    const {date, totalPackages, agents} = req.body;

    // تأكد من عدم وجود تسجيل لنفس اليوم
    const existing = await DailyLog.findOne({date: new Date(date).setHours(0, 0, 0, 0)})
    if(existing){
        res.status(400);
        throw new Error('this day is already exists');
    }

    const populateAgents = [];

    for(const agentEntry of agents){
        const agent = await Agent.findOne({name:agentEntry.code});
        if(!agent){
            res.status(400);
            throw new Error(`المندوب '${agentEntry.name}' غير موجود`)
        }

        populateAgents.push({
            agent:agent._id,
            lines: agentEntry.lines
        })
    }

    const log = await DailyLog.create({
        date: new Date(date).setHours(0, 0, 0, 0),
        totalPackages,
        agents: populateAgents
    });

    res.status(201).json(log);
    
})


// @desc    عرض بيانات يوم معين
// @route   GET /api/dailylog/:date
// @access  Admin
exports.getDailyLogByDate = asyncHandler(async(req,res)=>{
    const {date} = req.params;

    const log = await DailyLog.findOne({date: new Date(date).setHours(0,0,0,0)})
    .populate('agents.agent')
    .populate('agents.lines.area');
    
    if(!log){
        res.status(404)
        throw new Error('التاريخ مش موجود')
    }

    //calculat percentage
    const agentSwitchState =  log.agents.map((agentEntry)=>{
        const totalAssigned =  agentEntry.lines.reduce((acc,  line)=> acc + (line.assignedCount ||  0), 0);
        const totalDelivered = agentEntry.lines.reduce((acc, line) => acc + (line.deliveredCount || 0), 0);
        const successRate = totalAssigned > 0 ? ((totalDelivered / totalAssigned) * 100).toFixed(2) : '0.00';

        return{
            _id:log._id,
            date: log.date,
            agent: agentEntry.agent,
            lines: agentEntry.lines, totalAssigned, totalDelivered,
            successRate   : `${successRate}`
        };
    });

    res.json({
        date: log.date,
        totalPackages: log.totalPackages,
        agent: agentSwitchState
    })
})

// @desc    تعديل بيانات يوم معين
// @route   PUT /api/dailylog/:id
// @access  Admin
exports.updateDailyLog =  asyncHandler(async(req,res)=>{
    const {id}  = req.params;

    const updated = await DailyLog.findByIdAndUpdate(id, req.body,{new:true, runValidators:true});

    if(!updated){
        res.status(404);
        throw new Error('مش موجود في السجل')
    }

    res.json(updated)
});

// @desc    Get all agents (name & code only) for dropdown
// @route   GET /api/agents/list
// @access  Protected
exports.getAgentsList = asyncHandler(async (req, res) => {
    const agents = await Agent.find({ isDeleted: false }).select('name code');
    res.json(agents);
});