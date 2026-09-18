const mongoose = require("mongoose");

const stateCitySchema = new mongoose.Schema(
  {
    state: { type: String, trim: true },
    state_name: { type: String, trim: true },
    name: { type: String, trim: true },
    state_key: { type: String, trim: true },
    key: { type: String, trim: true },
    cities: [{ type: String, trim: true }],
    city: { type: String, trim: true },
  },
  {
    collection: "statecities",
    strict: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("StateCity", stateCitySchema);
