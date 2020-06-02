# asad-lab1

> ASAD project (Roulette)

## Requirements

NodeJS
npm

## INSTALLATION + RUN

1. git clone https://github.com/qathom/asad-lab1.git
2. cd backend
3. npm install
4. cp .env.example .env
5. npm run start:dev
6. Open http://localhost:3000

## Deployment (with serverless)

The following guide will help you to install Serverless Framework and deploy the app on AWS.
The deployment requires API Gateway, a Lambda function and a S3 bucket.

1. Install serverless framework by running: `npm install -g serverless`
2. Configure your [AWS settings](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/) by running `serverless`
3. Run `sls deploy` from the root of this project
