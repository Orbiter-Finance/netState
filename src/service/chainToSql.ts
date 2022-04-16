import { Repository, getConnection, MoreThanOrEqual } from 'typeorm'

import { Core } from '../util/core'
import { ChainNetState } from '../model/chainNetState'
import { errorLogger } from '../util/logger'
const repositoryChainNetState = (): Repository<ChainNetState> => {
    return Core.db.getRepository(ChainNetState)
}
export async function getAllChainsNetState(count = 5) {
    const lastDayTime = new Date().getTime() - 43200000
    try {
        const chainsNetState = await repositoryChainNetState().find({
            created_at: MoreThanOrEqual(lastDayTime)
        })
        return chainsNetState
    } catch (error) {
        if (count <= 0) {
            errorLogger.error('chain-info can not pull from sql. Error=', error)
        } else {
            return getAllChainsNetState(count--)
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
        const lastDayTime = new Date(new Date().getTime() - 2592000000)
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