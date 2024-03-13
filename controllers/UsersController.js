const dbClient = require('../utils/db');
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

    const user = await dbClient.db.collection('users').findOne({ email });
    if (user) {
      res.status(400).send({ error: 'Already exist' });
      return;
    }

    const newUser = await dbClient.db.collection('users').insertOne({
      email,
      password: sha1(password),
    });

    res.status(201).send({ id: newUser.insertedId, email });
  }
}

module.exports = UsersController;
