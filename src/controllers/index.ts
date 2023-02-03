import fs from "fs";
import axios from "axios";
import express from "express";
import { PrismaClient } from "@prisma/client";

import { StkService } from "../services/stk.service";
import { AuthSercice } from "../services/auth.service";

const prisma = new PrismaClient();

export const controllers = {
  index: (req: express.Request, res: express.Response) => {
    res.send("Hello there");
  },

  token: async (req: express.Request, res: express.Response) => {
    const result = await AuthSercice.getAuth();
    const token = result;
    res.json(token);
  },
  stkRoute: async (req: express.Request, res: express.Response) => {
    const data = req.body;
    const stkres = await StkService.pushStk(data);

    res.json(stkres);
  },
  queryRoute: async (req: express.Request, res: express.Response) => {
    const { CheckoutRequestID } = req.body;
    const queryRes = await StkService.queryStk(CheckoutRequestID);

    res.json(queryRes);
  },

  callbackURl: async (req: express.Request, res: express.Response) => {
    const stkCallback = req.body.Body.stkCallback;
    const ResultCode = stkCallback.ResultCode;
    const MerchantRequestID = stkCallback.MerchantRequestID;
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
            mpesaReceiptNumber: mpesaReceiptNumber,
            amount: amount,
            phoneNumber: phoneNumber,
            transactionDate: transactionDate,
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
