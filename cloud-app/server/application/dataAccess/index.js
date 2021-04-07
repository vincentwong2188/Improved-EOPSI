
class CloudMemDA {
    cloudDB; 

    constructor(cloudDB){
        this.cloudDB = cloudDB
    }
    saveClientAttributes(clientID, blindedValuesMatrix){
        this.cloudDB.saveClientAttributes(clientID, blindedValuesMatrix)
    }
    saveClientInstance(clientID, clientInstance){
        this.cloudDB.saveClientInstance(clientID, clientInstance)
    }
    getClientIP(clientID){
        return this.cloudDB.clientIDtoIPMap[clientID]
    }
    getBlindedValuesMatrix(clientID){
        return this.cloudDB.blindedValuesMatrixMap[clientID]
    }
}


module.exports = CloudMemDA