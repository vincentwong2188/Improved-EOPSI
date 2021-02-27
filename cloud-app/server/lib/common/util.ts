export const parseStringToMatrix = (data : string) => {
  const matrix = JSON.parse(data).values
  for (let i = 0; i < matrix.length; i++) {
    matrix[i].forEach((att: string, j: number) => {
      matrix[i][j] = BigInt(att)
    })
  }
  return matrix
}

export const marshallGaloisMatrix = (matrix: any) => {
  return JSON.stringify(matrix, (key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value // return everything else unchanged
  )
}
