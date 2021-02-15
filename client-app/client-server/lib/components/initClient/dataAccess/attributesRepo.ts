import IattributesRepo from './IAttributesRepo'
import Attribute from '../entities/attribute'
import CloudConfig from '../entities/cloudConfig'
import galois from '@guildofweavers/galois'
import { query } from '../../../common/dataAccess/dbAccess'

// Accesses data from local database or cloud service
export default class AttributesRepo implements IattributesRepo {
    public saveAttributesLocal = async (attribute: Attribute[]) => {
      // implement save attributes into database here
      // await query('insert into..', [])

    }

    public async getCloudConfig () : Promise<CloudConfig> {
      // Cloud config: TODO: To be called from the cloud
      const numBins = 10
      const numElementsPerBin = 5
      // const finiteFieldNum = 2n ** 256n - 351n * 2n ** 32n + 1n
      const finiteFieldNum = 1931n
      const smallFiniteFieldNum = 1931n

      const xi = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n]

      return new CloudConfig(numBins, numElementsPerBin, finiteFieldNum, smallFiniteFieldNum, xi)
    }

    public async saveAttributesCloud (attributes: galois.Matrix) : Promise<void> {
      // Calls the cloud endpoint to save the attributes
    }
}
