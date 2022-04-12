import { accessLogger, errorLogger } from "../util/logger";
import etherscan from "../service/scan/etherscan";
import arbitrum from "../service/scan/arbitrum";
import zksync from "../service/scan/zksync";
import loopring from "../service/scan/loopring";
import immutablex from "../service/scan/immutablex";
import optimistic from "../service/scan/optimistic";
import polygon from "../service/scan/polygon";

let eth_net_state = false;
let ar_net_state = false;
let op_net_state = false;
let po_net_state = false;
let zk_net_state = false;
let imx_net_state = false;
let loop_net_state = false;

let eth_lastHash = "";
let ar_lastHash = "";
let op_lastHash = "";
let po_lastHash = "";
let zk_lastHash = "";
let imx_lastHash = "";
let loop_lastHash = "";

let eth_tx_errCount = 0;
let ar_tx_errCount = 0;
let op_tx_errCount = 0;
let po_tx_errCount = 0;
let zk_tx_errCount = 0;
let imx_tx_errCount = 0;
let loop_tx_errCount = 0;

let eth_lastBlockNum = 0;
let ar_lastBlockNum = 0;
let op_lastBlockNum = 0;
let po_lastBlockNum = 0;
let zk_lastBlockNum = 0;
let imx_lastBlockNum = 0;
let loop_lastBlockNum = 0;

let eth_block_errCount = 0;
let ar_block_errCount = 0;
let op_block_errCount = 0;
let po_block_errCount = 0;
let zk_block_errCount = 0;
let imx_block_errCount = 0;
let loop_block_errCount = 0;

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
  }
};

