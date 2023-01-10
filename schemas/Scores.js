const mongoose = require("mongoose");

const ScoreSchema = mongoose.Schema({
    boardId: {
        type: String,
        required:true
    },
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
        default: Date.now,
    },
});

module.exports = mongoose.model("Scores", ScoreSchema);