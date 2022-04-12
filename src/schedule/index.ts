import { accessLogger, errorLogger } from "../util/logger";
import { jobChechNet } from "./jobs";
import Axios from "../util/Axios";
Axios.axios();

let checkNets: number[];

export const startJobs = async () => {
  accessLogger.info("doCheckNetStatus job...");
  if (process.env.NODE_ENV == "development") {
    checkNets = [1, 2, 3, 6, 7, 8, 9];
    // checkNets = [9];
  } else {
    checkNets = [1, 2, 3, 6, 7, 8, 9];
  }
  jobChechNet(checkNets);
};
