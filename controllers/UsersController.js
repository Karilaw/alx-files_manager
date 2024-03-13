const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const sha1 = require('sha1');

class UsersController {
  static async postNew(req, res) {
    // ...existing code...

  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
    res.status(200).send({ id: user._id.toString(), email: user.email });
  }
}

module.exports = UsersController;
