/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import * as dotenv from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser'
import ngrok from 'ngrok'
import cors from 'cors'
import localtunnel from 'localtunnel'

import route from './routes'
import { requestLogger, errorLogger, errorResponder, invalidPathHandler } from './middleware'
import { config } from './config'
dotenv.config()

const app = express()

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

app.use(cors())

app.use(requestLogger)

app.use('/', route)

app.use(errorLogger)

app.use(errorResponder)

app.use(invalidPathHandler)

const port = process.env.PORT ? process.env.PORT : 5000

app.listen(port, () => {
  console.log(`🚀 Server ready at: http://localhost:${port}`)
})

const ngrokfn = async (): Promise<any> => {
  try {
    // const url = await ngrok.connect({ 
    //   authtoken: config.ngrokAuthToken,
    //   addr: +port,
    //   configPath: "~/.config/ngrok/ngrok.yml"
    // })
    const tunnel = await localtunnel({ port: +port });
    const url = tunnel.url;
    console.log(`🚀 Local tunnel ready at ${url}`)
      
    return url
  } catch (err: any) {
    console.log(err?.message)
  }
}

export const ngrokUrl = ngrokfn()
