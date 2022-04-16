import { Context, DefaultState } from 'koa'
import KoaRouter from 'koa-router'
import chains from './chains'

export default function () {
  const router = new KoaRouter<DefaultState, Context>({ prefix: '/' })
  chains(router)
  return router.routes()
}
