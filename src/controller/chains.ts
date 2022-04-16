import { Context, DefaultState } from 'koa'
import KoaRouter from 'koa-router'
import checknet from "../service/checknet"
import { getAllChainsNetState } from '../service/chainToSql'
import { checkNets } from '../schedule'
import makerConfig from "../config/maker"

export default function (router: KoaRouter<DefaultState, Context>) {
  router.get('chains', ctx => {
    ctx.body = checknet.getAllChainNetState()
  })
  router.get('period/chains', async (ctx) => {
    let chainInfosFrame = await getchainInfos()
    const chains = await getAllChainsNetState()
    const chainInfos = pushDataInToFrame(chainInfosFrame, chains)
    ctx.body = { chainInfos }
  })
}

async function getchainInfos() {
  let chainInfosFrame: any[] = []
  const isMainnet = process.env.NODE_ENV == "development" ? false : true
  for (let chainID of checkNets) {
    let chainInfoFrame: any = {
      chainID: chainID,
      netstatList: []
    }
    if (chainID == 1 || chainID == 5) {
      chainInfoFrame.apiUrl = makerConfig.etherscan[isMainnet ? 'Mainnet' : 'Rinkeby'];
      chainInfoFrame.chainName = isMainnet ? 'etherscan' : 'rinkeby';
    } else if (chainID == 2 || chainID == 22) {
      chainInfoFrame.apiUrl = makerConfig.arbitrum[isMainnet ? 'Mainnet' : 'Rinkeby'];
      chainInfoFrame.chainName = isMainnet ? 'arbitrum' : 'arbitrum_test';
    } else if (chainID == 3 || chainID == 33) {
      chainInfoFrame.apiUrl = makerConfig.zkSync[isMainnet ? 'Mainnet' : 'Rinkeby'];
      chainInfoFrame.chainName = isMainnet ? 'zkSync' : 'zksync_test';
    } else if (chainID == 6 || chainID == 66) {
      chainInfoFrame.apiUrl = makerConfig.polygon[isMainnet ? 'Mainnet' : 'Rinkeby'];
      chainInfoFrame.chainName = isMainnet ? 'polygon' : 'polygon_test';
    }
    else if (chainID == 7 || chainID == 77) {
      chainInfoFrame.apiUrl = makerConfig.optimistic[isMainnet ? 'Mainnet' : 'Rinkeby'];
      chainInfoFrame.chainName = isMainnet ? 'optimistic' : 'optimism_test';
    }
    else if (chainID == 8 || chainID == 88) {
      chainInfoFrame.apiUrl = makerConfig.immutableX[isMainnet ? 'Mainnet' : 'Rinkeby'];
      chainInfoFrame.chainName = isMainnet ? 'immutableX' : 'immutableX_test';
    }
    else if (chainID == 9 || chainID == 99) {
      chainInfoFrame.apiUrl = makerConfig.loopring[isMainnet ? 'Mainnet' : 'Rinkeby'];
      chainInfoFrame.chainName = isMainnet ? 'loopring' : 'loopring_test';
    }
    else if (chainID == 10 || chainID == 510) {
      chainInfoFrame.apiUrl = makerConfig.metis[isMainnet ? 'Mainnet' : 'Rinkeby'];
      chainInfoFrame.chainName = isMainnet ? 'metis' : 'metis_test';
    }
    chainInfosFrame.push(chainInfoFrame)
  }
  return chainInfosFrame
}

function pushDataInToFrame(chainInfosFrame, chains) {
  for (let theChain of chains) {
    let obj = chainInfosFrame.find(obj => obj.chainID === theChain.chainID);
    if (obj && obj.netstatList.length <= 72) {
      obj.netstatList.push(theChain)
    }
  }
  return chainInfosFrame
}