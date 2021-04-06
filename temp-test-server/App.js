const TestDataUtil = require('./Util/TestDataUtil')
const HashUtil = require('./Util/HashUtil')
const ComputationDelegationUtil = require('./Util/ComputationDelegation.js/ComputationDelegationUtil')
const ResultsComputationUtil = require('./Util/ResultsComputation/ResultsComputationUtil')
const ResultsRetrievalUtil = require('./Util/ResultsRetrieval/ResultsRetrievalUtil')
const GaloisUtil = require('./Util/GaloisUtil')
const InitClientUtil = require('./Util/InitClient/InitClientUtil')

class Cloud {
    cloudDB; 

    constructor(cloudDB) {
        this.cloudDB = cloudDB
    }
    getCloudConfig = () => {
        const NUMBER_OF_BINS = 26;
        const MAXIMUM_LOAD = 100;
        const LARGE_PRIME_NUMBER =  1044444166666668888888889999999999n
        const SMALL_PRIME_NUMBER = 6435409832617n
        const vectorX = []
        for (let i = 1; i<= 2* MAXIMUM_LOAD + 1; i++){
            vectorX.push(BigInt(i))
        }
        return { NUMBER_OF_BINS,MAXIMUM_LOAD, LARGE_PRIME_NUMBER, SMALL_PRIME_NUMBER, vectorX }
    }
    

    getClientIP = (clientID) => {
        if(!this.cloudDB.clientIDtoIPMap[clientID]){
            throw new Error("This client cannot be found")
        }
        return this.cloudDB.clientIDtoIPMap[clientID]
    }

    saveClientAttributes(clientID, attributes) {
        this.cloudDB.saveClientAttributes(clientID, attributes)
    }
    saveClientInstance(clientID, clientInstance) {
        this.cloudDB.saveClientInstance(clientID, clientInstance)
    }

    resultsComputation(request) {
        const TEMP_KEY = 987n;
        const {requesterID, qPrimeMatrix} = request
        const requesterInstance = this.cloudDB.clientIDtoIPMap[requesterID]

        const requesterBlindedValuesMatrix = this.cloudDB.blindedValuesMatrixMap[requesterID] // Retreive blinded values from database
        
        const { NUMBER_OF_BINS, MAXIMUM_LOAD, LARGE_PRIME_NUMBER, vectorX } = this.getCloudConfig() 
        const [field] = GaloisUtil.generateGaloisFields([LARGE_PRIME_NUMBER])

        const qPrimePrimeMatrix = ResultsComputationUtil.generateQPrimePrimeMatrix(requesterBlindedValuesMatrix,field, NUMBER_OF_BINS, MAXIMUM_LOAD, TEMP_KEY, vectorX)
        
        requesterInstance.resultsRetrieval({qPrimeMatrix, qPrimePrimeMatrix})
    }
}

class CloudDB {
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



// Client 
class ClientController {
    
    clientServiceInstance;

    constructor(clientServiceInstance) {
        this.clientServiceInstance = clientServiceInstance
    }
    initClient(request){
        const {masterKey, attributes, clientID} = request
        this.clientServiceInstance.initClient({masterKey, attributes, clientID, clientIP: this })
    }

    initPSI(request){
        const {requesteeID} = request
        this.clientServiceInstance.initPSI({requesteeID})
    }

    computationDelegation(request){
        const {requesterID} = request
        this.clientServiceInstance.computationDelegation({requesterID})
    }

    resultsRetrieval(request){
        const { qPrimeMatrix, qPrimePrimeMatrix } = request;
        this.clientServiceInstance.resultsRetrieval({qPrimeMatrix, qPrimePrimeMatrix})
    }

}

class ClientService {
    clientDB; // ClientDB instance
    cloudInstance; // Remote to communicate with the cloud

    constructor(clientDB, cloudInstance) {
        this.clientDB = clientDB
        this.cloudInstance = cloudInstance
    }

    initClient( {masterKey, attributes, clientID, clientIP }) {
        const { NUMBER_OF_BINS, MAXIMUM_LOAD, SMALL_PRIME_NUMBER, LARGE_PRIME_NUMBER, vectorX }= this.cloudInstance.getCloudConfig()
   
        const hashedAttributes = HashUtil.attributesToHash(attributes)

        // Save masterkey and attributes to DB
        this.clientDB.clientID = clientID
        this.clientDB.masterKey = masterKey
        this.clientDB.attributes = attributes

        const {blindingFactors, blindedValuesMatrix} = InitClientUtil.getBlindingFactorsAndBlindedValues(hashedAttributes, NUMBER_OF_BINS, MAXIMUM_LOAD, SMALL_PRIME_NUMBER, LARGE_PRIME_NUMBER, vectorX, masterKey)

        this.clientDB.blindingFactors = blindingFactors // Save blinding factors so that we do not have to recompute during results retrieval
        this.clientDB.blindedValuesMatrix = blindedValuesMatrix // Save the blinded values so that we dont have to recompuate during results computation
        
        cloudInstance.saveClientAttributes(clientID, blindedValuesMatrix) // Save blinded values to cloud 
        cloudInstance.saveClientInstance(clientID, clientIP) // To simulate the ID to IP retrieval
    }

