const galois = require("@guildofweavers/galois");

// Constants

const LARGE_PRIME_NUMBER = 2n ** 256n - 351n * 2n ** 32n + 1n
// const SMALL_PRIME_NUMBER = 1931n
const SMALL_PRIME_NUMBER = 351n * 2n ** 32n + 1n
const SMALLER_PRIME_NUMBER = 97n


// const LARGE_PRIME_NUMBER = 99999989n
// const SMALL_PRIME_NUMBER = 1931n

const field = galois.createPrimeField(LARGE_PRIME_NUMBER);
const smallField = galois.createPrimeField(SMALL_PRIME_NUMBER);
const smallerField = galois.createPrimeField(SMALLER_PRIME_NUMBER);

console.time('Test Time')
const NUMBER_OF_BINS = 20;
const MAXIMUM_LOAD = 100;
const MASTER_KEY_CLIENTA = 218n;
const MASTER_KEY_CLIENTB = 123n;

const ATTRIBUTE_COUNT = 1000

const clientAAttributes = []
const clientBAttributes = []
const vectorX = []

for (let i = 0; i < ATTRIBUTE_COUNT; i++){
    const attributeA = smallerField.rand()
    const attributeB = smallerField.rand()

    clientAAttributes.push(attributeA)
    clientBAttributes.push(attributeB)

}

for (let i = 1; i<= 2* MAXIMUM_LOAD + 1; i++){
    vectorX.push(BigInt(i))
}

console.log('Client A Attributes: ' + clientAAttributes)
console.log('Client B Attributes: ' + clientBAttributes)
console.log('Vector X: ' + vectorX)

// const clientAAttributes = [31n, 49n, 23n, 72n, 28n, 92n, 12n, 2n]
// const clientBAttributes = [23n, 49n, 25n, 31n, 72n, 22n, 50n, 2n]

// const vectorX = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n]

const hashTableClientA = []
const hashTableClientB = []
const hashTablePointValueA = []
const hashTablePointValueB = []
const blindingFactorsA = []
const blindingFactorsB = []
const blindedValuesA = []
const blindedValuesB = []
const randomPolynomialA = []
const randomPolynomialB = []

for (let i = 0; i < NUMBER_OF_BINS; i++) {
    hashTableClientA[i] = []
    hashTableClientB[i] = []
    hashTablePointValueA[i] = []
    hashTablePointValueB[i] = []
    blindingFactorsA[i] = []
    blindingFactorsB[i] = []
    blindedValuesA[i] = []
    blindedValuesB[i] = []
    randomPolynomialA[i] = []
    randomPolynomialB[i] = []
}




// Concatenating the Attribute values with its hash -> attribute||00||hash(attribute)
const clientAConcateAttributes = clientAAttributes.map(attribute => {
    const hashValue = smallField.prng(attribute);
    return BigInt(String(attribute) + "00" + String(hashValue))
})

const clientBConcateAttributes = clientBAttributes.map(attribute => {
    const hashValue = smallField.prng(attribute);
    return BigInt(String(attribute) + "00" + String(hashValue))
})

// Hashing the attributes into bins
clientAConcateAttributes.forEach(attribute => {
    const binValue = Number(attribute) % NUMBER_OF_BINS
    hashTableClientA[binValue].push(attribute)
})

clientBConcateAttributes.forEach(attribute => {
    const binValue = Number(attribute) % NUMBER_OF_BINS
    hashTableClientB[binValue].push(attribute)
})

// Padding the bins up to MAXIMUM_LOAD value
for (let i = 0; i < NUMBER_OF_BINS; i++) {
    const valuesInBinA = hashTableClientA[i].length
    for (let j = 0; j < MAXIMUM_LOAD - valuesInBinA; j++) {
        hashTableClientA[i].push(field.rand())
    }

    const valuesInBinB = hashTableClientB[i].length
    for (let j = 0; j < MAXIMUM_LOAD - valuesInBinB; j++) {
        hashTableClientB[i].push(field.rand())
    }
}

console.log(' ------------------ Hash Table ------------------')
console.log('Hash Table (Client A):')
console.log(hashTableClientA)
console.log()
console.log('Hash Table (Client B):')
console.log(hashTableClientB)
console.log()

