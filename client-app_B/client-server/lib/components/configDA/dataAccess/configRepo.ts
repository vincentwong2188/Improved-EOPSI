
import IConfigRepo from './IConfigRepo'
import { query } from '../../../common/dataAccess/dbAccess'

// Accesses data from local database or cloud service
export default class ConfigRepo implements IConfigRepo {
  public async getClientID () : Promise<string> {
    try {
      const queryString = 'select * from client.config'
      const result = await query(queryString)
      let name = ''
      result.rows.forEach(({ key, value }: {key: string, value: string}) => {
        if (key === 'clientID') {
          name = value
        }
      })
      if (!name) {
        throw new Error('client ID does not exit in Database')
      }
      return name
    } catch (e) {
      throw new Error('error retreiving client id ')
    }
  }

  public async getClientPassword () : Promise<string> {
    const queryString = 'select * from client.config'
    const result = await query(queryString)
    let password = ''
    result.rows.forEach(({ key, value }: {key: string, value: string}) => {
      if (key === 'name') {
        password = value
      }
    })
    return password
  }
}
