const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  round1: { type: Number, default: 0 },
  round2: { type: Number, default: 0 },
  round3: { type: Number, default: 0 },
});

MemberSchema.virtual("total").get(function () {
  return this.round1 + this.round2 + this.round3;
});

module.exports = mongoose.model("Member", MemberSchema);
