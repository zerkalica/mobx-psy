import React from 'react'
import { RequestInfo } from './Loader'

export interface FallbackOptions {
  loading: React.FC<FallbackLoadingProps>
  error?: React.FC<FallbackErrorProps>
}

export const fallbackConfig: FallbackOptions = {
  loading: FallbackLoading,
  error: FallbackError,
}

export interface FallbackLoadingProps {
  request?: RequestInfo
  children?: React.ReactNode
}

export function FallbackLoading({ children }: FallbackLoadingProps) {
  return (
    <div className="Fallback Fallback__loading">
      {children ? <div className="Fallback__content">{children}</div> : null}
    </div>
  )
}

export interface FallbackErrorProps {
  error: Error
  request?: RequestInfo
  children?: React.ReactNode
}

export function FallbackError({
  request,
  children,
  error,
}: FallbackErrorProps) {
  return (
    <div className="Fallback Fallback__error">
      <div className="Fallback__error__block">
        <h3>
          {error.message}
          {request ? `: fetch ${request.name}` : null}
        </h3>

        {request ? <button onClick={request.refresh}>Refresh</button> : null}
        <pre>{String(error.stack)}</pre>
      </div>
      {children ? <div className="Fallback__content">{children}</div> : null}
    </div>
  )
}
