const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const { CloudFront } = require("@aws-sdk/client-cloudfront");
require("dotenv").config();

const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const REGION = process.env.REGION;
const CF_ENDPOINT = process.env.CF_ENDPOINT;
const CF_KEY_PAIR_ID = process.env.CF_KEY_PAIR_ID;
const CF_PRIVATE_KEY = process.env.CF_PRIVATE_KEY;

async function generateSignedUrl () {
  const file = "test.txt";
  const timeout = 60 * 10; // 10 minutes

  const cfClient = new CloudFront({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });

  const signedUrl = await getSignedUrl({
    cfClient,
    url: `${CF_ENDPOINT}/${file}`,
    dateLessThan: new Date(Date.now() + timeout * 1000),
    keyPairId: CF_KEY_PAIR_ID,
    privateKey: CF_PRIVATE_KEY,
  });
  console.log(signedUrl);
}

generateSignedUrl();