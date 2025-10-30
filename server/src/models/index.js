// Central export for all Mongoose models
const Product = require('./Product');
const Session = require('./Session');
const Reaction = require('./Reaction');
const Question = require('./Question');
const User = require('./User');

module.exports = {
  Product,
  Session,
  Reaction,
  Question,
  User
};