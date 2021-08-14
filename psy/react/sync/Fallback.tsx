import React from 'react'

import { PsySyncRefreshable } from '@psy/psy/sync/refreshable'

export interface PsySyncFallbackLoadingProps {
  /**
   * User can retry errored request
   */
  refreshable?: PsySyncRefreshable

  /**
   * Last actual version of observed component node
   */
  children?: React.ReactNode

  className?: string
  contentClassName?: string
}

export function PsySyncFallbackLoading({
  children,
  className = 'Fallback Fallback__loading',
  contentClassName = 'Fallback__content',
}: PsySyncFallbackLoadingProps) {
  return <div className={className}>{children ? <div className={contentClassName}>{children}</div> : null}</div>
}

export interface PsySyncFallbackErrorProps {
  /**
   * Component last error
   */
  error: Error
  /**
   * User can retry errored request
   */
  refreshable?: PsySyncRefreshable

  /**
   * Last actual version of observed component node
   */
  children?: React.ReactNode

  className?: string
  contentClassName?: string
  errorClassName?: string
}

export function PsySyncFallbackError({
  refreshable,
  children,
  error,
  className = 'Fallback Fallback__error',
  errorClassName = 'Fallback__error__block',
  contentClassName = 'Fallback__content',
}: PsySyncFallbackErrorProps) {
  return (
    <div className={className}>
      <div className={errorClassName}>
        <h3>
          {error.message}
          {refreshable ? ` (${refreshable})` : ''}
        </h3>

        {refreshable ? <button onClick={refreshable.refresh.bind(refreshable)}>Refresh</button> : null}
        <pre>{String(error.stack)}</pre>
      </div>
      {children ? <div className={contentClassName}>{children}</div> : null}
    </div>
  )
}
