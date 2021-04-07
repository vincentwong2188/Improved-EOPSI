const galois = require("@guildofweavers/galois");

class GaloisUtil {
    static generateGaloisFields = (primeNumbers) => {
        return primeNumbers.map((primeNumber) => galois.createPrimeField(primeNumber))
    }
}

module.exports = GaloisUtil