# IRIS

### Description

CDN/Media Server infrastructure with the capability of resizing images on the fly. Built using the
[Serverless Framework](https://serverless.com/).


### Usage

There are essentially five different types of URLs you can build to create your dynamically sized images:

| Type                 | URL                            |
| -------------------- | ------------------------------ |
| Original             | /path/to/image.jpg             |
| Rectangle            | /300x250/path/to/image.jpg     |
| Rectangle w/ command | /300x250@max/path/to/image.jpg |
| Square               | /300/path/to/image.jpg         |
| Square w/ command    | /300@max/path/to/image.jpg     |

**Anatomy of the URL**

`/{width}x{height}@{command}/{path_to_original_image}`

**Valid commands**

| Command | Description |   |
| ------- | ----------- | - |
| `max`   | Preserving aspect ratio, resize the image to be as large as possible while ensuring its dimensions are less than or equal to the `width` and `height` specified.    | [Sharp documentation on `max`](http://sharp.dimens.io/en/stable/api-resize/#max) |
| `min`   | Preserving aspect ratio, resize the image to be as small as possible while ensuring its dimensions are greater than or equal to the `width` and `height` specified. | [Sharp documentation on `min`](http://sharp.dimens.io/en/stable/api-resize/#min) |

**Limitations**

- `width` must be less than or equal to 1920
- `height` must be less than or equal to 1080
- Decimals are not allowed in the `height` and `width`


### Requirements

- [Node](https://nodejs.org/en/)
- [Serverless](https://serverless.com/)
- [Docker](https://docs.docker.com/engine/installation/)

**Important:** Be sure to set up proper [AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/) 
on your machine, otherwise the Serverless deploy commands will fail.


### Setup

**1. Build the Lambda function**

The Lambda function uses sharp for image resizing which requires native extensions. In order to run on Lambda, it must
be packaged on Amazon Linux. We will use Docker to download Amazon Linux, install Node.js and developer tools, and build
the extensions.

Run `make dist`

**2. Provision AWS infrastructure with Serverless**

The Serverless Framework was designed to provision your AWS Lambda Functions, Events and infrastructure Resources safely
and quickly. This will take several minutes. Don't worry if it seems to hang, particularly during the Cloudfront setup.

Run `serverless deploy -v`

**That's it!**

We now have all of our AWS infrastructure in place for our media server, and the first version of the Resize Image
function deployed.

**Deploying changes to Lambda functions**

The majority of deployments will be in maintaining the functions deployed to Lambda. Whenever changes are made to files
inside of the `./lambda` directory, we will need to repackage and deploy the changes.

This can be done by running the following commands:

1. `make dist`
1. `serverless deploy --package -v`


### Serverless CLI Reference

https://serverless.com/framework/docs/providers/aws/cli-reference/


### Quick Reference

**Deploy to production**

`serverless deploy --stage production -v`

For more, see [Serverless CLI documentation for `deploy`](https://serverless.com/framework/docs/providers/aws/cli-reference/deploy/)

**Remove provisioned infrastructure**

`serverless remove -v`

For more, see [Serverless CLI documentation for `remove`](https://serverless.com/framework/docs/providers/aws/cli-reference/remove/)


### AWS Services Used

- Amazon API Gateway
- Amazon Cloudfront
- Amazon S3
- AWS Lambda 

Coming soon:

- AWS Certificate Manager w/ custom domain name

**Notes**

- The `-v` flag on the Serverless commands enables verbose mode, and isn't strictly necessary
