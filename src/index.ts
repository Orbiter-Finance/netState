import Koa from "koa";
import path from "path"
import https from 'https';
import fs from 'fs';
import { appConfig, ormConfig } from "./config";
import cors from "koa2-cors";
import koaBodyparser from "koa-bodyparser";
import controller from "./controller";
import { createConnection } from "typeorm";
import { sleep } from "./util";
import { Core } from "./util/core";
import { accessLogger, errorLogger } from "./util/logger";
import { startJobs } from './schedule'
const startKoa = () => {
  const koa = new Koa();

  // onerror
  koa.on("error", (err: Error) => {
    errorLogger.error(err.stack || err.message);
  });

  // middleware global
  //   koa.use(middlewareGlobal())

  // koa2-cors
  koa.use(
    cors({
      origin: "*",
      exposeHeaders: ["WWW-Authenticate", "Server-Authorization"],
      maxAge: 5,
      credentials: true,
      allowMethods: ["GET", "POST", "DELETE"],
      allowHeaders: ["Content-Type", "Authorization", "Accept"]
    })
  );

  // koa-bodyparser
  koa.use(koaBodyparser());

  // controller
  koa.use(controller());

  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '../src/https/api_orbiter_finance.key')),
    ca: fs.readFileSync(path.join(__dirname, '../src/https/api_orbiter_finance.ca-bundle')),
    cert: fs.readFileSync(path.join(__dirname, '../src/https/api_orbiter_finance.crt')),
  }
  https.createServer(httpsOptions, koa.callback()).listen(appConfig.options)
};

const main = async () => {
  try {
    // initialize mysql connect, waiting for mysql server started
    accessLogger.info(`process: ${process.pid}. start connnet database...`);
    const reconnectTotal = 10;
    for (let index = 1; index <= reconnectTotal; index++) {
      try {
        // db bind
        Core.db = await createConnection(ormConfig.options);

        // Break if connected
        break;
      } catch (err) {
        console.log(err, 'err')
        console.log(
          `process: ${process.pid}. Connect to database failed: ${index}`
        );

        if (index == reconnectTotal) {
          throw err;
        }

        // sleep 1.5s
        await sleep(1500);
      }
    }
    startKoa();
    startJobs()
  } catch (error) {
    errorLogger.error("error =", error);
  }
};

main();
