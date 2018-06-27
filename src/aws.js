import AWS from "aws-sdk";
import { bucket } from "./config";

// const credentials = new AWS.CognitoIdentityCredentials({
//   IdentityPoolId: "IDENTITY_POOL_ID"
// });
// var config = new AWS.Config({
//   credentials: myCredentials,
//   region: "us-west-2"
// });

const s3 = new AWS.S3();

const put = (image, filename) => {
  const params = {
    Bucket: bucket,
    Key: filename,
    Body: image
  };

  return s3.upload(params).promise();
};

export default { put };
