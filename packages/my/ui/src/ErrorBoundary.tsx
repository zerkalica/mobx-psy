import React from 'react'

export interface MyUiErrorBoundaryProps {
  errorMessage?: string
}

export class MyUiErrorBoundary extends React.Component<MyUiErrorBoundaryProps, { error?: Error | null }> {
  constructor(props: MyUiErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    const { errorMessage } = this.props
    const error = this.state.error
    if (error) {
      return (
        <div>
          {errorMessage ? <h1>{errorMessage}</h1> : null}
          {error.message}
          <br />
          <pre>{error.stack}</pre>
        </div>
      )
    }

    return this.props.children
  }
}
