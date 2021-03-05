import sha1 from 'crypto-js/sha1'

export const getHash = ({ name, number } : {name: string, number: number}) => {
  const hash = BigInt(('0x' + sha1(name + number.toString())))
  return hash
}
