const mongoose = require("mongoose");

const GuidSchema = mongoose.Schema({
    guid: {
        type: String,
        required:true
    },
    playerName: {
        type: String,
        required:true
    }
});

module.exports = mongoose.model("Guid", GuidSchema);