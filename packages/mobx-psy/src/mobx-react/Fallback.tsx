import React from 'react'
import { Refreshable } from '../fibers'

export interface FallbackOptions {
  loading: React.FC<FallbackLoadingProps>
  error?: React.FC<FallbackErrorProps>
}

export const fallbackConfig: FallbackOptions = {
  loading: FallbackLoading,
  error: FallbackError,
}

export interface FallbackLoadingProps {
  refreshable?: Refreshable
  children?: React.ReactNode
  className?: string
  contentClassName?: string
}

export function FallbackLoading({
  children,
  className = 'Fallback Fallback__loading',
  contentClassName = 'Fallback__content'
}: FallbackLoadingProps) {
  return (
    <div className={className}>
      {children ? <div className={contentClassName}>{children}</div> : null}
    </div>
  )
}

export interface FallbackErrorProps {
  error: Error
  refreshable?: Refreshable
  children?: React.ReactNode
  className?: string
  contentClassName?: string
  errorClassName?: string
}

export function FallbackError({
  refreshable,
  children,
  error,
  className = 'Fallback Fallback__error',
  errorClassName = 'Fallback__error__block',
  contentClassName = 'Fallback__content'
}: FallbackErrorProps) {
  return (
    <div className={className}>
      <div className={errorClassName}>
        <h3>
          {error.message}
          {refreshable ? `fetch ${refreshable}` : null}
        </h3>

        {refreshable ? (
          <button onClick={refreshable.refresh}>Refresh</button>
        ) : null}
        <pre>{String(error.stack)}</pre>
      </div>
      {children ? <div className={contentClassName}>{children}</div> : null}
    </div>
  )
}
