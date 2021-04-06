const RandomPolynomialUtil = require('../RandomPolynomialUtil')

class ResultsComputationUtil {
    static generateQPrimePrimeMatrix = (blindedValuesRequesterMatrix, field, numBins, maximumLoad, tempKey, vectorX) => {
        const randomPolynomialB_PointValue = RandomPolynomialUtil.generateRandomPolynomialPointValue(field, numBins, maximumLoad, tempKey, vectorX)
        const randomPolynomialBMatrix = field.newMatrixFrom(randomPolynomialB_PointValue)
        const qPrimePrimeMatrix = field.mulMatrixElements(randomPolynomialBMatrix, blindedValuesRequesterMatrix)
        return qPrimePrimeMatrix
    }
}

module.exports = ResultsComputationUtil