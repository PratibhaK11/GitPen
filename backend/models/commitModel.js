const mongoose = require("mongoose");

const commitSchema = new mongoose.Schema({
  repo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repository",
    required: true
  },
  message: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  author: {
    type: String,
    required: true
  }
});

const Commit = mongoose.model("Commit", commitSchema);

module.exports = Commit;
