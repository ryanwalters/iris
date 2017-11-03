'use strict';

const AWS = require('aws-sdk');
const sharp = require('sharp');

const S3 = new AWS.S3({ signatureVersion: 'v4' });

module.exports.resizeImage = (event, context, callback) => {
  const BUCKET = process.env.BUCKET;
  const URL = process.env.URL;
  const CDN_URL = process.env.CDN_URL;

  const key = event.queryStringParameters.key;
  const match = key.match(/(\d+)x(\d+)\/(.*)/);
  const height = parseInt(match[1]);
  const width = parseInt(match[2]);
  const imagePath = match[3];

  console.log('started');

  S3.getObject({ Bucket: BUCKET, Key: imagePath })
    .promise()
    .then(data => {
      console.log('fetched image, transforming');

      return sharp(data.Body)
        .resize(width, height)
        .crop(sharp.strategy.attention)
        .toFormat('jpg')
        .toBuffer()
    })
    .then(buffer => {
      console.log('transformed');

      return S3.putObject({
        ACL: 'public-read',
        Body: buffer,
        Bucket: BUCKET,
        CacheControl: 'public, max-age=31536000',
        ContentType: 'image/jpg',
        Key: key,
      }).promise();
    })
    .then(() => {
      console.log('object uploaded:', key);

      return callback(null, {
        statusCode: '301',
        headers: {
          Location: `${URL}/${key}`,
        },
        body: '',
      });
    })
    .catch(err => callback(err));
};
