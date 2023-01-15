const mongoose = require("mongoose");

const StatisticsSchema = mongoose.Schema({
    eventName: {
        type: String,
        required: true,
    },
    playerName: {
        type:String,
        required:true,
    },
    date: {
        type: String,
        default: Date.now,
    },
    data: {
        type: String, 
    },
    override: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model("Statistics", StatisticsSchema);