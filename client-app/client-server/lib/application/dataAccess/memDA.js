
// TODO: This layer should implement a DA interface
// Data access layer
class ClientMemDA {
    clientDB
    constructor (clientDB) {
      this.clientDB = clientDB
    }

    saveClientID (clientID) {
      this.clientDB.clientID = clientID
    }

    saveMasterKey (masterKey) {
      this.clientDB.masterKey = masterKey
    }

    saveAttributes (attributes) {
      this.clientDB.attributes = attributes
    }

    saveBlindedValuesMatrix (blindedValuesMatrix) {
      this.clientDB.blindedValuesMatrix = blindedValuesMatrix
    }

    saveBlindingFactors (blindingFactors) {
      this.clientDB.blindingFactors = blindingFactors
    }

    getClientID () {
      return this.clientDB.clientID
    }

    getMasterKey () {
      return this.clientDB.masterKey
    }

    getAttributes () {
      return this.clientDB.attributes
    }

    getBlindedValuesMatrix () {
      return this.clientDB.blindedValuesMatrix
    }

    getBlindingFactors () {
      return this.clientDB.blindingFactors
    }
}

module.exports = ClientMemDA
