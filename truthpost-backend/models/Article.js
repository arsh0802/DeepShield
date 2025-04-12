const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    mediaUrl: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
    analysisResults: {
        text: {
            label: String,
            confidence: Number,
            details: mongoose.Schema.Types.Mixed
        },
        media: {
            label: String,
            confidence: Number,
            details: mongoose.Schema.Types.Mixed
        }
    }
});

module.exports = mongoose.model("Article", ArticleSchema);
