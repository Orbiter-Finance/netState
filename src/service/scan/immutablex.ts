import { IMXHelper } from "./imx_helper";
import { accessLogger, errorLogger } from "../../util/logger";
import { makerConfig } from "../../config";

export default {
  /**
   *
   * @param {number} chainId
   * @returns
   */
  getTxList: async (chainId) => {
    const imxHelper = new IMXHelper(chainId);
    const imxClient = await imxHelper.getImmutableXClient();

    try {
      const resp = await imxClient.getTransfers({
        direction: "desc",
        page_size: 1
      });
      if (!resp?.result || resp.result.length < 1) {
        // 没有交易
        return {
          code: 1,
          data: "no imx transaction"
        };
      }
      for (const item of resp.result) {
        const transaction = imxHelper.toTransaction(item);
        console.log("imxHash =", transaction.hash);
        return {
          code: 0,
          data: transaction.hash
        };
      }
      return {
        code: 1,
        data: "get imx transaction error"
      };
    } catch (error) {
      return {
        code: 2,
        data: error
      };
    }
  }
};
