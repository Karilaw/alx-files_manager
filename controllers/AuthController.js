const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');

class AuthController {
  static async getConnect(req, res) {
    const auth = req.headers.authorization;
    const [email, password] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');

    const user = await dbClient.db.collection('users').findOne({ email, password: sha1(password) });
    if (!user) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 86400);

    res.status(200).send({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    await redisClient.del(`auth_${token}`);
    res.status(204).send();
  }
}

module.exports = AuthController;
