import { Service } from 'typedi'
import IAttributesRepo from '../dataAccess/IAttributesRepo'

interface initClientRequest {
  url: string;
  blindedVectors: string;
  clientID: string;
}
interface cloudConfigResponse {
  numBins: number;
  numElementsPerBin: number;
  finiteFieldNum: bigint;
  smallFiniteFieldNum: bigint;
  vectorX: bigint[]

}

@Service()
export default class InitClientService {
  // clientID might not be unique
  public async initClient ({ blindedVectors, url, clientID } : initClientRequest, dataAccess: IAttributesRepo) : Promise<string> {
    // 1) Save attributes into cloud DB
    await dataAccess.saveAttributesLocal(clientID, url, blindedVectors)

    console.log('Saved Cloud Attributes')
    return clientID
  }

  // Get cloud config
  public async getCloudConfig (dataAccess: IAttributesRepo) : Promise<cloudConfigResponse> {
    const { numBins, numElementsPerBin, finiteFieldNum, smallFiniteFieldNum, vectorX } = await dataAccess.getCloudConfig()
    return { numBins, numElementsPerBin, finiteFieldNum, smallFiniteFieldNum, vectorX }
  }
}
