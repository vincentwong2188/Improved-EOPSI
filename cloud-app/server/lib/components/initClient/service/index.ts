import { Service } from 'typedi'
import IAttributesRepo from '../dataAccess/IAttributesRepo'

interface initClientRequest {
  clientID: string;
  blindedVectors: string;
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
  public async initClient ({ blindedVectors, clientID } : initClientRequest, dataAccess: IAttributesRepo) : Promise<void> {
    // 1) Save attributes into cloud DB
    await dataAccess.saveAttributesLocal(clientID, blindedVectors)
    console.log('Saved Cloud Attributes')
  }

  // Get cloud config
  public async getCloudConfig (dataAccess: IAttributesRepo) : Promise<cloudConfigResponse> {
    const { numBins, numElementsPerBin, finiteFieldNum, smallFiniteFieldNum, vectorX } = await dataAccess.getCloudConfig()
    return { numBins, numElementsPerBin, finiteFieldNum, smallFiniteFieldNum, vectorX }
  }
}
