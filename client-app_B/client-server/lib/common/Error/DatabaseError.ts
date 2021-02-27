export default class DatabaseError extends Error {
  constructor (m: string) {
    super(m)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DatabaseError.prototype)
  }
}
