import { accessLogger, errorLogger } from "../util/logger";
import etherscan from "../service/scan/etherscan";
import arbitrum from "../service/scan/arbitrum";
import zksync from "../service/scan/zksync";
import loopring from "../service/scan/loopring";
import immutablex from "../service/scan/immutablex";
import optimistic from "../service/scan/optimistic";
import polygon from "../service/scan/polygon";
import metis from "../service/scan/metis";
const isDeveloper = process.env.NODE_ENV == "development"
let chainsInfo = {
  eth: {
    ten_minite_net_state: false,
    chainID: !isDeveloper ? 1 : 5,
    net_state: false,
    last_hash: "",
    tx_err_count: 0,
    last_block_num: 0,
    block_err_count: 0,
  },
  ar: {
    ten_minite_net_state: false,
    chainID: !isDeveloper ? 2 : 22,
    net_state: false,
    last_hash: "",
    tx_err_count: 0,
    last_block_num: 0,
    block_err_count: 0,
  },
  op: {
    ten_minite_net_state: false,
    chainID: !isDeveloper ? 7 : 77,
    net_state: false,
    last_hash: "",
    tx_err_count: 0,
    last_block_num: 0,
    block_err_count: 0,
  },
  zk: {
    ten_minite_net_state: false,
    chainID: !isDeveloper ? 3 : 33,
    net_state: false,
    last_hash: "",
    tx_err_count: 0,
    last_block_num: 0,
    block_err_count: 0,
  },
  imx: {
    ten_minite_net_state: false,
    chainID: !isDeveloper ? 8 : 88,
    net_state: false,
    last_hash: "",
    last_block_num: 0,
    tx_err_count: 0,
    block_err_count: 0,
  },
  loop: {
    ten_minite_net_state: false,
    chainID: !isDeveloper ? 9 : 99,
    net_state: false,
    last_hash: "",
    tx_err_count: 0,
    last_block_num: 0,
    block_err_count: 0,
  },
  mt: {
    ten_minite_net_state: false,
    chainID: !isDeveloper ? 10 : 510,
    net_state: false,
    last_hash: "",
    tx_err_count: 0,
    last_block_num: 0,
    block_err_count: 0,
  },
  po: {
    ten_minite_net_state: false,
    chainID: !isDeveloper ? 6 : 66,
    net_state: false,
    last_hash: "",
    last_block_num: 0,
    tx_err_count: 0,
    block_err_count: 0,
  },
}
export default {
  /**
   *
   * @param {number[]} chains
   * @returns
   */
  startCheckNet: async function (chains: number[]) {
    if (!chains) {
      return;
    }
    if (!chains.length) {
      return;
    }
    for (let index = 0; index < chains.length; index++) {
      const chainID = chains[index];
      scanNet(chainID);
    }
  },
  getChainNetState: function (chainID) {
    let shortchainName = chainIdToChainNetState(chainID)
    if (shortchainName) {
      return chainsInfo[shortchainName]
    } else {
      return undefined
    }

  },
  getAllChainNetState: function () {
    return chainsInfo
  }
};

const chainIdToChainNetState = function (chainID) {
  let shortchainName = ''
  switch (chainID) {
    case 1:
    case 5:
      shortchainName = 'eth'
      break
    case 2:
    case 22:
      shortchainName = 'ar'
      break
    case 3:
    case 33:
      shortchainName = 'zk'
      break
    case 6:
    case 66:
      shortchainName = 'po'
      break
    case 7:
    case 77:
      shortchainName = 'op'
      break
    case 8:
    case 88:
      shortchainName = 'imx'
      break
    case 9:
    case 99:
      shortchainName = 'loop'
      break
    case 10:
    case 510:
      shortchainName = 'metis'
      break
    case 11:
    case 511:
      shortchainName = 'dydx'
      break
  }
  return shortchainName
}