    // Requestee
    computationDelegation(request){
        const TEMP_KEY = 321n
        const masterKey = this.clientDB.masterKey
        const blindedValuesMatrix = this.clientDB.blindedValuesMatrix
        const {requesterID} = request

        const { SMALL_PRIME_NUMBER, LARGE_PRIME_NUMBER, NUMBER_OF_BINS, MAXIMUM_LOAD, vectorX }= this.cloudInstance.getCloudConfig()

        const qPrimeMatrix = ComputationDelegationUtil.generateQPrimeMatrix(SMALL_PRIME_NUMBER, LARGE_PRIME_NUMBER, NUMBER_OF_BINS, MAXIMUM_LOAD, TEMP_KEY, vectorX, masterKey, blindedValuesMatrix)
        
        cloudInstance.resultsComputation({requesterID, qPrimeMatrix})
    }

    // Requester
    initPSI(request){
        const requesterID = this.clientDB.clientID;
        const {requesteeID} = request
        const requesteeInstance = cloudInstance.getClientIP(requesteeID) //TODO:This should be changed to a controller instance instead
        requesteeInstance.computationDelegation({requesterID})
    }

    resultsRetrieval(request){
        const { qPrimeMatrix, qPrimePrimeMatrix } = request;
        const { NUMBER_OF_BINS,LARGE_PRIME_NUMBER,SMALL_PRIME_NUMBER, MAXIMUM_LOAD, vectorX }= this.cloudInstance.getCloudConfig()
        const attributes = this.clientDB.attributes
        const hashedAttributes = HashUtil.attributesToHash(attributes)

        const blindingFactors = this.clientDB.blindingFactors; // Stored in initClient

        const realAnswerArray = ResultsRetrievalUtil.resultsRetrieval(SMALL_PRIME_NUMBER, LARGE_PRIME_NUMBER,MAXIMUM_LOAD, NUMBER_OF_BINS,vectorX, blindingFactors, hashedAttributes, qPrimeMatrix, qPrimePrimeMatrix)

        const finalResult = HashUtil.hashToNameAndNumber(attributes, realAnswerArray)
        console.log(finalResult)
    } 

}


// Data access layer
class ClientMemDA {
    constructor(){
        this.clientDB = new ClientDB()
    }

    saveClientID(clientID){
        this.clientDB.clientID = clientID
    }
    saveMasterKey(masterKey){
        this.clientDB.masterKey = masterKey
    }
    saveAttributes(attributes){
        this.clientDB.attributes = attributes
    }
    saveBlindedValuesMatrix(blindedValuesMatrix){
        this.clientDB.blindedValuesMatrix = blindedValuesMatrix
    }
    saveBlindingFactors(blindingFactors){
        this.clientDB.blindedFactors = blindingFactors
    }

    getClientID() {
        return this.clientDB.clientID
    }
    getMasterKey(){
        return this.clientDB.masterKey
    }
    getAttributes(){
        return this.clientDB.attributes
    }
    getBlindedValuesMatrix(){
        return this.clientDB.blindedValuesMatrix
    }
    getBlindingFactors(){
        return this.clientDB.blindingFactors
    }
}

// Simulates the postgres DB --> All these values should be stored in strings
class ClientDB {
    clientID;
    masterKey;
    attributes;
    blindedValuesMatrix;
    blindingFactors;    
}



/**
 * Initializations
 */
const cloudDBInstance = new CloudDB()
const cloudInstance = new Cloud(cloudDBInstance);


// Client A
const clientDBInstanceA = new ClientDB();
const clientA = new ClientService(clientDBInstanceA, cloudInstance); 
const clientAController = new ClientController(clientA)


const initClientARequest = {
    clientID: 'A',
    masterKey: 123451231n,
    attributes: TestDataUtil.generateRandomNameAndNumbers(100)
}

clientAController.initClient(initClientARequest)


// Client B
const clientDBInstanceB = new ClientDB();
const clientB = new ClientService(clientDBInstanceB, cloudInstance);
const clientBController = new ClientController(clientB)

const initClientBRequest = {
    clientID: 'B',
    masterKey:1234n,
    attributes: TestDataUtil.generateRandomNameAndNumbers(100)
} 

clientBController.initClient(initClientBRequest)
clientB.initPSI({requesteeID: 'A'}) // Client B executes initPSI


/**
 * TODO:
 * - Make all functions a factor of saved attributes
 * - Make the services send strings instead of matrices
 * - Make Init PSI wait and the retrieve the results
 * - Service layer should remain the same when ported over, make sure that all saved and set attributes are stored as strings
 * - Split to different files
 */
