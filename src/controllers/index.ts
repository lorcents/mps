/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import fs from "fs";
import { type NextFunction } from "express";
import type express from "express";
import { PrismaClient } from "@prisma/client";

import { StkService } from "../services/stk.service";
import { AuthSercice } from "../services/auth.service";

const prisma = new PrismaClient();

export const controllers = {
  index: (req: express.Request, res: express.Response) => {
    res.send("Hello there");
  },

  token: async (
    req: express.Request,
    res: express.Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const result = await AuthSercice.getAccessToken();
      const token = result;
      res.json(token);
    } catch (error) {
      next(error);
    }
  },
  stkRoute: async (
    req: express.Request,
    res: express.Response,
    next: NextFunction
  ): Promise<any> => {
    const data = req.body;
    try {
      const stkres = await StkService.pushStk(data);
      res.json(stkres);
    } catch (error) {
      next(error);
    }
  },
  queryRoute: async (
    req: express.Request,
    res: express.Response,
    next: NextFunction
  ): Promise<any> => {
    const { CheckoutRequestID } = req.body;
    try {
      const queryRes = await StkService.queryStk(CheckoutRequestID);
      res.json(queryRes);
    } catch (error) {
      next(error);
    }
  },

  callbackURl: async (
    req: express.Request,
    res: express.Response
  ): Promise<any> => {
    const stkCallback = req.body.Body.stkCallback;
    const ResultCode = stkCallback.ResultCode;
    // const MerchantRequestID = stkCallback.MerchantRequestID
    const CheckoutRequestID = stkCallback.CheckoutRequestID;
    const ResultDesc = stkCallback.ResultDesc;

    if (ResultCode === 0) {
      const amount = stkCallback.CallbackMetadata.Item[0].Value;
      const mpesaReceiptNumber = stkCallback.CallbackMetadata.Item[1].Value;
      const transactionDate =
        stkCallback.CallbackMetadata.Item[3].Value.toString();
      const phoneNumber = stkCallback.CallbackMetadata.Item[4].Value.toString();

      try {
        await prisma.callbackRes.create({
          data: {
            stkRes: { connect: { checkoutRequestID: CheckoutRequestID } },
            resultCode: ResultCode,
            resultDesc: ResultDesc,
            mpesaReceiptNumber,
            amount,
            phoneNumber,
            transactionDate,
          },
        });
      } catch (err: any) {
        console.log(err.message);
      }
    } else {
      try {
        await prisma.callbackRes.create({
          data: {
            stkRes: { connect: { checkoutRequestID: CheckoutRequestID } },
            resultCode: ResultCode,
            resultDesc: ResultDesc,
          },
        });
      } catch (err: any) {
        console.log(err.message);
      }
    }

    // Convert the response to a string
    const responseString = JSON.stringify(stkCallback) + "\r\n";

    // Write the response string to a file
    fs.appendFile("response.txt", responseString, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Response successfully written to file");
      }
    });
  },
};
