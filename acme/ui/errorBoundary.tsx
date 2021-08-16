import React from 'react'

export interface AcmeUiErrorBoundaryProps {
  errorMessage?: string
}

export class AcmeUiErrorBoundary extends React.Component<AcmeUiErrorBoundaryProps, { error?: Error | null }> {
  constructor(props: AcmeUiErrorBoundaryProps) {
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
