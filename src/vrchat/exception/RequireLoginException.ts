


export class RequireLoginException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RequireLoginException";
    }
}