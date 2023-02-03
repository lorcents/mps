import axios from "axios";
import express from "express";
import to from "await-to-js";
import { Prisma, PrismaClient } from "@prisma/client";

import { AuthSercice } from "./auth.service";
import { timestampFn } from "../util";
import { url, config } from "../config";
import { ngrokUrl } from "../app";

const prisma = new PrismaClient();

interface stkData {
  phoneNumber: string;
  amount: number;
}

interface queryData {}

export abstract class StkService {
  static async pushStk(data: stkData): Promise<any> {
    const phoneNumber = data.phoneNumber.substring(1);
    const amount = data.amount;

    const stkUrl = url.stkUrl!;
    // const CallBackURL = url.CallBackURL!;
    const callBackUrI = await ngrokUrl;
    console.log(`${callBackUrI}/callback`);

    const shortCode = config.shortcode!;
    const passKey = config.passkey!;

    const timeStamp = timestampFn();

    const buffer = Buffer.from(shortCode + passKey + timeStamp);
    const password = buffer.toString("base64");

    // Token
    const token = await AuthSercice.getAuth();

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
      return err.message;
    }

    let stkres = stkRes?.data;
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

    // const resultRes = await prisma.callbackRes.findUnique({
    //   where: {
    //     checkoutRequestID: stkres.CheckoutRequestID,
    //   },
    // });

    // if (resultRes === null) {
    //   return "Failed to get callback data";
    // }
    // console.log(resultRes);

    return stkres;
  }

  static async queryStk(CheckoutRequestID: string): Promise<any> {
    const shortCode = config.shortcode!;
    const passKey = config.passkey!;
    const queryUrl = url.queryUrl!;

    const timeStamp = timestampFn();

    const buffer = Buffer.from(shortCode + passKey + timeStamp);
    const password = buffer.toString("base64");

    // Token
    const token = await AuthSercice.getAuth();

    const auth = `Bearer ${token}`;
    try {
      const queryReq = await axios.post(
        queryUrl,
        {
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timeStamp,
          CheckoutRequestID: CheckoutRequestID,
        },
        {
          headers: {
            Authorization: auth,
          },
        }
      );

      const response = queryReq.data;

      return response;
    } catch (err: any) {
      console.log(err);
      return err.message;
    }
  }
}
