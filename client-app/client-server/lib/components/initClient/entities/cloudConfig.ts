export default class CloudConfig {
        numBins: number
        numElementsPerBin: number
        finiteFieldNum: bigint
        smallFiniteFieldNum: bigint
        vectorX: bigint[]

        constructor (numBins: number, numElementsPerBin: number, finiteFieldNum: bigint, smallFiniteFieldNum: bigint, vectorX: bigint[]) {
          this.numBins = numBins
          this.numElementsPerBin = numElementsPerBin
          this.finiteFieldNum = finiteFieldNum
          this.smallFiniteFieldNum = smallFiniteFieldNum
          this.vectorX = vectorX
        }
}
