import { Request, Response, NextFunction } from 'express';

// Error object used in error handling middleware function
 export class AppError extends Error{
    statusCode: number;

    constructor(statusCode: number, message: string) {
      super(message);
  
      Object.setPrototypeOf(this, new.target.prototype);
      this.name = Error.name;
      this.statusCode = statusCode;
      Error.captureStackTrace(this);
    }
}

// Middleware function for logging the request method and request URL
export const requestLogger = (
    request: Request, 
    response: Response, 
    next: NextFunction) => {

      console.log(`${request.method} url:: ${request.url}`);
      next()
  }

  // Error handling Middleware function for logging the error message
  export const errorLogger = (
    error: Error, 
    request: Request, 
    response: Response, 
    next: NextFunction
  ) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Error: ${error.message}`);
    if (process.env.NODE_ENV === 'development' && error.stack) {
      console.error(`[${timestamp}] Stack Trace: ${error.stack}`);
    }
    next(error); // Calling next middleware
  }

 // Error handling Middleware function reads the error message 
  // and sends back a response in JSON format  
  export const errorResponder = (
    error: AppError, 
    request: Request, 
    response: Response, 
    next: NextFunction) => {
        response.header("Content-Type", 'application/json')
          
        const status = error.statusCode || 400;
        const message = error.message  || `something went wrong`;
        response.status(status).json({error :{
            status,
            message
        }})
  }

  // Fallback Middleware function for returning 
  // 404 error for undefined paths
  export const invalidPathHandler = (
    request: Request, 
    response: Response, 
    next: NextFunction) => {
      response.status(404)
      response.send({error :{
        "status":404,
        "message":'Invalid path'
    }})
  }

