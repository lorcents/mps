/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import * as dotenv from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser'
import ngrok from 'ngrok'
import cors from 'cors'

import route from './routes'
import { requestLogger, errorLogger, errorResponder, invalidPathHandler } from './middleware'
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
  const url = await ngrok.connect(+port)
  console.log(`🚀 Ngrok ready at ${url}`)
  return url
}

export const ngrokUrl = ngrokfn()
