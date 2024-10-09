const express = require('express');
const router = express.Router();

/**
 * 活动列表
 */
router.get('/list', function(req, res, next) {
  res.render('index', { title: 'list' });
});

module.exports = router;