// Creating the Polynomials in Point Value Representation
vectorX.forEach(x => {

    for (let i = 0; i < NUMBER_OF_BINS; i++) {
        let answer = 1n;

        hashTableClientA[i].forEach(root => {
            answer = field.mul(answer, field.sub(x, root))
        })
        hashTablePointValueA[i].push(answer)
    }


    for (let i = 0; i < NUMBER_OF_BINS; i++) {
        let answer = 1n;

        hashTableClientB[i].forEach(root => {
            answer = field.mul(answer, field.sub(x, root))
        })
        hashTablePointValueB[i].push(answer)
    }
})

console.log(' ------------------ Hash Table Point Values ------------------')
console.log('Hash Table Point Values (Client A):')
console.log(hashTablePointValueA)
console.log()
console.log('Hash Table Point Values (Client B):')
console.log(hashTablePointValueB)
console.log()


// Creating Blinding Factors

for (let i = 0; i < NUMBER_OF_BINS; i++) {
    const hashValueA = smallField.prng(BigInt(String(MASTER_KEY_CLIENTA) + String(i * 20)));
    const hashValueB = smallField.prng(BigInt(String(MASTER_KEY_CLIENTB) + String(i * 20)));

    for (let j = 0; j < 2 * MAXIMUM_LOAD + 1; j++) {
        let blindingFactorA = smallField.prng(BigInt(String(hashValueA) + String(j * 20)))
        let blindingFactorB = smallField.prng(BigInt(String(hashValueB) + String(j * 20)))

        // To avoid a dividing by zero problem:
        if (blindingFactorA === 0n) {
            blindingFactorA = 1n
        } else if (blindingFactorB === 0n) {
            blindingFactorB = 1n
        }

        blindingFactorsA[i].push(blindingFactorA);
        blindingFactorsB[i].push(blindingFactorB);
    }
}

console.log(' ------------------ Blinding Factors ------------------')
console.log('Blinding Factors (Client A):')
console.log(blindingFactorsA)
console.log()
console.log('Blinding Factors (Client B):')
console.log(blindingFactorsB)
console.log()

// Blinding the Point Value Pairs

const blindingFactorsAMatrix = field.newMatrixFrom(blindingFactorsA)
const blindingFactorsBMatrix = field.newMatrixFrom(blindingFactorsB)

const hashTablePointValueAMatrix = field.newMatrixFrom(hashTablePointValueA)
const hashTablePointValueBMatrix = field.newMatrixFrom(hashTablePointValueB)

const blindedValuesAMatrix = field.divMatrixElements(hashTablePointValueAMatrix, blindingFactorsAMatrix)
const blindedValuesBMatrix = field.divMatrixElements(hashTablePointValueBMatrix, blindingFactorsBMatrix)

console.log(' ------------------ Blinded Values (Matrices) ------------------')
console.log('Blinded Values (Client A):')
console.log(blindedValuesAMatrix)
console.log()
console.log('Blinded Values (Client B):')
console.log(blindedValuesBMatrix)
console.log()

// Initiation of Improved EO-PSI
// Requester: Client B
// Requestee: Client A

// ================================== Client A Executes Computation Delegation ==================================
const TEMPORARY_KEY_A = 321n;

// Creating Random Polynomial
for (let i = 0; i < NUMBER_OF_BINS; i++) {
    const hashValue = field.prng(BigInt(String(TEMPORARY_KEY_A) + String(i * 20)));

    // Creating degree d random polynomial - note: degree d polynomial has d+1 coefficients
    for (let j = 0; j < MAXIMUM_LOAD + 1; j++) {
        const coefficient = field.prng(BigInt(String(hashValue) + String(j * 20)));
        randomPolynomialA[i].push(coefficient)
    }
}

// Converting to Point Value Representation
const randomPolynomialA_PointValue = []
randomPolynomialA.forEach((randomPolynomialInBin) => {
    const polyArray = []
    vectorX.forEach(x => {
        polyArray.push(field.evalPolyAt(field.newVectorFrom(randomPolynomialInBin), x))
    })
    randomPolynomialA_PointValue.push(polyArray)
})

console.log(' ------------------ Random Polynomial (Client A) ------------------')
console.log(randomPolynomialA_PointValue)
console.log()

