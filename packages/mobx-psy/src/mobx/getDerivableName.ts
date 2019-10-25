import {_getGlobalState} from 'mobx'

export function getDerivableName(): string {
    return _getGlobalState().runId
}