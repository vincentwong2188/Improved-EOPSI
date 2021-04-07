class CloudController {
    cloudService;
    constructor (cloudService) {
      this.cloudService = cloudService
    }

    getCloudConfig () {
      return this.cloudService.getCloudConfig()
    }

    getClientIP (request) {
      const { clientID } = request
      return this.cloudService.getClientIP(clientID)
    }

    saveClientAttributes (request) {
      const { clientID, blindedValuesMatrix } = request
      this.cloudService.saveClientAttributes(clientID, blindedValuesMatrix)
    }

    // TODO: Call this save client IP instead
    saveClientInstance (request) {
      const { clientID, clientIP } = request
      this.cloudService.saveClientInstance(clientID, clientIP)
    }

    resultsComputation (request) {
      const { requesterID, qPrimeMatrix } = request
      this.cloudService.resultsComputation({ requesterID, qPrimeMatrix })
    }
}

module.exports = CloudController
