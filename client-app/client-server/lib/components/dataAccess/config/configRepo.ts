import IconfigRepo from './IconfigRepo'
import { query } from '../../../common/dataAccess/dbAccess'
import { DatabaseError } from '../../../common/Error'

// Accesses data from local database or cloud service
export default class ConfigRepo implements IconfigRepo {
  public async getMasterKey () : Promise<string> {
    try {
      const queryString = 'select value from client.config where key = \'masterkey\''
      const result = await query(queryString)
      return result.rows[0].value
    } catch (e) {
      throw new DatabaseError(e.message)
    }
  }

  public async saveMasterKey (mk: string) : Promise<void> {
    try {
      const queryString = 'insert into client.config (key, value) values ($1, $2) on conflict do nothing' // This assumes that the master key will not be updated. Do an upsert if we want it to be updated
      await query(queryString, ['masterkey', mk])
    } catch (e) {
      throw new DatabaseError(e.message)
    }
  }

  public async saveClientID (clientID: string) : Promise<void> {
    try {
      const queryString = 'insert into client.config (key, value) values ($1, $2) on conflict do nothing' // This assumes that the master key will not be updated. Do an upsert if we want it to be updated
      await query(queryString, ['clientID', clientID])
    } catch (e) {
      throw new DatabaseError(e.message)
    }
  }

  public async getClientID () : Promise<string> {
    try {
      const queryString = 'select value from client.config where key = \'clientID\''
      const result = await query(queryString)
      return result.rows[0].value
    } catch (e) {
      throw new DatabaseError(e.message)
    }
  }
}
