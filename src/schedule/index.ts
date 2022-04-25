import { accessLogger } from "../util/logger";
import {
  jobCheckNet,
  jobDeleteSqlForChain,
  jobInsertSqlForChain
} from "./jobs";

export let checkNets: number[];

if (process.env.NODE_ENV == "development") {
  checkNets = [5, 22, 33, 66, 77, 88, 99, 510];
} else {
  checkNets = [1, 2, 3, 6, 7, 8, 9, 10];
}
export const startJobs = async () => {
  accessLogger.info("doCheckNetStatus job....");
  jobCheckNet(checkNets);
  jobDeleteSqlForChain();
  jobInsertSqlForChain();
};
