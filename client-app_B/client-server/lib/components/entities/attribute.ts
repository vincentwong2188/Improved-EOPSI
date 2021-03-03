import galois from '@guildofweavers/galois'

export default class Attribute {
  number: number
  name: string
  hashedValue?: bigint
  field?: galois.FiniteField
  getHash?: ({ name, number } : {name: string, number: number}) => bigint

  constructor (name: string, number: number, { hashedValue, field, getHash } : {hashedValue?: string, field?: galois.FiniteField, getHash?: ({ name, number } : {name: string, number: number}) => bigint}) {
    this.name = name
    this.number = number
    this.field = field
    this.getHash = getHash
    this.hashedValue = BigInt(hashedValue)
  }

  /**
   * Returns a hashed value based on name and number
   * This value is used in the database as the primary key, and will be used as the attribute used for comparison.
   * Hash function and field is injected into this layer from the controller layer
   */
  public getHashedValue = () => {
    if (!this.hashedValue && this.field && this.getHash) {
      return this.field.prng(this.getHash({ name: this.name, number: this.number }))
    } else if (this.hashedValue) {
      return this.hashedValue
    } else {
      throw new Error('Problem with getting hashed value, check attributes entity')
    }
  }
}
