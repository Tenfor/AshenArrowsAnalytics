const mongoose = require("mongoose");

const ScoreSchema = mongoose.Schema({
    boardName: {
        type: String,
        required:true
    },
    realmName: {
        type: String,
        required:true
    },
    mapName: {
        type: String,
        required:true
    },
    mapId: {
        type: String,
        required:false
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
        type: Number,
        required: true
    },
    playerNumber: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Scores", ScoreSchema);