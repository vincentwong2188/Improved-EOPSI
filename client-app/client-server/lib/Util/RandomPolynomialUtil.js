const HashTableUtil = require('./HashTableUtil')

class RandomPolynomialUtil {
    static generateRandomPolynomialPointValue = (field, numBins, maximumLoad, tempKey, vectorX) => {
        const generateRandomPolynomial = (field, numBins, maximumLoad, tempKey) => {
            const randomPolynomial = HashTableUtil.initializeHashTable(numBins)
        
            // Creating Random Polynomial
            for (let i = 0; i < numBins; i++) {
                const hashValue = field.prng(BigInt(String(tempKey) + String(i * 20)));
        
                // Creating degree d random polynomial - note: degree d polynomial has d+1 coefficients
                for (let j = 0; j < maximumLoad + 1; j++) {
                    const coefficient = field.prng(BigInt(String(hashValue) + String(j * 20)));
                    randomPolynomial[i].push(coefficient)
                }
            }
            return randomPolynomial
        }
    
        const convertRandomPolynomialToPointValue = (randomPolynomial, vectorX) => {
            const randomPolynomial_PointValue = []
            randomPolynomial.forEach((randomPolynomialInBin) => {
                const polyArray = []
                vectorX.forEach(x => {
                    polyArray.push(field.evalPolyAt(field.newVectorFrom(randomPolynomialInBin), x))
                })
                randomPolynomial_PointValue.push(polyArray)
            })
            return randomPolynomial_PointValue
        }

        const randomPolynomial = generateRandomPolynomial(field, numBins, maximumLoad, tempKey)
        const randomPolynomialPointValue = convertRandomPolynomialToPointValue(randomPolynomial, vectorX)
        return randomPolynomialPointValue
    }
}

module.exports = RandomPolynomialUtil