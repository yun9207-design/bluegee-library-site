'use strict';
// Vercel's /api directory adds one server function to the existing static build.
module.exports = require('../server/guide-handler.cjs').createGuideHandler();
