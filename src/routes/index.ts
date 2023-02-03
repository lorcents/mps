import express, { Router } from "express";
const route = express.Router();
import { controllers } from "../controllers";

route.get("/", controllers.index);
route.post("/stk", controllers.stkRoute);
route.post("/query", controllers.queryRoute);

route.get("/token", controllers.token);

route.post("/callback", controllers.callbackURl);

export default route;
