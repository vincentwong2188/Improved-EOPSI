import { Service } from 'typedi'

@Service
export default class TestService {
  async TestService ({ testParam }) {
    return { testResponse: `Success ${testParam}` }
  }
}
