const {concatenateAttribute } = require("../util");

class HashTableUtil {
    // Get the hashTable with the padded values given the attributes
    static initializeHashTable = (numBins) => {
       const hashTable = []
       for (let i = 0; i < numBins; i++) {
           hashTable[i] = []
       }
       return hashTable
   }

   static getHashTableFromAttributes = (attributes, numBins, maximumLoad, smallField, smallPrimeNumber) => {
       const concatenateAttributes = (attributes,smallField,smallPrimeNumber) => {
           const concatenatedAttributes = attributes.map(attribute => {
               return concatenateAttribute(attribute,smallField,smallPrimeNumber)
            })
           return concatenatedAttributes
       }

       const hashAttributesToBins = (concatenatedAttributes, numBins) => {
           const hashTable = HashTableUtil.initializeHashTable(numBins)
           // Hashing the attributes into bins
           concatenatedAttributes.forEach(attribute => {
               const binValue = Number(attribute) % numBins
               hashTable[binValue].push(attribute)
           })
           return hashTable
       }
       // Note: this mutates the hashtable
       const padBinsInHashTable = (numBins, maximumLoad, hashTable) => {
           // Padding the bins up to maximumLoad value
           for (let i = 0; i < numBins; i++) {
               const values = hashTable[i].length
               for (let j = 0; j < maximumLoad - values; j++) {
                   hashTable[i].push(0n) // For testing purposes
               }
           }
       }
       

       // Concatenating, hashing them into bins, and padding the hashtable
       const concatenatedAttributes = concatenateAttributes(attributes, smallField, smallPrimeNumber)
       const hashTable = hashAttributesToBins(concatenatedAttributes, numBins)
       padBinsInHashTable(numBins, maximumLoad, hashTable)
       return hashTable
   }

   static generatePointValueFromHashTable = (vectorX, largeField, numBins, hashTable) => {
       const hashTablePointValue = HashTableUtil.initializeHashTable(numBins)
       // Creating the Polynomials in Point Value Representation
       vectorX.forEach(x => {
           for (let i = 0; i < numBins; i++) {
               let answer = 1n;
   
               hashTable[i].forEach(root => {
                   answer = largeField.mul(answer, largeField.sub(x, root))
               })
   
               hashTablePointValue[i].push(answer)
           }
       })
       return hashTablePointValue
   }
}

module.exports = HashTableUtil