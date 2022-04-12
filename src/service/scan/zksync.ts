// util/thirdapi.js
import axios from "axios";
import { makerConfig } from "../../config";
import { accessLogger, errorLogger } from "../../util/logger";

export default {
  getTxList: async function (req, chainID) {
    console.log("getzkTxList");
    var params = {
      from: req.from,
      limit: req.limit,
      direction: req.direction
    };
    const url =
      (chainID === 33
        ? makerConfig["zkSync"].Rinkeby
        : makerConfig["zkSync"].Mainnet) +
      "/accounts/" +
      makerConfig["makerAddress"] +
      "/transactions";

    try {
      let response = await axios.get(url, { params: params });
      console.log("zktxresp");
      if (response.status === 200) {
        var respData = response.data;
        if (respData.status === "success") {
          return {
            code: 0,
            data: respData.result.list[0].txHash
          };
        } else {
          errorLogger.error("Get zksync tx Error =", respData);
          return {
            code: 1,
            data: respData
          };
        }
      } else {
        errorLogger.error("ZK NetWorkError");
        return {
          code: 1,
          data: "ZK NetWorkError"
        };
      }
    } catch (error) {
      errorLogger.error("Get zksync tx Error =", error);
      return {
        code: 2,
        data: error
      };
    }
  },

  //    https://api.zksync.io/api/v0.2/networkStatus

  getZkNetStatus: async function (chainId) {
    console.log("getZkNetStatus");
    const url =
      (chainId === 33
        ? makerConfig["zkSync"].Rinkeby
        : makerConfig["zkSync"].Mainnet) + "/networkStatus";
    try {
      let response = await axios.get(url);
      console.log("zkstateresp");
      if (response.status === 200) {
        var respData = response.data;
        if (respData.status === "success") {
          return {
            code: 0,
            data: respData.result.totalTransactions
          };
        } else {
          errorLogger.error("Get zksync blockNum Error =", respData.error);
          return {
            code: 1,
            data: respData.error
          };
        }
      } else {
        errorLogger.error("ZK NetWorkError");
        return {
          code: 1,
          data: "ZK NetWorkError"
        };
      }
    } catch (error) {
      errorLogger.error("Get zksync blockNum Error =", error);
      return {
        code: 2,
        data: error
      };
    }
  }
};
