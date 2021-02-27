/**
 * DB Configurations
 */

import pg from 'pg'
import { user, password, database, host, port } from '../../config/database'
const Pool = pg.Pool

const pool = new Pool({
  user,
  password,
  database,
  host,
  port
}) 

export const query = (text, params, callback) => {
  return pool.query(text, params, callback)
}
