/* eslint-disable @typescript-eslint/no-extraneous-class */
import axios from 'axios'
import { Buffer } from 'buffer'
import { config, url } from '../config/index'

export abstract class AuthSercice {
  static async getAuth (): Promise<any> {
    const consumerSecret = config.consumerSecret
    const consumerKey = config.consumerKey
    if (url.authUrl == null || url.authUrl === undefined) throw new Error('Auth url missing')
    const authUrl = url.authUrl
    const buffer = Buffer.from(`${consumerKey}:${consumerSecret}`)
    const auth = buffer.toString('base64')

    try {
      const tokenReq = await axios.get(authUrl, {
        headers: {
          authorization: `Basic ${auth}`
        }
      })

      const token = tokenReq.data.access_token

      return token
    } catch (err: any) {
      throw new Error(err.message)
    }
  }
}
