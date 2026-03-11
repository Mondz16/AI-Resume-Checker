
class APIResponse {
    constructor(status,data,message= "Success"){
        this.status = status;
        this.data = data;
        this.message = message;
    }
}

export {APIResponse}