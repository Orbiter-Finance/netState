// util/ethersca.js
import axios from "axios";
import { makerConfig } from "../../config";
import { accessLogger, errorLogger } from "../../util/logger";

var configNet = makerConfig["etherscan"].Mainnet;

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
      apikey: makerConfig["etherscan"].key
    };
    if (chainId === 5) {
      configNet = makerConfig["etherscan"].Rinkeby;
    }
    try {
      let response = await axios.get(configNet, { params });
      if (response.status === 200) {
        var respData = response.data;
        if (respData.status === "1" && respData.message === "OK"&&respData.result[0]) {
          return {
            code: 0,
            data: respData.result[0].hash
          };
        } else if (
          respData.status === "0" &&
          respData.message === "No transactions found"
        ) {
          errorLogger.error("ETH No transactions found");
          return {
            code: 1,
            data: "No transactions found"
          };
        } else {
          errorLogger.error("EthTxError =", respData.result);
          return {
            code: 1,
            data: respData.result
          };
        }
      } else {
        errorLogger.error("ETH NetWork Error");
        return {
          code: 1,
          data: "NetWork Error"
        };
      }
    } catch (error) {
      return {
        errorCode: 2,
        errorMsg: error
      };
    }
  },

  getBlockNumberWithTimeStamp: async function (req, chainId) {
    if (chainId == 5) {
      configNet = makerConfig["etherscan"].Rinkeby;
    }
    const params = {
      module: "block",
      action: "getblocknobytime",
      timestamp: req.timestamp,
      closest: req.closest,
      apikey: makerConfig["etherscan"].key
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
          errorLogger.error("Get Etherscan BlockNum Error =", respData.result);
          return {
            code: 1,
            data: respData.result
          };
        }
      } else {
        errorLogger.error("Get Etherscan BlockNum NetError");
        return {
          code: 1,
          data: "Get Etherscan BlockNum NetError"
        };
      }
    } catch (error) {
      errorLogger.error("Get Etherscan BlockNum Error =", error);
      return {
        code: 2,
        data: error
      };
    }
  }
};
