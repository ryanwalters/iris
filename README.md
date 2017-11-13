# IRIS

### Description

Media server and image resizing service

### Requirements

- [Node](https://nodejs.org/en/)
- [Serverless](https://serverless.com/)
- [Docker](https://docs.docker.com/engine/installation/)

### Usage

**1. Build the Lambda function**

The Lambda function uses sharp for image resizing which requires native extensions. In order to run on Lambda, it must
be packaged on Amazon Linux. We will use Docker to download Amazon Linux, install Node.js and developer tools, and build
the extensions.

Run `make dist`

**2. Provision AWS infrastructure with Serverless**

The Serverless Framework was designed to provision your AWS Lambda Functions, Events and infrastructure Resources safely
and quickly. This will take several minutes. Don't worry if it seems to hang, particularly during the Cloudfront setup.

Run `sls deploy -v`

#### That's it!

We now have all of our AWS infrastructure in place for our media server, and the first version of the Resize Image
function deployed.

##### Deploying changes to Lambda functions

The majority of deployments will be in maintaining the functions deployed to Lambda. Whenever changes are made to files
inside of the `./lambda` directory, we will need to repackage and deploy the changes.

This can be done by running the following commands:

1. `make dist`
1. `sls deploy --package -v`
