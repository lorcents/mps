/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import axios from 'axios'
import { Buffer } from 'buffer'
import { config, url } from '../config/index'

export abstract class AuthSercice {
  private static accessTokenData = {
    access_token: '',
    expires_at: 0
  }

  private static async getAuth (): Promise<any> {
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

      const access_token = tokenReq.data.access_token
      const expiresIn = parseInt(tokenReq.data.expires_in)
      const expires_at = Date.now() + expiresIn * 1000

      this.accessTokenData = { access_token, expires_at }

      return access_token
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  public static async getAccessToken (): Promise<string> {
    if (this.isTokenExpired()) {
      return await this.getAuth()
    } else {
      return this.accessTokenData.access_token
    }
  }

  private static isTokenExpired (): boolean {
    return this.accessTokenData.expires_at < Date.now()
  }
}
