


export class LoginFailureException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "LoginFailureException";
    }
}