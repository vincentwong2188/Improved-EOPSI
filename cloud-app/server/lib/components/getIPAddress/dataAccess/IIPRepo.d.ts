import IPAddress from '../entities/ipAddress'

/**
 * Interface for the data access layer to communicate with the service layer
 */
export default interface IipRepo {
    getIPAddress : (clientID: string) => Promise<IPAddress>
}
