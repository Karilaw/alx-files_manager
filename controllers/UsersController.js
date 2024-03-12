const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const sha1 = require('sha1');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(400).send({ error: 'Missing email' });
      return;
    }

    if (!password) {
      res.status(400).send({ error: 'Missing password' });
      return;
    }

    const user = await dbClient.users.findOne({ email });
    if (user) {
      res.status(400).send({ error: 'Already exist' });
      return;
    }

    const newUser = await dbClient.users.insertOne({
      email,
      password: sha1(password),
    });

    res.status(201).send({ id: newUser.insertedId, email });
  }
}

module.exports = UsersController;
