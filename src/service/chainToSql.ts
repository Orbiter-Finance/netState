import { Repository, getConnection, Between } from 'typeorm'

import { Core } from '../util/core'
import { ChainNetState } from '../model/chainNetState'
import { errorLogger } from '../util/logger'
const repositoryChainNetState = (): Repository<ChainNetState> => {
    return Core.db.getRepository(ChainNetState)
}
export async function getAllChainsNetState(startTime, endTime, count = 5) {

    try {
        const chainsNetState = await repositoryChainNetState().find({
            created_at: Between(startTime, endTime)
        })
        return chainsNetState
    } catch (error) {
        if (count <= 0) {
            errorLogger.error('chain-info can not pull from sql. Error=', error)
        } else {
            return getAllChainsNetState(startTime, endTime, count--)
        }
    }
}

export async function insertChainsNetState(sqlReq, count = 5) {
    try {
        const chainNetState = repositoryChainNetState()
        const chainInfos = chainNetState.create(sqlReq)
        await chainNetState.save(chainInfos)
    } catch (error) {
        errorLogger.error('chain-info can not insert into sql. Error=', error)
        if (count > 0) {
            return insertChainsNetState(sqlReq, --count)
        }
    }
}

export async function deleteChainsNetState(count = 5) {
    try {
        const lastDayTime = new Date().getTime() - 2592000000
        await getConnection()
            .createQueryBuilder()
            .delete()
            .from(ChainNetState)
            .where(`created_at < ${lastDayTime}`)
            .execute();
    } catch (error) {
        errorLogger.error('chain-info can not deleted from sql. Error=', error)
        if (count > 0) {
            return deleteChainsNetState(--count)
        }
    }
}