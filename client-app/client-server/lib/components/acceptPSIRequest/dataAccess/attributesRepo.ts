import IattributesRepo from './IAttributesRepo'
import CloudConfig from '../entities/cloudConfig'
import galois from '@guildofweavers/galois'
import { getCloudConfigFetch, resultsComputationFetch } from '../../../common/dataAccess/cloudAccess'

// Accesses data from local database or cloud service
export default class AttributesRepo implements IattributesRepo {
  // gets the configurations from the cloud
  public async getCloudConfig(): Promise<CloudConfig> {
    const res = await getCloudConfigFetch()
    const { cloudConfig: cloudConfigString } = await res.json()
    const cloudConfig = JSON.parse(cloudConfigString)

    const numBins = cloudConfig.numBins
    const numElementsPerBin = cloudConfig.numElementsPerBin
    const finiteFieldNum = BigInt(cloudConfig.finiteFieldNum)
    const smallFiniteFieldNum = BigInt(cloudConfig.smallFiniteFieldNum)
    const vectorX = cloudConfig.vectorX.map((x: string) => BigInt(x))

    return new CloudConfig(numBins, numElementsPerBin, finiteFieldNum, smallFiniteFieldNum, vectorX)
  }

  public async resultsComputation(qMatrix: galois.Matrix, requesterID: string, requesteeID: string): Promise<void> {
    const stringified = JSON.stringify(qMatrix, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    )
    await resultsComputationFetch(stringified, requesterID, requesteeID)
  }
}
