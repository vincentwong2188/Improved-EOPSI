
/**
 * Interface for the data access layer to communicate with the service layer
 */
export default interface IConfigRepo {
    getClientID : () => Promise<string>;
    getClientPassword : () => Promise<string>;
}
