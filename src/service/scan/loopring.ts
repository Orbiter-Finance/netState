import axios from "axios";
import { makerConfig } from "../../config";
import { errorLogger } from "../../util/logger";

let configNet = makerConfig["loopring"].Mainnet;
let apiKey =
  process.env.NODE_ENV == "development"
    ? makerConfig["loopring"].dev_key
    : makerConfig["loopring"].pro_key;
let accountId = 0;
export default {
  getTxList: async function (localChainID) {
    if (localChainID == 99) {
      configNet = makerConfig["loopring"].Rinkeby;
    }
    if (!accountId) {
      accountId = await getAccountInfo();
    }
    let url = configNet + "/api/v3/user/transfers";
    const params = {
      accountId: accountId,
      start: 0,
      end: 9999999999999,
      status: "processed,processing,received",
      limit: 1,
      offset: 0,
      tokenSymbol: "ETH",
      transferTypes: "transfer"
    };
    try {
      const LPTransferResult = await axios.get(url, {
        params: params,
        headers: {
          "X-API-KEY": apiKey ? apiKey : ""
        }
      });
      if (
        LPTransferResult.status == 200 &&
        LPTransferResult.statusText == "OK"
      ) {
        let txList = LPTransferResult.data;
        if (txList && txList.totalNum && txList.transactions.length) {
          return {
            code: 0,
            data: txList.transactions[0].hash
          };
        } else {
          errorLogger.error("lp No transactions found");
          return {
            code: 1,
            data: "lp No transactions found"
          };
        }
      } else {
        errorLogger.error("LPTXNetError");
        return {
          code: 1,
          data: "LP TX NetError"
        };
      }
    } catch (error) {
      errorLogger.error("LPTXError =", error);
      return {
        code: 2,
        data: error
      };
    }
  }
};

async function getAccountInfo() {
  let url = configNet + "/api/v3/account";
  const params = {
    owner: makerConfig["makerAddress"]
  };
  try {
    const res: any = await axios.get(url, {
      params: params
    });
    if (res.status == 200 && res.data && res.data.accountId) {
      return res.data.accountId;
    } else {
      return 0;
    }
  } catch (error) {
    errorLogger.error("get lp account Error =", error.message);
    return 0;
  }
}
