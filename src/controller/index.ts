import KoaRouter from "koa-router";
// import global from "./global";
// import maker from "./maker";
// import setting from "./setting";

export default function () {
  const router = new KoaRouter({ prefix: "/" });
  return router.routes();
}
