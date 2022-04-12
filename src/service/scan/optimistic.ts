// util/ethersca.js
import axios from "axios";
import { makerConfig } from "../../config";
import { accessLogger, errorLogger } from "../../util/logger";

var configNet = makerConfig["optimistic"].Mainnet;

export default {
  getTxList: async function (req, chainId) {
    const params = {
      module: "account",
      action: "txlist",
      tokenAddress: "0x0000000000000000000000000000000000000000",
      address: makerConfig["makerAddress"],
      startblock: 0,
      endblock: req.end,
      page: req.page,
      offset: req.offset,
      sort: req.sort,
      apikey: makerConfig["optimistic"].key
    };
    if (chainId === 5) {
      configNet = makerConfig["optimistic"].Rinkeby;
    }
    try {
      let response = await axios.get(configNet, { params });
      if (response.status === 200) {
        var respData = response.data;
        if (respData.status === "1" && respData.message === "OK") {
          return {
            code: 0,
            data: respData.result[0].hash
          };
        } else if (
          respData.status === "0" &&
          respData.message === "No transactions found"
        ) {
          errorLogger.error("Op No transactions found");
          return {
            code: 1,
            data: "Op No transactions found"
          };
        } else {
          errorLogger.error("Get Op Tx Error =", respData.result);
          return {
            code: 1,
            data: respData.result
          };
        }
      } else {
        errorLogger.error("Op NetWork Error");
        return {
          code: 1,
          data: "Op NetWork Error"
        };
      }
    } catch (error) {
      errorLogger.error("Get Op Tx Error =", error);
      return {
        errorCode: 2,
        errorMsg: error
      };
    }
  },

  getBlockNumberWithTimeStamp: async function (req, chainId) {
    if (chainId == 5) {
      configNet = makerConfig["optimistic"].Rinkeby;
    }
    const params = {
      module: "block",
      action: "getblocknobytime",
      timestamp: req.timestamp,
      closest: req.closest,
      apikey: makerConfig["optimistic"].key
    };
    try {
      let response = await axios.get(configNet, { params });
      if (response.status === 200) {
        var respData = response.data;
        if (respData.status === "1" && respData.message === "OK") {
          return {
            code: 0,
            data: respData.result
          };
        } else {
          errorLogger.error("Get Op blockNum Error =", respData.result);
          return {
            code: 1,
            data: respData.result
          };
        }
      } else {
        errorLogger.error("Get Optimisim BlockNum NetError");
        return {
          code: 1,
          data: "Get Optimisim BlockNum NetError"
        };
      }
    } catch (error) {
      errorLogger.error("Get Optimisim BlockNum Error =", error);
      return {
        code: 2,
        data: error
      };
    }
  }
};
