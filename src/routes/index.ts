/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { controllers } from "../controllers";
const route = express.Router();

route.get("/", controllers.index);
route.post("/stk", controllers.stkRoute);
route.post("/query", controllers.queryRoute);

route.get("/token", controllers.token);

route.post("/callback", controllers.callbackURl);

export default route;
