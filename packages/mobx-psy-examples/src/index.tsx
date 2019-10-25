import React from 'react'
import ReactDOM from 'react-dom'
import { ServiceContextProvider } from './ServiceContext'
import { FlatList } from './flat'
import { LocationStore } from './router'
import { fiberizeFetch } from 'mobx-psy'

import { configure } from 'mobx'
import { createFetch } from './mocks'

configure({
  enforceActions: 'observed',
})

export interface AppProps {
  timeout?: number
  errorRate?: number
  baseUrl?: string
}

function App({ timeout = 500, errorRate = 0.8, baseUrl = '/' }: AppProps) {
  const fetcher = createFetch({
    timeout,
    errorRate,
  })
  const appContext = {
    fetch: fiberizeFetch((url, params) => fetcher(baseUrl + url, params)),
    location: new LocationStore(window.location, window.history, window),
  }

  return (
    <ServiceContextProvider value={appContext}>
      <h1>Flats:</h1>
      <FlatList />
    </ServiceContextProvider>
  )
}

ReactDOM.render(
  <App errorRate={0.8} timeout={700} />,
  document.getElementById('app')
)
