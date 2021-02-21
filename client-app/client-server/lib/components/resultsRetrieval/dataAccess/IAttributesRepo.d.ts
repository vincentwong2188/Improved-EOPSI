import Attribute from '../entities/attribute'
import CloudConfig from '../entities/cloudConfig'
import galois from '@guildofweavers/galois'

/**
 * Interface for the data access layer to communicate with the service layer
 */
export default interface IattributesRepo {

    // Need to implement get mk from db

    // saveAttributesLocal : (attributes: Attribute[]) => void;
    // getCloudConfig : () => Promise<CloudConfig>
    // saveAttributesCloud : (attributes: galois.Matrix, clientID: string) => Promise<void>
}
