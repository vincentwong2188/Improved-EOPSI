// Client
class ClientController {
    clientServiceInstance;

    constructor (clientServiceInstance) {
      this.clientServiceInstance = clientServiceInstance
    }

    initClient (request) {
      const { masterKey, attributes, clientID } = request
      return new Promise((resolve, reject) => {
        resolve(this.clientServiceInstance.initClient({ masterKey, attributes, clientID, clientIP: this })
        )
      })
    }

    initPSI (request) {
      const { requesteeID } = request
      return new Promise((resolve, reject) => {
        resolve(this.clientServiceInstance.initPSI({ requesteeID }))
      })
    }

    computationDelegation (request) {
      const { requesterID } = request
      return new Promise((resolve, reject) => {
        resolve(this.clientServiceInstance.computationDelegation({ requesterID }))
      })
    }

    resultsRetrieval (request) {
      const { qPrimeMatrix, qPrimePrimeMatrix } = request
      this.clientServiceInstance.resultsRetrieval({ qPrimeMatrix, qPrimePrimeMatrix })
    }
}

module.exports = ClientController
