const express = require('express');
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt');

const secret = 'secret';

module.exports = (app) => {
  const router = express.Router();

  router.post('/signin', (req, res, next) => {
    app.services.user.findOne({ email: req.body.email })
      .then((result) => {
        if (bcrypt.compareSync(req.body.password, result.password)) {
          const payload = {
            id: result.id,
            name: result.name,
          };
          const token = jwt.encode(payload, secret);
          res.status(200).json({ token });
        } else throw new ForbiddenError('Invalid password');
      }).catch((err) => {
        next(err);
      });
  });

  router.post('/signup', async (req, res, next) => {
    try {
      const result = await app.services.user.save(req.body);
      res.status(201).json(result[0]);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
