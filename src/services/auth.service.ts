import axios from "axios";
import express from "express";
import { Buffer } from "buffer";
import { config, url } from "../config/index";

export abstract class AuthSercice {
  static async getAuth(): Promise<any> {
    const consumerSecret = config.consumerSecret;
    const consumerKey = config.consumerKey;
    const authUrl = url.authUrl!;
    const buffer = Buffer.from(`${consumerKey}:${consumerSecret}`);
    const auth = buffer.toString("base64");

    try {
      const tokenReq = await axios.get(authUrl, {
        headers: {
          authorization: `Basic ${auth}`,
        },
      });

      const token = tokenReq.data.access_token;

      return token;
    } catch (err: any) {
      console.log(err.message);
    }
  }
}