const scanNet = async function (chainID) {
  let timestamp = parseInt(String(new Date().getTime() / 1000));

  let blockNumReq = {
    timestamp: timestamp,
    closest: "before"
  };
  let txListReq = {
    end: 9999999999999,
    page: 1,
    offset: 1,
    sort: "desc"
  };

  let zkTxListReq = {
    from: "latest",
    limit: 1,
    direction: "older"
  };
  switch (chainID) {
    case 3:
    case 33:
      let zk = chainsInfo.zk
      let ZkScanList = await zksync.getTxList(zkTxListReq, chainID);
      if (!ZkScanList.code) {
        let newHash = ZkScanList["data"];
        if (newHash && newHash != zk.last_hash) {
          zk.last_hash = newHash;
          zk.tx_err_count = 0;
        } else {
          zk.tx_err_count++;
        }
      } else {
        zk.tx_err_count++;
      }

      let ZkNetStatus = await zksync.getZkNetStatus(chainID);

      if (!ZkNetStatus.code) {
        let newBlockNum = ZkNetStatus["data"];
        if (newBlockNum == zk.last_block_num) {
          zk.block_err_count++;
        } else {
          zk.last_block_num = newBlockNum;
          zk.block_err_count = 0;
        }
      } else {
        zk.block_err_count++;
      }
      if (zk.block_err_count > 15 && zk.tx_err_count > 15 && !zk.net_state) {
        errorLogger.error("zk error to true net_state = true");
        zk.net_state = true;
        zk.ten_minite_net_state = true
      }
      if (zk.net_state) {
        zk.ten_minite_net_state = true
      }
      if (zk.net_state && (zk.block_err_count < 15 || zk.tx_err_count < 15)) {
        errorLogger.error("zk error to false net_state = false");
        zk.net_state = false;
      }

      accessLogger.info("zkSync net_state=", zk.net_state);
      accessLogger.info("zkSync ten_minite_net_state=", zk.ten_minite_net_state);
      accessLogger.info("block_err_count =", zk.block_err_count);
      accessLogger.info("tx_err_count =", zk.tx_err_count);
      accessLogger.info("last_block_num =", zk.last_block_num);
      accessLogger.info("last_hash =", zk.last_hash);
      accessLogger.info(
        "========================================================"
      );
      break;

    case 9:
    case 99:
      let loop = chainsInfo.loop
      let loopScanList = await loopring.getTxList(chainID);
      if (loopScanList.code || !loopScanList.data) {
        loop.tx_err_count++;
      } else {
        loop.last_hash = loopScanList.data;
      }
      if (loop.tx_err_count > 15 && !loop.net_state) {
        errorLogger.error("loop error to true net_state = true");
        loop.net_state = true;
        loop.ten_minite_net_state = true
      }
      if (loop.net_state && loop.tx_err_count < 15) {
        errorLogger.error("zk error to false net_state = false");
        loop.net_state = false;
      }
      if (loop.net_state) {
        loop.ten_minite_net_state = true
      }

      accessLogger.info("loop net_state=", loop.net_state);
      accessLogger.info("loop ten_minite_net_state=", loop.ten_minite_net_state);
      accessLogger.info("tx_err_count =", loop.tx_err_count);
      accessLogger.info("last_hash =", loop.last_hash);
      accessLogger.info(
        "========================================================"
      );
      break;

    case 1:
    case 5:
      let eth = chainsInfo.eth
      let ethScanList = await etherscan.getTxList(txListReq, chainID);
      if (!ethScanList.code) {
        let newHash = ethScanList["data"];
        if (newHash && newHash != eth.last_hash) {
          eth.last_hash = newHash;
          eth.tx_err_count = 0;
        } else {
          eth.tx_err_count++;
        }
      } else {
        eth.tx_err_count++;
      }
      let ethblockNumber = await etherscan.getBlockNumberWithTimeStamp(
        blockNumReq,
        chainID
      );
      if (!ethblockNumber.code) {
        let newBlockNum = ethblockNumber["data"];
        if (newBlockNum == eth.last_block_num) {
          eth.block_err_count++;
        } else {
          eth.last_block_num = newBlockNum;
          eth.block_err_count = 0;
        }
      } else {
        eth.block_err_count++;
      }
      if (eth.block_err_count > 15 && eth.tx_err_count > 15 && !eth.net_state) {
        errorLogger.error("eth error to true net_state = true");
        eth.net_state = true;
        eth.ten_minite_net_state = true
      }
      if (eth.net_state && (eth.block_err_count < 15 || eth.tx_err_count < 15)) {
        errorLogger.error("eth error to false net_state = false");
        eth.net_state = false;
      }
      if (eth.net_state) {
        eth.ten_minite_net_state = true
      }

      accessLogger.info("eth net_state=", eth.net_state);
      accessLogger.info("eth ten_minite_net_state=", eth.ten_minite_net_state);
      accessLogger.info("block_err_count =", eth.block_err_count);
      accessLogger.info("tx_err_count =", eth.tx_err_count);
      accessLogger.info("last_block_num =", eth.last_block_num);
      accessLogger.info("last_hash =", eth.last_hash);
      accessLogger.info(
        "========================================================"
      );
      break;

    case 2:
    case 22:
      let ar = chainsInfo.ar
      let ArScanList = await arbitrum.getTxList(txListReq, chainID);
      if (!ArScanList.code) {
        let newHash = ArScanList["data"];
        if (newHash && newHash != ar.last_hash) {
          ar.last_hash = newHash;
          ar.tx_err_count = 0;
        } else {
          ar.tx_err_count++;
        }
      } else {
        ar.tx_err_count++;
      }
      let ArblockNumber = await arbitrum.getBlockNumberWithTimeStamp(
        blockNumReq,
        chainID
      );
      if (!ArblockNumber.code) {
        let newBlockNum = ArblockNumber["data"];
        if (newBlockNum == ar.last_block_num) {
          ar.block_err_count++;
        } else {
          ar.last_block_num = newBlockNum;
          ar.block_err_count = 0;
        }
      } else {
        ar.block_err_count++;
      }
      if (ar.block_err_count > 15 && ar.tx_err_count > 15 && !ar.net_state) {
        errorLogger.error("ar error to true net_state = true");
        ar.net_state = true;
        ar.ten_minite_net_state = true
      }
      if (ar.net_state && (ar.block_err_count < 15 || ar.tx_err_count < 15)) {
        errorLogger.error("ar error to false net_state = false");
        ar.net_state = false;
      }
      if (ar.net_state) {
        ar.ten_minite_net_state = true
      }
      accessLogger.info("ar net_state=", ar.net_state);
      accessLogger.info("ar ten_minite_net_state=", ar.ten_minite_net_state);
      accessLogger.info("block_err_count =", ar.block_err_count);
      accessLogger.info("tx_err_count =", ar.tx_err_count);
      accessLogger.info("last_block_num =", ar.last_block_num);
      accessLogger.info("last_hash =", ar.last_hash);
      accessLogger.info(
        "========================================================"
      );
      break;

    case 6:
    case 66:
      let po = chainsInfo.po
      let PoScanList = await polygon.getTxList(txListReq, chainID);
      if (!PoScanList.code) {
        let newHash = PoScanList["data"];
        if (newHash && newHash != po.last_hash) {
          po.last_hash = newHash;
          po.tx_err_count = 0;
        } else {
          po.tx_err_count++;
        }
      } else {
        po.tx_err_count++;
      }
      let PoblockNumber = await polygon.getBlockNumberWithTimeStamp(
        blockNumReq,
        chainID
      );
      if (!PoblockNumber.code) {
        let newBlockNum = PoblockNumber["data"];
        if (newBlockNum == po.last_block_num) {
          po.block_err_count++;
        } else {
          po.last_block_num = newBlockNum;
          po.block_err_count = 0;
        }
      } else {
        po.block_err_count++;
      }
      if (po.block_err_count > 15 && po.tx_err_count > 15 && !po.net_state) {
        errorLogger.error("po error to true net_state = true");
        po.net_state = true;
        po.ten_minite_net_state = true
      }
      if (po.net_state && (po.block_err_count < 15 || po.tx_err_count < 15)) {
        errorLogger.error("po error to false net_state = false");
        po.net_state = false;
      }
      if (po.net_state) {
        po.ten_minite_net_state = true
      }

      accessLogger.info("po net_state=", po.net_state);
      accessLogger.info("po ten_minite_net_state=", po.ten_minite_net_state);
      accessLogger.info("block_err_count =", po.block_err_count);
      accessLogger.info("tx_err_count =", po.tx_err_count);
      accessLogger.info("last_block_num =", po.last_block_num);
      accessLogger.info("last_hash =", po.last_hash);
      accessLogger.info(
        "========================================================"
      );
      break;
    case 7:
    case 77:
      let op = chainsInfo.op
      let OpScanList = await optimistic.getTxList(txListReq, chainID);
      if (!OpScanList.code) {
        let newHash = OpScanList["data"];
        if (newHash && newHash != op.last_hash) {
          op.last_hash = newHash;
          op.tx_err_count = 0;
        } else {
          op.tx_err_count++;
        }
      } else {
        op.tx_err_count++;
      }
      let OpblockNumber = await optimistic.getBlockNumberWithTimeStamp(
        blockNumReq,
        chainID
      );
      if (!OpblockNumber.code) {
        let newBlockNum = OpblockNumber["data"];
        if (newBlockNum == op.last_block_num) {
          op.block_err_count++;
        } else {
          op.last_block_num = newBlockNum;
          op.block_err_count = 0;
        }
      } else {
        op.block_err_count++;
      }
      if (op.block_err_count > 15 && op.tx_err_count > 15 && !op.net_state) {
        errorLogger.error("op error to true net_state = true");
        op.net_state = true;
        op.ten_minite_net_state = true
      }
      if (op.net_state && (op.block_err_count < 15 || op.tx_err_count < 15)) {
        errorLogger.error("op error to false net_state = false");
        op.net_state = false;
      }
      if (op.net_state) {
        op.ten_minite_net_state = true
      }
      accessLogger.info("op net_state=", op.net_state);
      accessLogger.info("op ten_minite_net_state=", op.ten_minite_net_state);
      accessLogger.info("block_err_count =", op.block_err_count);
      accessLogger.info("tx_err_count =", op.tx_err_count);
      accessLogger.info("last_block_num =", op.last_block_num);
      accessLogger.info("last_hash =", op.last_hash);
      accessLogger.info(
        "========================================================"
      );
      break;

    case 8:
    case 88:
      let imx = chainsInfo.imx
      const imxList = await immutablex.getTxList(chainID);
      if (!imxList.code) {
        let newHash = imxList["data"];

        if (newHash && newHash != imx.last_hash) {
          imx.last_hash = newHash;
          imx.tx_err_count = 0;
        } else {
          imx.tx_err_count++;
        }
      } else {
        imx.tx_err_count++;
      }
      if (imx.tx_err_count > 15 && !imx.net_state) {
        errorLogger.error("imx error to true，set net_state = true");
        imx.net_state = true;
        imx.ten_minite_net_state = true
      }
      if (imx.net_state && imx.tx_err_count < 15) {
        errorLogger.error("imx error to false net_state = false");
        imx.net_state = false;
      }
      if (imx.net_state) {
        imx.ten_minite_net_state = true
      }

      accessLogger.info("imx net_state=", imx.net_state);
      accessLogger.info("imx ten_minite_net_state=", imx.ten_minite_net_state);
      accessLogger.info("tx_err_count =", imx.tx_err_count);
      accessLogger.info("last_hash =", imx.last_hash);
      accessLogger.info(
        "========================================================"
      );
      // getTxList
      break;

    case 10:
    case 510:
      let mt = chainsInfo.mt
      let MtScanList = await metis.getTxList(txListReq, chainID);
      if (!MtScanList.code) {
        let newHash = MtScanList["data"];
        if (newHash && newHash != mt.last_hash) {
          mt.last_hash = newHash;
          mt.tx_err_count = 0;
        } else {
          mt.tx_err_count++;
        }
      } else {
        mt.tx_err_count++;
      }
      let MtblockNumber = await metis.getBlockNumberWithTimeStamp(
        blockNumReq,
        chainID
      );
      if (!MtblockNumber.code) {
        let newBlockNum = MtblockNumber["data"];
        if (newBlockNum == mt.last_block_num) {
          mt.block_err_count++;
        } else {
          mt.last_block_num = newBlockNum;
          mt.block_err_count = 0;
        }
      } else {
        mt.block_err_count++;
      }
      if (mt.block_err_count > 15 && mt.tx_err_count > 15 && !mt.net_state) {
        errorLogger.error("metis error to true net_state = true");
        mt.net_state = true;
        mt.ten_minite_net_state = true
      }
      if (mt.net_state && (mt.block_err_count < 15 || mt.tx_err_count < 15)) {
        errorLogger.error("metis error to false net_state = false");
        mt.net_state = false;
      }
      if (mt.net_state) {
        mt.ten_minite_net_state = true
      }
      accessLogger.info("metis net_state=", mt.net_state);
      accessLogger.info("metis ten_minite_net_state=", mt.ten_minite_net_state);
      accessLogger.info("block_err_count =", mt.block_err_count);
      accessLogger.info("mt_tx_errCount =", mt.tx_err_count);
      accessLogger.info("last_block_num =", mt.last_block_num);
      accessLogger.info("mt_lastHash =", mt.last_hash);
      accessLogger.info(
        "========================================================"
      );
      break;
  }
}
