import React from 'react'
export interface ErrorBoundaryProps {
  errorMessage?: string
}
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { error?: Error | null }
> {
  constructor(props: ErrorBoundaryProps) {
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
