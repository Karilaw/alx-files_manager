const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');
const dbClient = require('./utils/db');
const fs = require('fs');
const path = require('path');

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId });

  if (!file) {
    throw new Error('File not found');
  }

  const options = { width: 500 };
  const thumbnail500 = await imageThumbnail(file.localPath, options);
  fs.writeFileSync(`${file.localPath}_500`, thumbnail500);

  options.width = 250;
  const thumbnail250 = await imageThumbnail(file.localPath, options);
  fs.writeFileSync(`${file.localPath}_250`, thumbnail250);

  options.width = 100;
  const thumbnail100 = await imageThumbnail(file.localPath, options);
  fs.writeFileSync(`${file.localPath}_100`, thumbnail100);
});
