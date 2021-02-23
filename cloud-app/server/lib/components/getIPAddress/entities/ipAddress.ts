export default class IPAddress {
        clientID: string
        ipAddress: string

        constructor (clientID: string, ipAddress: string) {
          this.clientID = clientID
          this.ipAddress = ipAddress
        }
}
