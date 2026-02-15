const mongoose = require('mongoose');



const dailyLogSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: () => new Date().setHours(0, 0, 0, 0)
    },
    totalPackages: {
        type: Number,
        required: true
    },
    agents: [
        {
            agent: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Agent',
                required: true
            },
            lines: [
                {
                    area: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Area',
                        required: true
                    },
                    assignedCount: Number,
                    deliveredCount: Number,
                    returnedCount: Number
                }
            ]
        }
    ]
}, { timestamps: true });

module.exports = mongoose.models.DailyLog || mongoose.model('DailyLog', dailyLogSchema);