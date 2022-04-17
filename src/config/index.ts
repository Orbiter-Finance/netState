import path from "path";
import * as dotenv from "dotenv";
dotenv.config({
  path: path.resolve(__dirname, "..", "..", ".env")
});
import * as ormConfig from "./orm";
import * as logConfig from "./log";
import makerConfig from "./maker";
const appConfig = {
  options: {
    port: process.env.APP_OPTIONS_PORT || 443,
    host: process.env.APP_OPTIONS_HOST || "0.0.0.0"
  }
};

export { appConfig, ormConfig, logConfig, makerConfig };
