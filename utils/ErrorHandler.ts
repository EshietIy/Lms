class ErrorHandler extends Error {
    statusCode: Number;

    constructor(message:any, statusCode:Number){
        super(message);
        this.statusCode = statusCode; 

        // the captureStackTrace is used to caputre the stack trace of the current object that caused the error
        Error.captureStackTrace(this, this.constructor);
    }
}

// module.export: is used when there are other things to export out
// unlike the export default that allows only one iteam to be exported from the module 
export default ErrorHandler;