
import IConfigRepo from './IConfigRepo'
import { query } from '../../../common/dataAccess/dbAccess'

// Accesses data from local database or cloud service
export default class ConfigRepo implements IConfigRepo {
  public async getClientID () : Promise<string> {
    const queryString = 'select * from client.config'
    const result = await query(queryString)
    let name = ''
    result.rows.forEach(({ key, value }: {key: string, value: string}) => {
      if (key === 'clientid') {
        name = value
      }
    })
    return name
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
