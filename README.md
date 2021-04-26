# Mobx pseudo synchronous

@psy/mobx completely removes async functions, promises and streams from your MobX application. Simple, responsive and cuncurrently code doing right.

## Packages

- [@psy/mobx](./packages/@psy/mobx/core) - Core library
- [@psy/mobx-ssr](./packages/@psy/mobx/ssr) - Helpers for using @psy/mobx with server side rendering
- [my/app/search](./packages/my/app/search) - Example application: filter form, list, pagination, loading indicator, parametrized url. Parcel, server side rendering, dev and prod server, state hydrate.

Run demo application:

```
cd packages/my/app/search
yarn install
yarn watch
```

## Basic ideas

* Each async calculation in observer component throws promise (like React.Suspense).
* Each component wrapped into @psy/mobx observer, which uses [mobx-react-lite](https://github.com/mobxjs/mobx-react-lite) internally, but try/catches promises and returns loading/error Fallback component.
* Each async calculation wrapped into @psy/mobx cache, after promise resolve, @psy/mobx rerenders component and returns data from cache.

@psy/mobx emulates [fibers](https://gist.github.com/nin-jin/5408ef8f16f43f1b4fe9cbcea577aac6).

## Compare to mobx-task

Your code before:

```tsx
import { observable, makeObservable, action } from 'mobx'
import { task } from 'mobx-task'
import React from 'react'
import { observer } from 'mobx-react'

class TodoStore {
  @observable todos = []

  constructor() {
    makeObservable(this)
  }

  @task async fetchTodos() {
    await fetch('/todos')
      .then(r => r.json())
      .then(action(todos => this.todos.replace(todos)))
  }
}

const store = new TodoStore()

// Start the task.
store.fetchTodos()

// and reload every 3 seconds, just cause..
setInterval(() => {
  store.fetchTodos()
}, 3000)

const App = observer(() => {
  return (
    <div>
      {store.fetchTodos.match({
        pending: () => <div>Loading, please wait..</div>,
        rejected: err => <div>Error: {err.message}</div>,
        resolved: () => (
          <ul>
            {store.todos.map(todo => (
              <div>{todo.text}</div>
            ))}
          </ul>
        ),
      })}
    </div>
  )
})
```

After:

```tsx
import { observable, action, makeObservable } from 'mobx'
import { sync, observer, suspendify, effect } from '@psy/mobx'
import React from 'react'

const baseUrl = '/'
const fetchJson = suspendify((url, params) => fetch(baseUrl + url, params).then(r => r.json()))

interface Todo {
  text: string
}

class TodoStore {
  constructor() {
    makeObservable(this)
    effect(this, 'todos', () => {
      const handle = setTmeout(() => sync.reset(() => this.todos), 3000)
      return () => clearTimeout(handle)
    })
  }
  @sync get todos(): Todo[] {
    return fetchJson('todos')
  }
}

const store = new TodoStore()

const App = observer(function App() {
  return (
    <ul>
      {store.todos.map(todo => (
        <div>{todo.text}</div>
      ))}
    </ul>
  )
})
```

## Manual reset loaded state

```tsx
// ...
import { action, makeObservable } from 'mobx'

class TodoStore {
  constructor() {
    makeObservable(this)
  }
  @sync get todos(): Todo[] {
    return fetchJson('/todos')
  }

  @action.bound reset() {
    sync.reset(() => this.todos)
  }
}

const store = new TodoStore()

const App = observer(function App() {
  return (
    <ul>
      {store.todos.map(todo => (
        <div>{todo.text}</div>
      ))}
      <button onClick={store.reset}>Reset</button>
    </ul>
  )
})
```

## Custom loading message

```tsx
// ...
const App = observer(function App() {
  return (
    <ul>
      {store.todos.map(todo =>
        <div>{todo.text}</div>
      )}
    </ul>
  )
}, {
  loading: FallbackLoading
})

export function FallbackLoading({children) {
  return (
    <div>
      {children
        ? <div>Loading...<br/>{children}</div>
        : "Initial loading..."
      }
    </div>
  )
}
```

## Custom default loading message

```tsx

import {configurePsy} from '@psy/mobx'

configurePsy({
  loading: FallbackLoading,
  error: FallbackError,
})

```

## Data mocking while loading

```tsx
import { mock } from '@psy/mobx'

// ...
const App = observer(function App() {
  return (
    <ul>
      {mock(
        () => store.todos.map(todo => <div>{todo.text}</div>),
        () => (
          <div>Fake todos</div>
        )
      )}
    </ul>
  )
})
```

## Parallel loading

```tsx
import { parallel } from '@psy/mobx'

// ...
const store1 = new TodoStore()
const store2 = new TodoStore()

const App = observer(function App() {
  const stores = parallel({
    todos1: () => store1.todos,
    todos2: () => store2.todos,
  })

  return (
    <ul>
      {stores.todos1.map(todo => (
        <div>{todo.text}</div>
      ))}
      {stores.todos2.map(todo => (
        <div>{todo.text}</div>
      ))}
    </ul>
  )
})
```
