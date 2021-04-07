
const ResultsComputationUtil = require('../../Util/ResultsComputation/ResultsComputationUtil')
const GaloisUtil = require('../../Util/GaloisUtil')

class CloudService {
    cloudDA;

    constructor (cloudDA) {
      this.cloudDA = cloudDA
    }

    getCloudConfig = () => {
      const NUMBER_OF_BINS = 26
      const MAXIMUM_LOAD = 100
      const LARGE_PRIME_NUMBER = 1044444166666668888888889999999999n
      const SMALL_PRIME_NUMBER = 6435409832617n
      const vectorX = []
      for (let i = 1; i <= 2 * MAXIMUM_LOAD + 1; i++) {
        vectorX.push(BigInt(i))
      }
      return { NUMBER_OF_BINS, MAXIMUM_LOAD, LARGE_PRIME_NUMBER, SMALL_PRIME_NUMBER, vectorX }
    }

    getClientIP = (clientID) => {
      // TODO: Check should be dont at the DA layer
      if (!this.cloudDA.getClientIP(clientID)) {
        throw new Error('This client cannot be found')
      }
      return this.cloudDA.getClientIP(clientID)
    }

    saveClientAttributes (clientID, attributes) {
      this.cloudDA.saveClientAttributes(clientID, attributes)
    }

    saveClientInstance (clientID, clientInstance) {
      this.cloudDA.saveClientInstance(clientID, clientInstance)
    }

    resultsComputation (request) {
      const TEMP_KEY = 987n
      const { requesterID, qPrimeMatrix } = request
      const requesterInstance = this.cloudDA.getClientIP(requesterID)
      const requesterBlindedValuesMatrix = this.cloudDA.getBlindedValuesMatrix(requesterID)

      const { NUMBER_OF_BINS, MAXIMUM_LOAD, LARGE_PRIME_NUMBER, vectorX } = this.getCloudConfig()
      const [field] = GaloisUtil.generateGaloisFields([LARGE_PRIME_NUMBER])

      const qPrimePrimeMatrix = ResultsComputationUtil.generateQPrimePrimeMatrix(requesterBlindedValuesMatrix, field, NUMBER_OF_BINS, MAXIMUM_LOAD, TEMP_KEY, vectorX)

      requesterInstance.resultsRetrieval({ qPrimeMatrix, qPrimePrimeMatrix })
    }
}

module.exports = CloudService
