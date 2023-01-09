const mongoose = require("mongoose");

const StatsSchema = mongoose.Schema({
    waveName: {
        type: String,
        required: true,
    },
    remainingHp: {
        type:Number,
        required:true,
    },
    date: {
        type: String,
        default: Date.now,
    },
});

module.exports = mongoose.model("Stats", StatsSchema);