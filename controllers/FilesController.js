const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const Queue = require('bull');
const fileQueue = new Queue('fileQueue');

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const { name, type, isPublic, data, parentId } = req.body;

    if (!name) {
      res.status(400).send({ error: 'Missing name' });
      return;
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      res.status(400).send({ error: 'Missing type' });
      return;
    }

    if (type !== 'folder' && !data) {
      res.status(400).send({ error: 'Missing data' });
      return;
    }

    if (parentId) {
      const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parentFile) {
        res.status(400).send({ error: 'Parent not found' });
        return;
      }
      if (parentFile.type !== 'folder') {
        res.status(400).send({ error: 'Parent is not a folder' });
        return;
      }
    }

    const fileData = {
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
    };

    if (type === 'folder') {
      const newFolder = await dbClient.db.collection('files').insertOne(fileData);
      res.status(201).send({ id: newFolder.insertedId, ...fileData });
    } else {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const localPath = path.join(folderPath, uuidv4());
      fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
      fileData.localPath = localPath;

      const newFile = await dbClient.db.collection('files').insertOne(fileData);
      res.status(201).send({ id: newFile.insertedId, ...fileData });

      if (type === 'image') {
        fileQueue.add({ userId, fileId: newFile.insertedId });
      }
    }
  }
}

module.exports = FilesController;
