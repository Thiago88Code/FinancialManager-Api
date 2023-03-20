/* eslint-disable consistent-return */
const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.param('id', async (req, res, next) => {
    const result = await app.services.transfer.find({ id: req.params.id });
    if (result.user_id !== req.user.id) {
      return res.status(403).json({ message: 'not authorized' });
    } next();
  });
  router.get('/', async (req, res, next) => {
    try {
      const response = await app.services.transfer.findAll({ user_id: req.user.id });
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const response = await app.services.transfer.find({ id: req.params.id });
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      if (req.user.id === req.body.user_id) {
        const response = await app.services.transfer.save(req.body);
        res.status(201).json(response);
        // console.log(response);
      }
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const response = await app.services.transfer.update(req.params.id, req.body);
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const result = await app.services.transfer.remove(req.params.id);
      res.status(204).json(result);
    } catch (err) {
      next(err);
    }
  });
  return router;
};
