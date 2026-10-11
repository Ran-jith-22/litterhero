import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN;

// Determine if actual AWS credentials are provided
export const isAwsConfigured = Boolean(
  (accessKeyId && secretAccessKey) || process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI || process.env.AWS_EXECUTION_ENV
);

export const awsConfig = {
  region,
  isAwsConfigured,
  s3BucketName: process.env.S3_BUCKET_NAME || 'litterhero-evidence-media',
  reportsTableName: process.env.DYNAMODB_TABLE_REPORTS || 'LitterHero_Reports',
  missionsTableName: process.env.DYNAMODB_TABLE_MISSIONS || 'LitterHero_Missions',
  usersTableName: process.env.DYNAMODB_TABLE_USERS || 'LitterHero_Users'
};

let ddbDocClient = null;
let s3ClientInstance = null;

if (isAwsConfigured) {
  try {
    const ddbClient = new DynamoDBClient({
      region,
      ...(accessKeyId && secretAccessKey ? {
        credentials: {
          accessKeyId,
          secretAccessKey,
          ...(sessionToken ? { sessionToken } : {})
        }
      } : {})
    });

    ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
      marshallOptions: { removeUndefinedValues: true }
    });

    s3ClientInstance = new S3Client({
      region,
      ...(accessKeyId && secretAccessKey ? {
        credentials: {
          accessKeyId,
          secretAccessKey,
          ...(sessionToken ? { sessionToken } : {})
        }
      } : {})
    });

    console.log(`[AWS Config] Real AWS SDK connected. Region: ${region}`);
  } catch (err) {
    console.warn('[AWS Config] Error initializing AWS SDK, falling back to local storage:', err.message);
  }
} else {
  console.log('[AWS Config] No active AWS credentials found in environment. Running in high-fidelity Local Persistent Mode.');
}

export { ddbDocClient, s3ClientInstance };
