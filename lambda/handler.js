'use strict';

const AWS = require('aws-sdk');
const sharp = require('sharp');
const S3 = new AWS.S3({ signatureVersion: 'v4' });



/**
 * Determine if the given command is on the list of allowed sharp commands
 *
 * @param {String} command
 * @returns {boolean}
 */

function isValidCommand(command) {
  return ['max', 'min'].indexOf(command) !== -1;
}


/**
 * The resize function to be deployed to Lambda
 *
 * @param {Object}    event
 * @param {Object}    context
 * @param {Function}  callback
 * @returns {*}
 */

module.exports.resizeImage = (event, context, callback) => {
  const BUCKET = process.env.BUCKET;
  const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;

  const key = event.queryStringParameters.key;
  const rectangle = key.match(/(\d+)x(\d+)\/(.*)/);
  const rectangleWithCommand = key.match(/(\d+)x(\d+)@(.*)\/(.*)/);
  const square = key.match(/(\d+)\/(.*)/);
  const squareWithCommand = key.match(/(\d+)@(.*)\/(.*)/);

  let height;
  let width;
  let imagePath;
  let command;


  // 100x100/path/to/image

  if (Array.isArray(rectangle)) {
    width = parseInt(rectangle[1]);
    height = parseInt(rectangle[2]);
    imagePath = rectangle[3];
  }


  // 100x100@max/path/to/image

  else if (Array.isArray(rectangleWithCommand)) {
    width = parseInt(rectangleWithCommand[1]);
    height = parseInt(rectangleWithCommand[2]);
    command = rectangleWithCommand[3];
    imagePath = rectangleWithCommand[4];


    // Make sure command is valid...

    if (!isValidCommand(command)) {
      return callback('Invalid command:', command);
    }
  }


  // 100/path/to/image

  else if (Array.isArray(square)) {
    width = parseInt(square[1]);
    height = width;
    imagePath = square[2];
  }


  // 100@max/path/to/image

  else if (Array.isArray(squareWithCommand)) {
    width = parseInt(squareWithCommand[1]);
    height = width;
    command = squareWithCommand[2];
    imagePath = squareWithCommand[3];


    // Make sure command is valid...

    if (!isValidCommand(command)) {
      return callback('Invalid command:', command);
    }
  }


  // No match...

  else {
    return callback('Invalid key:', key);
  }


  // Key matched, continue resize procedure

  S3.getObject({ Bucket: BUCKET, Key: imagePath })
    .promise()
    .then(data => {
      const resizedImage = sharp(data.Body).resize(width, height);


      // Run command or default to crop

      if (!!command) {
        resizedImage[command]();
      }

      else {
        resizedImage.crop(sharp.strategy.attention);
      }

      return resizedImage
        .toFormat('jpg')
        .toBuffer()
    })


    // Write the new, resized image back to S3

    .then(buffer => S3.putObject({
        ACL: 'public-read',
        Body: buffer,
        Bucket: BUCKET,
        CacheControl: 'public, max-age=31536000',
        ContentType: 'image/jpg',
        Key: key,
      }).promise()
    )


    // Return a permanent redirect, pointing to the new Cloudfront location

    .then(() => callback(null, {
        statusCode: '301',
        headers: {
          Location: `${CLOUDFRONT_URL}/${key}`,
        },
        body: '',
      })
    )
    .catch(err => callback(err));
};
