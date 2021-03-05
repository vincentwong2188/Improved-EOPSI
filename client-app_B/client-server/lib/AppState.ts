// Singleton class to manage the app state

import { Service } from 'typedi'

// import { networkInterfaces } from 'os'

@Service()
export default class AppState {
    intersectionResult?: String[];

    isPendingRequest = false;
    public setPendingRequest (state: boolean) {
      this.isPendingRequest = state
    }

    public setIntersectionResult (result: String[]) {
      this.intersectionResult = result
    }
}
