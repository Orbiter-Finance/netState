import schedule from "node-schedule";
import { accessLogger, errorLogger } from "../util/logger";
import checknet from "../service/checknet";
import { insertChainsNetState, deleteChainsNetState } from "../service/chainToSql"

class MJob {
  protected rule:
    | string
    | number
    | schedule.RecurrenceRule
    | schedule.RecurrenceSpecDateRange
    | schedule.RecurrenceSpecObjLit
    | Date;
  protected callback?: () => any;
  protected jobName?: string;

  /**
   * @param rule
   * @param callback
   * @param completed
   */
  constructor(
    rule:
      | string
      | number
      | schedule.RecurrenceRule
      | schedule.RecurrenceSpecDateRange
      | schedule.RecurrenceSpecObjLit
      | Date,
    callback?: () => any,
    jobName?: string
  ) {
    this.rule = rule;
    this.callback = callback;
    this.jobName = jobName;
  }

  public schedule(): schedule.Job {
    return schedule.scheduleJob(this.rule, async () => {
      try {
        this.callback && (await this.callback());
      } catch (error) {
        let message = `MJob.schedule error: ${error.message}, rule: ${this.rule}`;
        if (this.jobName) {
          message += `, jobName: ${this.jobName}`;
        }
        errorLogger.error(message);
      }
    });
  }
}

// Pessimism Lock Job
class MJobPessimism extends MJob {
  public schedule(): schedule.Job {
    let pessimismLock = false;

    const _callback = this.callback;

    this.callback = async () => {
      if (pessimismLock) {
        return;
      }
      pessimismLock = true;

      try {
        _callback && (await _callback());
      } catch (error) {
        throw error;
      } finally {
        // Always release lock
        pessimismLock = false;
      }
    };

    return super.schedule();
  }
}

export function jobCheckNet(chains: number[]) {
  const callback = async () => {
    checknet.startCheckNet(chains);
  };

  new MJobPessimism("*/10 * * * * *", callback, jobCheckNet.name).schedule();
}

export function jobDeleteSqlForChain() {
  const callback = async () => {
    deleteChainsNetState();
  };
  new MJobPessimism("00 59 23 * * *", callback, jobDeleteSqlForChain.name).schedule();

}

export function jobInsertSqlForChain() {
  const callback = async () => {
    let chainsInfo = checknet.getAllChainNetState()
    let sqlReq: any[] = []
    for (let key in chainsInfo) {
      let item = chainsInfo[key]
      item.created_at = new Date().getTime()
      sqlReq.push(item)
    }
    await insertChainsNetState(sqlReq);
    for (let key in chainsInfo) {
      chainsInfo[key].ten_minite_net_state = false
    }
  };

  new MJobPessimism("0 */10 * * * *", callback, jobInsertSqlForChain.name).schedule();
}
