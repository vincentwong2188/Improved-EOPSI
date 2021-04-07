 const GaloisUtil = require('../GaloisUtil');
 const HashTableUtil = require('../HashTableUtil');
 const BlindingFactorsUtil = require('../BlindingFactorsUtil')
 

 class InitClientUtil{
    static getBlindingFactorsAndBlindedValues = (hashedAttributes, numBins, maximumLoad, smallPrimeNum, largePrimeNum, vectorX, masterKey) => {
        const [smallField, field] = GaloisUtil.generateGaloisFields([smallPrimeNum, largePrimeNum])
        const hashTableClient = HashTableUtil.getHashTableFromAttributes(hashedAttributes,numBins, maximumLoad, smallField, smallPrimeNum)
        const hashTablePointValue = HashTableUtil.generatePointValueFromHashTable(vectorX, field,numBins, hashTableClient)
        const blindingFactors = BlindingFactorsUtil.generateBlindingFactors(masterKey, smallField, numBins, maximumLoad)
        const blindedValuesMatrix = BlindingFactorsUtil.blindPointValues(blindingFactors, hashTablePointValue, field)
        return {blindingFactors, blindedValuesMatrix}
    }
 }

 module.exports = InitClientUtil
 
