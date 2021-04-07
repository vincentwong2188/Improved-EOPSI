const RandomPolynomialUtil = require('../RandomPolynomialUtil')
const GaloisUtil = require('../GaloisUtil')
const BlindingFactorsUtil = require('../BlindingFactorsUtil')
class ComputationDelegationUtil {
    static generateQPrimeMatrix = (smallPrimeNum, largePrimeNum, numBins, maximumLoad, tempKey, vectorX, masterKey, blindedValuesMatrix) => {
        const generateQPrimeMatrix = (blindingFactorsA, blindedValuesMatrix, numBins, maximumLoad, tempKey, field, vectorX) => {
            const blindingFactorsAMatrix = field.newMatrixFrom(blindingFactorsA)
            const randomPolynomialA_PointValue = RandomPolynomialUtil.generateRandomPolynomialPointValue(field, numBins, maximumLoad, tempKey, vectorX)
            const randomPolynomialAMatrix = field.newMatrixFrom(randomPolynomialA_PointValue)
            const qValuesAMatrix = field.mulMatrixElements(randomPolynomialAMatrix, blindingFactorsAMatrix)
            const qPrimeMatrix = field.mulMatrixElements(qValuesAMatrix, blindedValuesMatrix)
            return qPrimeMatrix
        }
        const [smallField, field] = GaloisUtil.generateGaloisFields([smallPrimeNum, largePrimeNum])
        const blindingFactors = BlindingFactorsUtil.generateBlindingFactors(masterKey, smallField, numBins, maximumLoad)
        const qPrimeMatrix = generateQPrimeMatrix(blindingFactors, blindedValuesMatrix, numBins, maximumLoad, tempKey, field, vectorX)
        return qPrimeMatrix
    }

  
}
module.exports = ComputationDelegationUtil