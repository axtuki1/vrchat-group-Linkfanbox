const mysql = require('mysql2/promise');

export class MySQLBaseRepository {

    protected connection;
    protected host: string;
    protected user: string;
    protected password: string;
    protected database: string;
    protected port: number;

    constructor(
        host: string,
        user: string,
        password: string,
        database: string,
        port: number
    ) {
        this.host = host;
        this.user = user;
        this.password = password;
        this.database = database;
        this.port = port;
        this.connection = mysql.createPool({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.database,
            port: this.port,
            namedPlaceholders: true,
        });
    }

    public async createTable(): Promise<void> {
        const createTableQuery = `CREATE TABLE IF NOT EXISTS userTable (
	        userId UUID NOT NULL,
	        pixivUserId TEXT NULL,
	        vrchatUserId TEXT NULL,
	        vrchatUserName LONGTEXT NULL,
            fanboxPlanId TEXT NULL,
	        createAt DATETIME NOT NULL DEFAULT NOW(),
	        updateAt DATETIME NOT NULL,
	        PRIMARY KEY (userId),
	        UNIQUE INDEX userId (userId)
        );`;
        return new Promise((resolve, reject) => {
            this.connection.query(createTableQuery, (err, results) => {
                if (err) {
                    reject(new Error(`Error creating table: ${err.message}`));
                } else {
                    resolve();
                }
            });
        });
    }


}