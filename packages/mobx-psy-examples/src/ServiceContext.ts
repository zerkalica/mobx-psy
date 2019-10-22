import React from 'react'
import { LocationStore } from './router'
import { Loader } from 'mobx-psy'

const location = new LocationStore()
export const loader = new Loader()

// For typechecking
const serviceContextDefault = { loader, location }

export type IServiceContext = typeof serviceContextDefault

const ServiceContext = React.createContext(serviceContextDefault)

export const ServiceContextProvider = ServiceContext.Provider

export function useServiceContext() {
    const context = React.useContext(ServiceContext)

    return context
}
