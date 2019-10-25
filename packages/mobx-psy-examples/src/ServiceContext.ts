import React from 'react'
import { LocationStore } from './router'
import { fiberizeFetch } from 'mobx-psy'

export type Fetch = ReturnType<typeof fiberizeFetch>

export interface IServiceContext {
    location: LocationStore
    fetch: Fetch
}

const ServiceContext = React.createContext<IServiceContext | undefined>(undefined)

export const ServiceContextProvider = ServiceContext.Provider

export function useServiceContext() {
    const context = React.useContext(ServiceContext)
    if (!context) throw new Error('Wrap your app into <ServiceContextProvider>')
    return context
}
