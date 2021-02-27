/* eslint-disable camelcase */
import Attribute from '../../initClient/entities/attribute'
import CloudConfig from '../../initClient/entities/cloudConfig'
import galois from '@guildofweavers/galois'

/**
 * Interface for the data access layer to communicate with the service layer
 */
export default interface IattributesRepo {
    saveAttributesLocal : (attributes: Attribute[]) => void;
    getCloudConfig : () => Promise<CloudConfig>
    saveAttributesCloud : (attributes: galois.Matrix, clientID: string) => Promise<void>
    getLocalAttributes: () => Promise<{hashed_value: string, name: string, phone: number}[]>

}
