import Igalois from '@guildofweavers/galois'
import { SHA1 } from 'crypto-js'
export const passwordToMk = (password: string, field:Igalois.FiniteField) => {
  const hash = BigInt(`0x${SHA1(password)}`)
  const mk = field.prng(hash).toString()
  return mk
}
