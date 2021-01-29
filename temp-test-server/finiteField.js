// import * as galois from '@guildofweavers/galois';
const galois = require("@guildofweavers/galois");

// create a prime field with a large modulus
const field = galois.createPrimeField(5n);

const a = field.rand();     // generate a random field element
const b = field.rand();     // generate another random element
const c = field.div(1n,2n)

console.log(a)
console.log(b)
console.log(c)
