class APIError extends Error {
    constructor(status, message = "Something went wrong!", errors = [], stack = ""){
        super(message);
        this.status = status;
        this.data = data;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {APIError}