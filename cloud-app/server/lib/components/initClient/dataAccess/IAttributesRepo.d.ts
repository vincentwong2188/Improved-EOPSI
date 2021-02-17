import CloudConfig from '../entities/cloudConfig'

/**
 * Interface for the data access layer to communicate with the service layer
 */
export default interface IattributesRepo {
    saveAttributesLocal : (clientID: string, blindedVectors: string) => void;
    getCloudConfig : () => Promise<CloudConfig>
}
