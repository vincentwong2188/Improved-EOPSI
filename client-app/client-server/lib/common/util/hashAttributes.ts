import sha1 from 'crypto-js/sha1'

// Returns a 4 + 4 digit number --> Note: this is a non guaranteed unique hash value
export const getHash = ({ name, number } : {name: string, number: number}) => {
  const nameHash = BigInt(('0x' + sha1(name))) % 1000n
  const numberHash = number % 1000
  return BigInt(nameHash.toString() + numberHash.toString())
}
