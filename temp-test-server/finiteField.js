const galois = require("@guildofweavers/galois");

// create a prime field with a large modulus
const field = galois.createPrimeField(2n ** 256n - 351n * 2n ** 32n + 1n);

const a = field.rand();     // generate a random field element
const b = field.rand();     // generate another random element
const c = field.exp(a, b);  // do some math

console.log(a)
console.log(b)
console.log(c)