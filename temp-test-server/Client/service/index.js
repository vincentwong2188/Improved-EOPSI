const HashUtil = require('../../Util/HashUtil')
const ComputationDelegationUtil = require('../../Util/ComputationDelegation.js/ComputationDelegationUtil')
const ResultsRetrievalUtil = require('../../Util/ResultsRetrieval/ResultsRetrievalUtil')
const InitClientUtil = require('../../Util/InitClient/InitClientUtil')

class ClientService {
    clientDA
    cloudInstance; // Remote to communicate with the cloud

    constructor(cloudInstance, clientDA) {
        this.clientDA = clientDA
        this.cloudInstance = cloudInstance
    }

    initClient( {masterKey, attributes, clientID, clientIP }) {
        const { NUMBER_OF_BINS, MAXIMUM_LOAD, SMALL_PRIME_NUMBER, LARGE_PRIME_NUMBER, vectorX }= this.cloudInstance.getCloudConfig()
   
        const hashedAttributes = HashUtil.attributesToHash(attributes)

        // Save masterkey and attributes to DB
        this.clientDA.saveClientID(clientID)
        this.clientDA.saveMasterKey(masterKey)
        this.clientDA.saveAttributes(attributes)
        

        const {blindingFactors, blindedValuesMatrix} = InitClientUtil.getBlindingFactorsAndBlindedValues(hashedAttributes, NUMBER_OF_BINS, MAXIMUM_LOAD, SMALL_PRIME_NUMBER, LARGE_PRIME_NUMBER, vectorX, masterKey)

        this.clientDA.saveBlindingFactors(blindingFactors) // Save blinding factors so that we do not have to recompute during results retrieval
        this.clientDA.saveBlindedValuesMatrix(blindedValuesMatrix)// Save the blinded values so that we dont have to recompuate during results computation
        
        this.cloudInstance.saveClientAttributes({clientID, blindedValuesMatrix}) // Save blinded values to cloud 
        this.cloudInstance.saveClientInstance({clientID, clientIP}) // To simulate the ID to IP retrieval
    }

    // Requestee
    computationDelegation({requesterID}){
        const TEMP_KEY = 321n
        const masterKey = this.clientDA.getMasterKey()
        const blindedValuesMatrix = this.clientDA.getBlindedValuesMatrix()

        const { SMALL_PRIME_NUMBER, LARGE_PRIME_NUMBER, NUMBER_OF_BINS, MAXIMUM_LOAD, vectorX }= this.cloudInstance.getCloudConfig()

        const qPrimeMatrix = ComputationDelegationUtil.generateQPrimeMatrix(SMALL_PRIME_NUMBER, LARGE_PRIME_NUMBER, NUMBER_OF_BINS, MAXIMUM_LOAD, TEMP_KEY, vectorX, masterKey, blindedValuesMatrix)
        
        this.cloudInstance.resultsComputation({requesterID, qPrimeMatrix})
    }

    // Requester
    initPSI({requesteeID}){
        const requesterID = this.clientDA.getClientID()
        const requesteeInstance = this.cloudInstance.getClientIP({clientID: requesteeID}) //TODO:This should be changed to a controller instance instead
        requesteeInstance.computationDelegation({requesterID})
    }

    resultsRetrieval({ qPrimeMatrix, qPrimePrimeMatrix }){

        const { NUMBER_OF_BINS,LARGE_PRIME_NUMBER,SMALL_PRIME_NUMBER, MAXIMUM_LOAD, vectorX }= this.cloudInstance.getCloudConfig()
        const attributes = this.clientDA.getAttributes()
        const hashedAttributes = HashUtil.attributesToHash(attributes)
        const blindingFactors = this.clientDA.getBlindingFactors(); // Stored in initClient

        const realAnswerArray = ResultsRetrievalUtil.resultsRetrieval(SMALL_PRIME_NUMBER, LARGE_PRIME_NUMBER,MAXIMUM_LOAD, NUMBER_OF_BINS,vectorX, blindingFactors, hashedAttributes, qPrimeMatrix, qPrimePrimeMatrix)

        const finalResult = HashUtil.hashToNameAndNumber(attributes, realAnswerArray)
        console.log(finalResult)
    } 

}

module.exports = ClientService