const scanNet = async function (chainID) {
  var timestamp = parseInt(String(new Date().getTime() / 1000));

  var blockNumReq = {
    timestamp: timestamp,
    closest: "before"
  };
  var txListReq = {
    end: 9999999999999,
    page: 1,
    offset: 1,
    sort: "desc"
  };

  var zkTxListReq = {
    from: "latest",
    limit: 1,
    direction: "older"
  };
  switch (chainID) {
    case 3:
    case 33:
      let ZkScanList = await zksync.getTxList(zkTxListReq, chainID);
      if (!ZkScanList.code) {
        let newHash = ZkScanList["data"];
        if (newHash == zk_lastHash) {
          zk_tx_errCount++;
        } else {
          zk_lastHash = newHash;
          zk_tx_errCount = 0;
        }
      } else {
        zk_tx_errCount++;
      }
      let ZkNetStatus = await zksync.getZkNetStatus(chainID);
      if (!ZkNetStatus.code) {
        let newBlockNum = ZkNetStatus["data"];
        if (newBlockNum == zk_lastBlockNum) {
          zk_block_errCount++;
        } else {
          zk_lastBlockNum = newBlockNum;
          zk_block_errCount = 0;
        }
      } else {
        zk_block_errCount++;
      }
      if (zk_block_errCount > 15 && zk_tx_errCount > 15 && !zk_net_state) {
        errorLogger.error("zk error to true zk_net_state = true");
        zk_net_state = true;
      }
      if (zk_net_state && (zk_block_errCount < 15 || zk_tx_errCount < 15)) {
        errorLogger.error("zk error to false zk_net_state = false");
        zk_net_state = false;
      }
      accessLogger.info("zkState =", zk_net_state);
      accessLogger.info("zk_block_errCount =", zk_block_errCount);
      accessLogger.info("zk_tx_errCount =", zk_tx_errCount);
      accessLogger.info("zk_lastBlockNum =", zk_lastBlockNum);
      accessLogger.info("zk_lastHash =", zk_lastHash);
      accessLogger.info(
        "========================================================"
      );
      break;
    case 9:
    case 99:
      let loopScanList = await loopring.getTxList(chainID);
      if (loopScanList.code || !loopScanList.data) {
        loop_tx_errCount++;
      } else {
        loop_lastHash = loopScanList.data;
      }

      if (loop_tx_errCount > 15 && !loop_net_state) {
        errorLogger.error("loop error to true loop_net_state = true");
        loop_net_state = true;
      }
      if (loop_net_state && loop_block_errCount < 15) {
        errorLogger.error("loop error to false loop_net_state = false");
        loop_net_state = false;
      }
      accessLogger.info("loop =", loop_net_state);
      accessLogger.info("loop_tx_errCount =", loop_tx_errCount);
      accessLogger.info("loop_lastHash =", loop_lastHash);
      accessLogger.info(
        "========================================================"
      );
      break;
    case 1:
    case 5:
      let ethScanList = await etherscan.getTxList(txListReq, chainID);
      if (!ethScanList.code) {
        let newHash = ethScanList["data"];
        if (newHash == eth_lastHash) {
          eth_tx_errCount++;
        } else {
          eth_lastHash = newHash;
          eth_tx_errCount = 0;
        }
      } else {
        eth_tx_errCount++;
      }
      let ethblockNumber = await etherscan.getBlockNumberWithTimeStamp(
        blockNumReq,
        chainID
      );
      if (!ethblockNumber.code) {
        let newBlockNum = ethblockNumber["data"];
        if (newBlockNum == eth_lastBlockNum) {
          eth_block_errCount++;
        } else {
          eth_lastBlockNum = newBlockNum;
          eth_block_errCount = 0;
        }
      } else {
        eth_block_errCount++;
      }
      if (eth_block_errCount > 15 && eth_tx_errCount > 15 && !eth_net_state) {
        errorLogger.error("eth error to true eth_net_state = true");
        eth_net_state = true;
      }
      if (eth_net_state && (eth_block_errCount < 15 || eth_tx_errCount < 15)) {
        errorLogger.error("eth error to false eth_net_state = false");
        eth_net_state = false;
      }
      accessLogger.info("eth =", eth_net_state);
      accessLogger.info("eth_block_errCount =", eth_block_errCount);
      accessLogger.info("eth_tx_errCount =", eth_tx_errCount);
      accessLogger.info("eth_lastBlockNum =", eth_lastBlockNum);
      accessLogger.info("eth_lastHash =", eth_lastHash);
      accessLogger.info(
        "========================================================"
      );

      break;
    case 2:
    case 22:
      let ArScanList = await arbitrum.getTxList(txListReq, chainID);
      if (!ArScanList.code) {
        let newHash = ArScanList["data"];
        if (newHash == ar_lastHash) {
          ar_tx_errCount++;
        } else {
          ar_lastHash = newHash;
          ar_tx_errCount = 0;
        }
      } else {
        ar_tx_errCount++;
      }
      let ArblockNumber = await arbitrum.getBlockNumberWithTimeStamp(
        blockNumReq,
        chainID
      );
      if (!ArblockNumber.code) {
        let newBlockNum = ArblockNumber["data"];
        if (newBlockNum == ar_lastBlockNum) {
          ar_block_errCount++;
        } else {
          ar_lastBlockNum = newBlockNum;
          ar_block_errCount = 0;
        }
      } else {
        ar_block_errCount++;
      }
      if (ar_block_errCount > 15 && ar_tx_errCount > 15 && !ar_net_state) {
        errorLogger.error("ar error to true ar_net_state = true");
        ar_net_state = true;
      }
      if (ar_net_state && (ar_block_errCount < 15 || ar_tx_errCount < 15)) {
        errorLogger.error("ar error to false ar_net_state = false");
        ar_net_state = false;
      }
      accessLogger.info("ar =", ar_net_state);
      accessLogger.info("ar_block_errCount =", ar_block_errCount);
      accessLogger.info("ar_tx_errCount =", ar_tx_errCount);
      accessLogger.info("ar_lastBlockNum =", ar_lastBlockNum);
      accessLogger.info("ar_lastHash =", ar_lastHash);
      accessLogger.info(
        "========================================================"
      );
      break;
    case 6:
    case 66:
      let OpScanList = await optimistic.getTxList(txListReq, chainID);
      if (!OpScanList.code) {
        let newHash = OpScanList["data"];
        if (newHash == op_lastHash) {
          op_tx_errCount++;
        } else {
          op_lastHash = newHash;
          op_tx_errCount = 0;
        }
      } else {
        op_tx_errCount++;
      }
      let OpblockNumber = await optimistic.getBlockNumberWithTimeStamp(
        blockNumReq,
        chainID
      );
      if (!OpblockNumber.code) {
        let newBlockNum = OpblockNumber["data"];
        if (newBlockNum == op_lastBlockNum) {
          op_block_errCount++;
        } else {
          op_lastBlockNum = newBlockNum;
          op_block_errCount = 0;
        }
      } else {
        op_block_errCount++;
      }
      if (op_block_errCount > 15 && op_tx_errCount > 15 && !op_net_state) {
        errorLogger.error("op error to true op_net_state = true");
        op_net_state = true;
      }
      if (ar_net_state && (ar_block_errCount < 15 || ar_tx_errCount < 15)) {
        errorLogger.error("op error to false op_net_state = false");
        op_net_state = false;
      }
      accessLogger.info("op =", op_net_state);
      accessLogger.info("op_block_errCount =", op_block_errCount);
      accessLogger.info("op_tx_errCount =", op_tx_errCount);
      accessLogger.info("op_lastBlockNum =", op_lastBlockNum);
      accessLogger.info("op_lastHash =", op_lastHash);
      accessLogger.info(
        "========================================================"
      );

      break;
    case 7:
    case 77:
      let PoScanList = await polygon.getTxList(txListReq, chainID);
      if (!PoScanList.code) {
        let newHash = PoScanList["data"];
        if (newHash == po_lastHash) {
          po_tx_errCount++;
        } else {
          po_lastHash = newHash;
          po_tx_errCount = 0;
        }
      } else {
        po_tx_errCount++;
      }
      let PoblockNumber = await polygon.getBlockNumberWithTimeStamp(
        blockNumReq,
        chainID
      );
      if (!PoblockNumber.code) {
        let newBlockNum = PoblockNumber["data"];
        if (newBlockNum == po_lastBlockNum) {
          po_block_errCount++;
        } else {
          po_lastBlockNum = newBlockNum;
          po_block_errCount = 0;
        }
      } else {
        po_block_errCount++;
      }
      if (po_block_errCount > 15 && po_tx_errCount > 15 && !po_net_state) {
        errorLogger.error("po error to true po_net_state = true");
        po_net_state = true;
      }
      if (po_net_state && (po_block_errCount < 15 || po_tx_errCount < 15)) {
        errorLogger.error("po error to false po_net_state = false");
        po_net_state = false;
      }
      accessLogger.info("po =", po_net_state);
      accessLogger.info("po_block_errCount =", po_block_errCount);
      accessLogger.info("po_tx_errCount =", po_tx_errCount);
      accessLogger.info("po_lastBlockNum =", po_lastBlockNum);
      accessLogger.info("po_lastHash =", po_lastHash);
      accessLogger.info(
        "========================================================"
      );

      break;
    case 8:
    case 88:
      console.log("imx");
      const imxList = await immutablex.getTxList(chainID);
      if (!imxList.code) {
        let newHash = imxList["data"];
        if (newHash == imx_lastHash) {
          imx_tx_errCount++;
        } else {
          imx_lastHash = newHash;
          imx_tx_errCount = 0;
        }
      } else {
        imx_tx_errCount++;
      }
      if (imx_tx_errCount > 15 && !imx_net_state) {
        errorLogger.error("imx error to true，set imx_net_state = true");
        imx_net_state = true;
      }
      if (imx_net_state && imx_tx_errCount < 15) {
        errorLogger.error("imx error to false imx_net_state = false");
        imx_net_state = false;
      }
      accessLogger.info("imx =", imx_net_state);
      accessLogger.info("imx_tx_errCount =", imx_tx_errCount);
      accessLogger.info("imx_lastHash =", imx_lastHash);
      accessLogger.info(
        "========================================================"
      );
      // getTxList
      break;
  }
};
