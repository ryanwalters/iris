'use strict';

module.exports.resizeImage = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'resize image',
      input: event,
    }),
  };

  callback(null, response);
};
