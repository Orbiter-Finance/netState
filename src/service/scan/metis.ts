import axios from "axios";
import { makerConfig } from "../../config";
import { errorLogger } from "../../util/logger";

let configNet = makerConfig["metis"].Mainnet;

export default {
    getTxList: async function (req, chainId, isTokentx = true) {
        const params = {
            module: 'account',
            action: 'txlist',
            tokenAddress: "0x0000000000000000000000000000000000000000",
            address: makerConfig["makerAddress"],
            startblock: 0,
            endblock: req.end,
            page: req.page,
            offset: req.offset,
            sort: req.sort
        }
        if (chainId == 510) {
            configNet = makerConfig["metis"].Rinkeby
        }
        try {
            const MtTransferResult = await axios.get(configNet, { params })
            if (
                MtTransferResult.status == 200 &&
                MtTransferResult.statusText == "OK"
            ) {
                let txList = MtTransferResult.data;
                if (txList && txList.message == 'OK' && txList.result.length) {
                    return {
                        code: 0,
                        data: txList.result[0].hash
                    };
                } else {
                    errorLogger.error("mt No transactions found");
                    return {
                        code: 1,
                        data: "mt No transactions found"
                    };
                }
            } else {
                errorLogger.error("MTTXNetError");
                return {
                    code: 1,
                    data: "MT TX NetError"
                };
            }
        } catch (error) {
            errorLogger.error("Get metis tx Error =", error);
            return {
                errorCode: 2,
                errorMsg: error
            };
        }

    },
    getBlockNumberWithTimeStamp: async function (req, chainId) {
        if (chainId == 510) {
            configNet = makerConfig["metis"].Rinkeby;
        }
        const params = {
            module: "block",
            action: "getblocknobytime",
            timestamp: req.timestamp,
            closest: req.closest,
        };
        try {
            let response = await axios.get(configNet, { params });
            if (response.status === 200) {
                var respData = response.data;
                if (respData.status === "1" && respData.message === "OK") {
                    return {
                        code: 0,
                        data: respData.result.blockNumber
                    };
                } else {
                    errorLogger.error("Get ok but Metis blockNum Error =", respData.result);
                    return {
                        code: 1,
                        data: respData.result
                    };
                }
            } else {
                errorLogger.error("Get PolMetisgon BlockNum NetError");
                return {
                    code: 1,
                    data: "Get Metis BlockNum NetError"
                };
            }
        } catch (error) {
            errorLogger.error("Get Metis blockNum Error =", error);
            return {
                code: 2,
                data: error
            };
        }
    }
}
