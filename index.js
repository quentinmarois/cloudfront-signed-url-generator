const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const { CloudFront } = require("@aws-sdk/client-cloudfront");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const readline = require("readline");
require("dotenv").config();

const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const REGION = process.env.REGION;
const CF_ENDPOINT = process.env.CF_ENDPOINT;
const CF_KEY_PAIR_ID = process.env.CF_KEY_PAIR_ID;
const CF_PRIVATE_KEY = process.env.CF_PRIVATE_KEY;
const BUCKET_NAME = process.env.BUCKET_NAME;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function promptUser (question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function doesFileExist (fileKey) {
  const s3 = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
  };

  try {
    await s3.send(new GetObjectCommand(params));
    return true;
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      return false;
    }
  }
}

async function generateSignedUrl () {
  try {
    const file = await promptUser('Enter file name: ');

    const fileExist = await doesFileExist(file);
    if (fileExist) {

      const duration = parseInt(await promptUser('Enter duration in seconds: '));
      const timeout = new Date(Date.now() + duration * 1000);

      const cfClient = new CloudFront({
        region: REGION,
        credentials: {
          accessKeyId: ACCESS_KEY_ID,
          secretAccessKey: SECRET_ACCESS_KEY,
        },
      });

      const signedUrl = getSignedUrl({
        cfClient,
        url: `${CF_ENDPOINT}/${file}`,
        dateLessThan: new Date(Date.now() + timeout * 1000),
        keyPairId: CF_KEY_PAIR_ID,
        privateKey: CF_PRIVATE_KEY,
      });

      console.log('Signed URL: ', signedUrl, '\n');
      console.log('Expires in ', duration, ' seconds at ', timeout)
      process.exit(0);
    } else {
      console.log('File does not exist');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error generating signed URL: ', error.message || error);
  }
}

generateSignedUrl();
