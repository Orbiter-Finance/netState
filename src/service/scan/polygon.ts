// util/ethersca.js
import axios from "axios";
import { makerConfig } from "../../config";
import { accessLogger, errorLogger } from "../../util/logger";

var configNet = makerConfig["polygon"].Mainnet;

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
      apikey: makerConfig["polygon"].key
    };
    if (chainId === 5) {
      configNet = makerConfig["polygon"].Rinkeby;
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
          errorLogger.error("Po No transactions found");

          return {
            code: 1,
            data: "Po No transactions found"
          };
        } else {
          errorLogger.error("Get polygon tx Error =", respData.result);
          return {
            code: 1,
            data: respData.result
          };
        }
      } else {
        errorLogger.error("Po NetWork Error");
        return {
          code: 1,
          data: "Po NetWork Error"
        };
      }
    } catch (error) {
      errorLogger.error("Get polygon tx Error =", error);
      return {
        errorCode: 2,
        errorMsg: error
      };
    }
  },

  getBlockNumberWithTimeStamp: async function (req, chainId) {
    if (chainId == 5) {
      configNet = makerConfig["polygon"].Rinkeby;
    }
    const params = {
      module: "block",
      action: "getblocknobytime",
      timestamp: req.timestamp,
      closest: req.closest,
      apikey: makerConfig["polygon"].key
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
          errorLogger.error("Get polygon blockNum Error =", respData.result);
          return {
            code: 1,
            data: respData.result
          };
        }
      } else {
        errorLogger.error("Get Polygon BlockNum NetError");
        return {
          code: 1,
          data: "Get Polygon BlockNum NetError"
        };
      }
    } catch (error) {
      errorLogger.error("Get polygon blockNum Error =", error);
      return {
        code: 2,
        data: error
      };
    }
  }
};
