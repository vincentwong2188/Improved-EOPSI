const AttributeUtil = require("../AttributeUtil");
const GaloisUtil = require('../GaloisUtil')
const HashTableUtil = require('../HashTableUtil')

class ResultsRetrievalUtil {

    static resultsRetrieval = (smallPrimeNum, largePrimeNum,maximumLoad, numBins,vectorX, blindingFactors, hashedAttributes, qPrimeMatrix, qPrimePrimeMatrix) => {
        const [smallField, field] = GaloisUtil.generateGaloisFields([smallPrimeNum,largePrimeNum])
        const blindingFactorsMatrix = field.newMatrixFrom(blindingFactors) 
        const hashTableClient = HashTableUtil.getHashTableFromAttributes(hashedAttributes,numBins, maximumLoad, smallField, smallPrimeNum)
        const realAnswerArray = ResultsRetrievalUtil.retrieveRealResults(qPrimeMatrix, qPrimePrimeMatrix,blindingFactorsMatrix, hashTableClient, field, smallField, numBins, vectorX, smallPrimeNum)
        return realAnswerArray
    }

    static retrieveRealResults = (qPrimeMatrix, qPrimePrimeMatrix, blindingFactorsRequesterMatrix, hashTableRequesterClient, field, smallField, numBins, vectorX, smallPrimeNum) => {
        const retrieveResults = (qPrimeMatrix, qPrimePrimeMatrix, blindingFactorsRequesterMatrix, field, numBins, vectorX) => {
            const generateGValues = (qPrimeMatrix, qPrimePrimeMatrix, blindingFactorsRequesteeMatrix, field) => {
                const gMatrix = field.addMatrixElements(qPrimeMatrix, field.mulMatrixElements(qPrimePrimeMatrix, blindingFactorsRequesteeMatrix))
                const gValues = gMatrix.toValues()
                return gValues
            }
            const gValues = generateGValues(qPrimeMatrix, qPrimePrimeMatrix, blindingFactorsRequesterMatrix, field)
        
            const resultantPolynomial = []
        
            for (let i = 0; i < numBins; i++) {
                const polynomialYVector = field.newVectorFrom(gValues[i])
                const result = field.interpolate(field.newVectorFrom(vectorX), polynomialYVector)
                resultantPolynomial.push(result)
            }
            return resultantPolynomial
        }
    
        const getAnswerArray = (numBins, requesterHashTable, resultantPolynomial) => {
            const answerArray = []
            for (let i = 0; i < numBins; i++) {
                const binAnswerArray = []
            
                // Fast "Factorisation"
                requesterHashTable[i].forEach(attribute => {
                    const yValue = field.evalPolyAt(resultantPolynomial[i], BigInt(attribute))
            
                    if (yValue === 0n) {
                        binAnswerArray.push(attribute)
                    }
                })
                answerArray.push(binAnswerArray)
            }
            return answerArray
        }
    
        // Removing Fake Attributes from Real Attribute
        const getRealAnswers = (answerArray) => {
            const realAnswerArray = []
            answerArray.forEach(bin => {
                if (bin.length !== 0) {
                    bin.forEach(answer => {
                        const {realValue, value } = AttributeUtil.checkHashValue(answer,smallField,smallPrimeNum)
                        if(realValue){
                            realAnswerArray.push(value)
                        }
                    })
                }
            })
            return realAnswerArray
        }
        
        const resultantPolynomial = retrieveResults(qPrimeMatrix, qPrimePrimeMatrix, blindingFactorsRequesterMatrix, field, numBins, vectorX)
        const answerArray = getAnswerArray(numBins, hashTableRequesterClient, resultantPolynomial)
        const realAnswerArray = getRealAnswers(answerArray)
        return realAnswerArray
    }
}

module.exports = ResultsRetrievalUtil