import { AppError } from "../middleware";

interface Config {
  consumerSecret: string;
  consumerKey: string;
  shortcode: string;
  passkey: string;
  ngrokAuthToken: string;
}

interface Url {
  authUrl: string;
  stkUrl: string;
  CallBackURL: string;
  queryUrl: string;
}

function validateEnvVariable(
  variable: string | undefined,
  name: string
): string {
  if (variable == null || variable === undefined) {
    throw new AppError(500, `Environment variable ${name} is not defined.`);
  }
  return variable;
}

const config: Config = {
  consumerSecret: validateEnvVariable(
    process.env.consumerSecret,
    "consumerSecret"
  ),
  consumerKey: validateEnvVariable(process.env.consumerKey, "consumerKey"),
  shortcode: validateEnvVariable(process.env.shortcode, "shortcode"),
  passkey: validateEnvVariable(process.env.passkey, "passkey"),
  ngrokAuthToken: validateEnvVariable(
    process.env.ngrokAuthToken,
    "ngrokAuthToken"
  ),
};

const url: Url = {
  authUrl: validateEnvVariable(process.env.authUrl, "authUrl"),
  stkUrl: validateEnvVariable(process.env.stkUrl, "stkUrl"),
  CallBackURL: validateEnvVariable(process.env.CallBackURL, "CallBackURL"),
  queryUrl: validateEnvVariable(
    process.env.mpsExpressQueryUrl,
    "mpsExpressQueryUrl"
  ),
};

export { config, url };
