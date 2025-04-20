import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { fromInstanceMetadata, fromIni, fromEnv } from '@aws-sdk/credential-providers';

export class DynamoDBBaseRepository {

    protected tableName: string;
    protected pixivUserIdIndexName: string;
    protected vrchatUserIdIndexName: string;
    protected client: DynamoDBClient;
    protected documentClient: DynamoDBDocumentClient;

    constructor(
        tableName: string,
        pixivUserIdIndexName: string = "pixivUserId-index",
        vrchatUserIdIndexName: string = "vrchatUserId-index",
        region: string = process.env.AWS_REGION || "ap-northeast-1"
    ) {
        this.tableName = tableName;
        this.pixivUserIdIndexName = pixivUserIdIndexName;
        this.vrchatUserIdIndexName = vrchatUserIdIndexName;
        this.client = new DynamoDBClient({
            credentials: DynamoDBBaseRepository.createAwsCredentials(),
            region
        });
        this.documentClient = DynamoDBDocumentClient.from(this.client);
    }

    static createAwsCredentials = () => {
        if (process.env.AWS_CREDENTIALS_FROM_LOCAL) {
            return fromIni({ profile: process.env.AWS_PROFILE });
        }
        return fromEnv();
    };

}