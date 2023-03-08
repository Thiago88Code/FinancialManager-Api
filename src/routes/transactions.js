/* eslint-disable consistent-return */
const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.param('id', async (req, res, next) => {
    const result = await app.services.transaction.find(req.user.id, { tr_id: req.params.id });

    if (result.length > 0) next();
    else return res.status(403).json({ message: 'not authorized' });
  });

  router.get('/', async (req, res, next) => {
    try {
      const result = await app.services.transaction.find(req.user.id);
      res.status(200).json(result);
      // console.log(result);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const result = await app.services.transaction.save(req.body);
      res.status(201).json(result);
      // console.log(result);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const result = await app.services.transaction.findOne({ tr_id: req.params.id });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const result = await app.services.transaction.update(req.params.id, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const result = await app.services.transaction.remove(req.params.id);
      res.status(204).json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
