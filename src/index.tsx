import React from 'react'
import ReactDOM from 'react-dom'
import { ServiceContextProvider } from './ServiceContext'
import { FlatList } from './flat'
import { LocationStore } from './router'
import { Loader } from './loader'

import { configure } from 'mobx'
import { createFetch } from './mocks'

configure({
  enforceActions: 'observed',
})

const App = ({ timeout = 500, errorRate = 0.8 }) => {
  const fetcher = createFetch({
    timeout,
    errorRate,
  })
  const appContext = {
    loader: new Loader((name, params, signal) =>
      fetcher(name, { body: params, signal })
    ),
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
