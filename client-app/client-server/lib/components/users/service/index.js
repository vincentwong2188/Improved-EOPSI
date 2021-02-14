import { Service } from 'typedi'
import { query } from '../../../common/dataAccess/dbAccess'

@Service()
export default class UserService {
  async GetUsers () {
    const queryString = 'select * from client.users'
    const result = await query(queryString)

    return { users: result.rows }
  }
}
