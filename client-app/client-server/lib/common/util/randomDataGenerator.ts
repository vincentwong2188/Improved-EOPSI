
const randomNameGenerator = (num: number) => {
  let res = ''
  for (let i = 0; i < num; i++) {
    const random = Math.floor(Math.random() * 27)
    res += String.fromCharCode(97 + random)
  };
  return res
}

export const generateTestData = (testSize: number) => {
  const intersectionSet = [
    { name: 'alice', number: '91053280' },
    { name: 'bob', number: '98775251' },
    { name: 'charlie', number: '91524110' }
  ]
  const testData = [...intersectionSet]
  for (let i = 0; i < testSize; i++) {
    const name = randomNameGenerator(8)
    const number = '9' + Math.floor(Math.random() * 10000000).toString()
    testData.push({ name, number })
  }
  return testData
}
