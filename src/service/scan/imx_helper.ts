import { ETHTokenType, ImmutableXClient } from "@imtbl/imx-sdk";
import { makerConfig } from "../../config";

const CONTRACTS = {
  ropsten: {
    starkContractAddress: "0x4527BE8f31E2ebFbEF4fCADDb5a17447B27d2aef",
    registrationContractAddress: "0x6C21EC8DE44AE44D0992ec3e2d9f1aBb6207D864"
  },
  mainnet: {
    starkContractAddress: "0x5FDCCA53617f4d2b9134B29090C87D01058e27e9",
    registrationContractAddress: "0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c"
  }
};

const IMMUTABLEX_CLIENTS = {};

export class IMXHelper {
  publicApiUrl = "";
  starkContractAddress = "";
  registrationContractAddress = "";

  /**
   * @param {number} chainId
   */
  constructor(chainId) {
    if (chainId == 8) {
      this.publicApiUrl = makerConfig.immutableX.Mainnet;
      this.starkContractAddress = CONTRACTS.mainnet.starkContractAddress;
      this.registrationContractAddress =
        CONTRACTS.mainnet.registrationContractAddress;
    }
    if (chainId == 88) {
      this.publicApiUrl = makerConfig.immutableX.Rinkeby;
      this.starkContractAddress = CONTRACTS.ropsten.starkContractAddress;
      this.registrationContractAddress =
        CONTRACTS.ropsten.registrationContractAddress;
    }
  }

  /**
   * @param {string | number | undefined} addressOrIndex
   * @param {boolean} alwaysNew
   * @returns {Promise<ImmutableXClient>}
   */
  async getImmutableXClient(addressOrIndex = "", alwaysNew = false) {
    const immutableXClientKey = String(addressOrIndex);

    if (IMMUTABLEX_CLIENTS[immutableXClientKey] && !alwaysNew) {
      return IMMUTABLEX_CLIENTS[immutableXClientKey];
    }

    if (!this.starkContractAddress) {
      throw new Error("Sorry, miss param [starkContractAddress]");
    }
    if (!this.registrationContractAddress) {
      throw new Error("Sorry, miss param [registrationContractAddress]");
    }
    let signer = undefined;
    return (IMMUTABLEX_CLIENTS[immutableXClientKey] =
      await ImmutableXClient.build({
        publicApiUrl: this.publicApiUrl,
        signer,
        starkContractAddress: this.starkContractAddress,
        registrationContractAddress: this.registrationContractAddress
      }));
  }

  /**
   * IMX transfer => Eth transaction
   * @param {any} transfer IMX transfer
   * @returns
   */
  toTransaction(transfer) {
    const timeStampMs = transfer.timestamp.getTime();

    // When it is ETH
    let contractAddress = transfer.token.data.token_address;
    if (transfer.token.type == ETHTokenType.ETH) {
      contractAddress = "0x0000000000000000000000000000000000000000";
    }

    const transaction = {
      timeStamp: parseInt(String(timeStampMs / 1000)),
      hash: transfer.transaction_id,
      blockHash: "",
      transactionIndex: 0,
      from: transfer.user,
      to: transfer.receiver,
      value: transfer.token.data.quantity + "",
      txreceipt_status: transfer.status,
      contractAddress,
      confirmations: 0
    };

    return transaction;
  }
}
