// Route aggregators used by server.js
const productRoutes = require('./productRoutes');
const sessionRoutes = require('./sessionRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const authRoutes = require('./authRoutes');

module.exports = {
  productRoutes,
  sessionRoutes,
  analyticsRoutes,
  authRoutes
};