export {};


declare global {
  namespace Express {
    interface Request {
      token :any
    }
  }
}
