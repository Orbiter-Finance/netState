import { UserAPI, ExchangeAPI } from "@loopring-web/loopring-sdk";
import axios from "axios";
import { config } from "dotenv";
import { makerConfig } from "../../config";
import { accessLogger, errorLogger } from "../../util/logger";

let configNet = makerConfig["loopring"].Mainnet;

export default {
  getUserAPI: function (localChainID) {
    let netWorkID = localChainID == 9 ? 1 : 5;
    return new UserAPI({ chainId: netWorkID });
  },

  getTxList: async function (localChainID) {
    if (localChainID == 99) {
      configNet = makerConfig["loopring"].Rinkeby;
    }

    let url = configNet + "/user/transfers";
    const params = {
      accountId: 93994,
      start: 0,
      end: 9999999999999,
      status: "processed,processing,received",
      limit: 1,
      offset: 0,
      tokenSymbol: "ETH",
      transferTypes: "transfer"
    };
    let apiKey =
      localChainID == 9
        ? makerConfig["loopring"].apiKey
        : makerConfig["loopring"].test_apiKey;

    try {
      const LPTransferResult = await axios.get(url, {
        params: params,
        headers: {
          "X-API-KEY": apiKey
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
