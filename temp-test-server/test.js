const galois = require("@guildofweavers/galois");
const {concatenateAttribute, checkHashValue} = require("./util"); 

// Test the hashing function

const attribute = 10n
const SMALL_PRIME_NUMBER = 351n * 2n ** 32n + 1n
const field = galois.createPrimeField(SMALL_PRIME_NUMBER)


for (let i=0; i< 50000; i++){
    const attribute = BigInt(i)
    const concatenatedAttribute = concatenateAttribute(attribute, field, SMALL_PRIME_NUMBER)
    const { value, realValue } = checkHashValue(concatenatedAttribute,field,SMALL_PRIME_NUMBER)
    if(!realValue){
        console.log(value)
    }
}