// This layer implements the methods that CloudController has --> This is used to communicate with the cloud

class CloudCommunicator {
  getCloudConfig () {
    console.log('get cloud config')
  }

  getClientIP (clientID: string) {
    console.log('get client ip')
  }

  // TODO: FIX ANY
  saveClientAttributes (clientID: string, blindedValuesMatrix: any) {
    console.log('save client attributes')
  }

  // TODO: Call this save client IP instead
  saveClientInstance (clientID: string, clientIP: string) {
    console.log('save client id')
  }

  // TODO: FIX ANY
  resultsComputation (requesterID: string, qPrimeMatrix: any) {
    console.log('results computation')
  }
}

export default CloudCommunicator
