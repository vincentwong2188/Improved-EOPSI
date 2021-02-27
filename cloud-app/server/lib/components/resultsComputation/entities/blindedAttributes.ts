import { parseStringToMatrix } from '../../../common/util'
export default class BlindedAttributes {
        blindedAttributes: string

        constructor (blindedAttributes: string) {
          this.blindedAttributes = blindedAttributes
        }

        // Convert each string value to big int
        public getParsedBlindedAttributes () {
          return parseStringToMatrix(this.blindedAttributes)
        }
}
