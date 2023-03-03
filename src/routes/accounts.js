/* eslint-disable consistent-return */
const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.param('id', async (req, res, next) => {
    const result = await app.services.accounts.find({ id: req.params.id });
    if (result.user_id !== req.user.id) {
      return res.status(403).json({ message: 'not authorized' });
    } next();
  });
  router.post('/', async (req, res, next) => {
    try {
      // o passport cria o objeto user?
      const result = await app.services.accounts.save({ ...req.body, user_id: req.user.id });

      res.status(201).json(result);
    } catch (err) {
      console.log(err);
      next(err);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      const result = await app.services.accounts.findAll({ user_id: req.user.id });

      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const result = await app.services.accounts.find({ id: req.params.id });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const result = await app.services.accounts.update(req.params.id, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const result = await app.services.accounts.remove(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });
  return router;
};
