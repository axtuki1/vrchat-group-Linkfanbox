import { Task } from "..";
import { Logger } from "../../util/logger";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from 'google-auth-library'
import * as fs from "fs";
import { GetUserInfoService } from "../../db/services/GetUserInfoService";
import { UserRepositoryFactory } from "../../db/factories/UserRepositoryFactory";
const { parse } = require("jsonc-parser");
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();
const credentials = require("../../../secret/google_credential.json");
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
];

export class GetVRChatLinkInfo extends Task {

    private logger: Logger = new Logger("GetFanboxRelationshipTask");
    private coolTime: number = 1440; // 24 hours
    private nextExecuteTime: Date;
    private repo: GetUserInfoService = null;

    constructor(coolTime: number = 1440, errorHandler: Function = null) {
        super(errorHandler);
        this.coolTime = coolTime;
        this.nextExecuteTime = new Date();
        this.repo = new GetUserInfoService(UserRepositoryFactory.create());
    }

    public async execute(): Promise<void> {

        if (this.nextExecuteTime > new Date()) {
            return;
        }
        this.nextExecuteTime = new Date(new Date().getTime() + this.coolTime * 60 * 1000);
        try {
            const jwt = new JWT({
                email: credentials.client_email,
                key: credentials.private_key,
                scopes: SCOPES,
            });
            const doc = new GoogleSpreadsheet(
                config.settings.spreadsheet.spreadsheetId,
                jwt
            );
            await doc.loadInfo();
            const sourceSheet = doc.sheetsByIndex[0];
            const complateSheet = doc.sheetsByIndex[1];
            const rows = sourceSheet.rowCount;
            if (rows < 2) {
                return;
            }
            await sourceSheet.loadCells(config.settings.spreadsheet.completedRowCountCell);
            const completedRow = sourceSheet.getCellByA1(config.settings.spreadsheet.completedRowCountCell).numberValue;
            await sourceSheet.loadCells('A' + (completedRow+1) + ':H' + (rows + 3));
            // let completedPos = completedRow;
            for (let i = completedRow + 1; i < rows; i++) {
                const range = sourceSheet;
                const pixivUserId = sourceSheet.getCell(i, 1).valueType	== "numberValue" ? sourceSheet.getCell(i, 1).numberValue.toString() : sourceSheet.getCell(i, 1).stringValue;
                const vrchatUserId = sourceSheet.getCell(i, 2).stringValue;
                this.logger.info("Entry found: " + i + " vrchatUserId: " + vrchatUserId + " pixivUserId: " + pixivUserId);
                const user = await this.repo.getUserInfoByPixivId(pixivUserId);

                if (!user) {
                    this.logger.info("User not found: " + pixivUserId);
                    this.repo.registerUser(
                        vrchatUserId,
                        pixivUserId
                    );
                } else {
                    this.logger.info("User found: " + pixivUserId);
                    this.repo.updateUser(
                        user.userId,
                        {
                            vrchatUserId: vrchatUserId,
                            pixivUserId: pixivUserId
                        }
                    );
                }
                sourceSheet.getCell(i, 4).stringValue = "済";
                // completedPos = i;
            }

            // sourceSheet.getCell(0, 7).numberValue = completedPos;
            await sourceSheet.saveUpdatedCells();

        } catch (e) {
            throw e;
        }
    }

}