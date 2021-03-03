/**
 * Interface for the data access layer to communicate with the service layer
 */
export default interface IattributesRepo {
    getMasterKey : () => Promise<string>;
    saveMasterKey: (mk: string) => Promise<void>;
    saveClientID: (clientID: string) => Promise<void>;
    getClientID () : Promise<string>
}
