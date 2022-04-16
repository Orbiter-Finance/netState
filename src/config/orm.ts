import path from "path";
import { ConnectionOptions } from "typeorm";


export const options: ConnectionOptions = {
  type: "mysql",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || "orbiter",
  password: process.env.DB_PASS || "123456",
  database: process.env.DB_NAME || "orbiter",
  synchronize: true,
  logging: false,
  extra: {},

  entities: [path.resolve(__dirname, "..", "model", "**", "*.{ts,js}")],
  migrations: [
    //   'src/migration/**/*.ts'
  ],
  subscribers: [
    //   'src/subscriber/**/*.ts'
  ]
};

console.warn("11111 =", options);
