const mongoose = require('mongoose');

let grammarSchema = new mongoose.Schema({
  title: String,
  mean: String,
  use: String,
  explain: String,
  examples: [{ ja: String, vi: String }],
  // titleKana: String,
})

let Grammar = mongoose.model('Grammar', grammarSchema);

module.exports = Grammar;
