const mongoose = require("mongoose");

const ScoreSchema = mongoose.Schema({
    boardName: {
        type: String,
        required:true
    },
    playerName: {
        type: String,
        required:true
    },
    scores: {
        type: Number,
        required:true
    },
    date: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model("Scores", ScoreSchema);