import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import ngrok from "ngrok";

import cors from "cors";

import route from "./routes";

const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors());

app.use("/", route);

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`🚀 Server ready at: http://localhost:${port}`);
});

const ngrokfn = async () => {
  const url = await ngrok.connect(+port);
  console.log(`🚀 Ngrok ready at ${url}`);
  return url;
};

export const ngrokUrl = ngrokfn();
