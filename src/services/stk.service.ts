/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import fs from "fs";
import axios from "axios";
import to from "await-to-js";
import { PrismaClient } from "@prisma/client";

import { AuthSercice } from "./auth.service";
import { timestampFn } from "../util";
import { url, config } from "../config";
import { ngrokUrl } from "../app";
import { Result } from "../util/types";

const prisma = new PrismaClient();

interface stkData {
  phoneNumber: string;
  amount: number;
}

// interface queryData {}

export abstract class StkService {
  static async pushStk(data: stkData): Promise<any> {
    if (data.phoneNumber == null || data.phoneNumber.length !== 10)
      throw new Error("Please provide a valid phone Number");
    if (data.amount == null || data.amount < 1)
      throw new Error("Please provide a valid  amount");
    const phoneNumber = data.phoneNumber.substring(1);
    const amount = data.amount;

    const stkUrl = url.stkUrl;
    // const CallBackURL = url.CallBackURL!;
    const callBackUrI = await ngrokUrl;
    console.log(`${callBackUrI}/callback`);

    const shortCode = config.shortcode;
    const passKey = config.passkey;

    const timeStamp = timestampFn();

    const buffer = Buffer.from(shortCode + passKey + timeStamp);
    const password = buffer.toString("base64");

    // Token
    const token = await AuthSercice.getAccessToken();

    const auth = `Bearer ${token}`;

    let err, stkRes;

    [err, stkRes] = await to(
      axios.post(
        stkUrl,
        {
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timeStamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: `254${phoneNumber}`,
          PartyB: shortCode,
          PhoneNumber: `254${phoneNumber}`,
          CallBackURL: `${callBackUrI}/callback`,
          // CallBackURL: "https://5da3-197-232-145-163.eu.ngrok.io/callback",
          AccountReference: `254${phoneNumber}`,
          TransactionDesc: "test",
        },
        {
          headers: {
            Authorization: auth,
          },
        }
      )
    );

    if (err) {
      throw new Error(err.message);
    }

    const stkres = stkRes?.data;
    const ResponseCode = stkres.ResponseCode;

    if (ResponseCode === "0") {
      await prisma.stkRes.create({
        data: {
          merchantRequestID: stkres.MerchantRequestID,
          checkoutRequestID: stkres.CheckoutRequestID,
          responseDescription: stkres.ResponseDescription,
          customerMessage: stkres.CustomerMessage,
        },
      });
    }

    return stkres;
  }

  static async queryStk(CheckoutRequestID: string): Promise<any> {
    //fetch from database
    const exisiting = await prisma.callbackRes.findUnique({
      where: {
        checkoutRequestID: CheckoutRequestID,
      },
    });

    if (exisiting) return exisiting;

    const shortCode = config.shortcode;
    const passKey = config.passkey;
    const queryUrl = url.queryUrl;

    const timeStamp = timestampFn();

    const buffer = Buffer.from(shortCode + passKey + timeStamp);
    const password = buffer.toString("base64");

    // Token
    const token = await AuthSercice.getAccessToken();

    const auth = `Bearer ${token}`;
    try {
      const queryReq = await axios.post(
        queryUrl,
        {
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timeStamp,
          CheckoutRequestID,
        },
        {
          headers: {
            Authorization: auth,
          },
        }
      );

      const response = queryReq.data;

      this.saveQuery(response);

      return response;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  static async saveQuery(result: Result): Promise<any> {
    try {
      await prisma.callbackRes.create({
        data: {
          stkRes: { connect: { checkoutRequestID: result.CheckoutRequestID } },
          resultCode: +result.ResultCode,
          resultDesc: result.ResponseDescription,
          mpesaReceiptNumber: result.MpesaReceiptNumber,
        },
      });
    } catch (err: any) {
      throw new Error(err.message);
    }

    // Convert the response to a string
    const responseString = JSON.stringify(result) + "\r\n";

    // Write the response string to a file
    fs.appendFile("response.txt", responseString, (err) => {
      if (err) {
        throw new Error(err.message);
      } else {
        console.log("Response successfully written to file");
      }
    });
  }
}
