class CloudMemDB {
    clientIDtoIPMap; // // KV store of [clientID] : client instance
    blindedValuesMatrixMap; // Key Value store for blindedValuesMatrix [clientID: blindedValuesMatrix]
    constructor(){
        this.blindedValuesMatrixMap = {}
        this.clientIDtoIPMap = {}
    }
    
    saveClientAttributes(clientID, blindedValuesMatrix){
        this.blindedValuesMatrixMap[clientID] = blindedValuesMatrix
    }

    saveClientInstance(clientID, clientInstance){
        this.clientIDtoIPMap[clientID] = clientInstance
    }
}

module.exports = CloudMemDB