const randomPolynomialAMatrix = field.newMatrixFrom(randomPolynomialA_PointValue)
const qValuesAMatrix = field.mulMatrixElements(randomPolynomialAMatrix, blindingFactorsAMatrix)

console.log(' ------------------ Q Matrix (Client A) ------------------')
console.log(qValuesAMatrix)
console.log()

// ================================== Cloud Executes Results Computation ==================================

const qPrimeMatrix = field.mulMatrixElements(qValuesAMatrix, blindedValuesAMatrix)

const TEMPORARY_KEY_B = 987n;

// Creating Random Polynomial B
for (let i = 0; i < NUMBER_OF_BINS; i++) {
    const hashValue = field.prng(BigInt(String(TEMPORARY_KEY_B) + String(i * 20)));

    // Creating degree d random polynomial - note: degree d polynomial has d+1 coefficients
    for (let j = 0; j < MAXIMUM_LOAD + 1; j++) {
        const coefficient = field.prng(BigInt(String(hashValue) + String(j * 20)));
        randomPolynomialB[i].push(coefficient)
    }
}

// Converting to Point Value Representation
const randomPolynomialB_PointValue = []
randomPolynomialB.forEach(randomPolynomialInBin => {
    const polyArray = []

    vectorX.forEach(x => {
        polyArray.push(field.evalPolyAt(field.newVectorFrom(randomPolynomialInBin), x))
    })
    randomPolynomialB_PointValue.push(polyArray)
})

console.log(' ------------------ Random Polynomial (Cloud) ------------------')
console.log(randomPolynomialB_PointValue)
console.log()

const randomPolynomialBMatrix = field.newMatrixFrom(randomPolynomialB_PointValue)
const qPrimePrimeMatrix = field.mulMatrixElements(randomPolynomialBMatrix, blindedValuesBMatrix)

console.log(` ------------------  q' and q" Matrices (Cloud) ------------------`)
console.log(`q' Matrix:`)
console.log(qPrimeMatrix)
console.log()
console.log(`q" Matrix:`)
console.log(qPrimePrimeMatrix)
console.log()

// q' + q''(z) = wA T(A) + wB T(B) = g 
// ================================== Client B Executes Results Retrieval ==================================

const gMatrix = field.addMatrixElements(qPrimeMatrix, field.mulMatrixElements(qPrimePrimeMatrix, blindingFactorsBMatrix))
const gValues = gMatrix.toValues()

console.log(` ------------------  g Values (Client B) ------------------`)
console.log(gValues)
console.log()

const resultantPolynomial = []

for (let i = 0; i < NUMBER_OF_BINS; i++) {
    const polynomialYVector = field.newVectorFrom(gValues[i])
    const result = field.interpolate(field.newVectorFrom(vectorX), polynomialYVector)
    resultantPolynomial.push(result)
}

console.log(` ------------------  Results (Client B) ------------------`)
console.log('Resultant Polynomial:')
console.log(resultantPolynomial)
console.log()

const answerArray = []

for (let i = 0; i < NUMBER_OF_BINS; i++) {
    const binAnswerArray = []

    // Fast "Factorisation"
    hashTableClientB[i].forEach(attribute => {
        const yValue = field.evalPolyAt(resultantPolynomial[i], BigInt(attribute))

        if (yValue === 0n) {
            binAnswerArray.push(attribute)
        }
    })

    answerArray.push(binAnswerArray)
}

console.log(` ------------------  Answer Array (Real and Junk Values) ------------------`)
console.log(answerArray)
console.log()

// Removing Fake Attributes from Real Attributes

realAnswerArray = []

answerArray.forEach(bin => {
    if (bin.length !== 0) {
        bin.forEach(answer => {
            const value = String(answer).split('00')[0]
            const hash = String(answer).split('00')[1]

            if (hash !== undefined && BigInt(hash) === smallField.prng(BigInt(value))) {
                realAnswerArray.push(value)
            }

        })
    }
})


console.log(` ------------------  Answer Array (Only Real Values) ------------------`)
console.log(realAnswerArray)
console.log()

console.log('Client A Attributes: ' + clientAAttributes)
console.log('Client B Attributes: ' + clientBAttributes)
console.log('Vector X: ' + vectorX)

console.timeEnd(`Test Time`)
