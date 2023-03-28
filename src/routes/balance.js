const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const result = await app.services.balance.getBalance(req.user.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });
  return router;
};
