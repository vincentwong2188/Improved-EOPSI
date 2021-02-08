// import * as galois from '@guildofweavers/galois';
const galois = require("@guildofweavers/galois");

// create a prime field with a large modulus
// const field = galois.createPrimeField(31n);

// const a = field.rand();     // generate a random field element
// const b = field.rand();     // generate another random element
// const c = field.div(1n,2n)

// console.log(a)
// console.log(b)
// console.log(c)

const field = galois.createPrimeField(31n);

const numBins = 3;
const binSize = 5;
const masterKey = field.rand();
const x = [17n, 19n, 26n, 21n, 30n, 20n, 14n, 3n, 22n, 29n, 27n];
const binKeys = field.prng(masterKey,numBins).toValues();

const bin1 = [2n,5n,7n,9n,13n];
const bin2 = [14n,4n,3n,8n,12n];
const bin3 = [1n,6n,11n,15n,10n];
const bins = [[2n,5n,7n,9n,13n],[14n,4n,3n,8n,12n],[1n,6n,11n,15n,10n]];

var polynomials = [];

for(var i=0; i<numBins; i++) {
    let temp = [];

    for(var j=0; j<binSize; j++) {
        let y = 1n;

        for(var k=0; k<x.length; k++) {
            y = field.mul(y,field.sub(x[k],bins[i][j]));
        }

        temp.push(y)
    }

    polynomials.push(temp)
}

var pointValues = []

for(var i=0; i<numBins; i++) {
    let temp = [];
    let vec = field.newVectorFrom(polynomials[i]);

    for(var j=0; j<x.length; j++) {
        temp.push(field.evalPolyAt(vec,x[j]))
    }

    pointValues.push(field.newVectorFrom(temp))
}

var blindingValues = [];

for(var i=0; i<numBins; i++) {
    blindingValues.push(field.prng(binKeys[i],x.length))
}

var blindedValues = [];

for(var i=0; i<numBins; i++) {
    blindedValues.push(field.addVectorElements(pointValues[i],blindingValues[i]).toValues())
}

var blindedMatrix = field.newMatrixFrom(blindedValues);