
export const concatenateAttribute = (attribute: bigint, smallField: any, fieldSize: bigint) => {
  const hashValue = String(smallField.prng(attribute))
  let pad = ''
  for (let i = 0; i < String(fieldSize).length - hashValue.length; i++) {
    pad += '0'
  }

  return BigInt(hashValue + pad + String(attribute))
}

export const checkHashValue = (answer: bigint, smallField: any, num: bigint) => {
  const hash = String(answer).slice(0, String(num).length)
  const value = String(answer).slice(String(num).length)

  const hashValue = String(smallField.prng(BigInt(value)))

  let pad = ''

  for (let i = 0; i < String(num).length - hashValue.length; i++) {
    pad += '0'
  }

  if (hash !== undefined && BigInt(hash) === BigInt(hashValue + pad)) {
    return { value, realValue: true }
  } else {
    return { value, realValue: false }
  }
}
