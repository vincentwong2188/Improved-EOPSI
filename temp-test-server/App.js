const TestDataUtil = require('./Util/TestDataUtil')

const CloudController = require('./Cloud/controller');
const ClientController = require('./Client/controller');
const ClientService = require('./Client/service');
const ClientMemDB = require('./Client/db/memDB');
const ClientMemDA = require('./Client/dataAccess/memDA');
const CloudMemDB = require('./Cloud/db')
const CloudMemDA = require('./Cloud/dataAccess')
const CloudService = require('./Cloud/service')

/**
 * Initializations
 */
const cloudDBInstance = new CloudMemDB()
const cloudMemDA = new CloudMemDA(cloudDBInstance)
const cloudServiceInstance = new CloudService(cloudMemDA);
const cloudContoller = new CloudController(cloudServiceInstance);

// Client A
const clientDBInstanceA = new ClientMemDB(); // TODO: This will be removed
const clientDA_A = new ClientMemDA(clientDBInstanceA)

const clientA = new ClientService(cloudContoller, clientDA_A); 
const clientAController = new ClientController(clientA)


const initClientARequest = {
    clientID: 'A',
    masterKey: 123451231n,
    attributes: TestDataUtil.generateRandomNameAndNumbers(100)
}

clientAController.initClient(initClientARequest)


// Client B
const clientDBInstanceB = new ClientMemDB();
const clientDA_B = new ClientMemDA(clientDBInstanceB)

const clientB = new ClientService(cloudContoller, clientDA_B);
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
 * - Put the services in typescript and test run the build file
 * - Make the services send strings instead of matrices
 * - Make Init PSI wait and the retrieve the results
 * - Split to different files
 */
