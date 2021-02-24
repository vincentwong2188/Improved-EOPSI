import BlindedAttributes from '../entities/blindedAttributes'

/**
 * Interface for the data access layer to communicate with the service layer
 */
export default interface IdataRepo {
    getBlindedAttributes : (clientID: string) => Promise<BlindedAttributes>
}
