import CloudConfig from '../entities/cloudConfig'
import galois from '@guildofweavers/galois'

/**
 * Interface for the data access layer to communicate with the service layer
 */
export default interface IattributesRepo {
    getCloudConfig: () => Promise<CloudConfig>
    resultsComputation: (qMatrix: galois.Matrix, requesterID: string, requesteeID: string) => Promise<void>
}
