import styled from '@emotion/styled'
import React from 'react'

export function MyUiFallbackError({
  refreshable,
  children,
  error,
}: {
  error: Error
  children?: React.ReactNode
  refreshable?: {
    refresh(): void
  }
}) {
  return (
    <Container>
      <ErrorBlock>
        <h3>
          {error.message}
          {refreshable ? ` (${refreshable})` : ''}
        </h3>

        {refreshable ? <button onClick={refreshable.refresh.bind(refreshable)}>Refresh</button> : null}
        <pre>{String(error.stack)}</pre>
      </ErrorBlock>
      {children ? <Body>{children}</Body> : null}
    </Container>
  )
}

const Body = styled.div({
  pointerEvents: 'none',
})

const Container = styled.div({
  backgroundColor: `rgba(0, 0, 0, 0.15)`,
})

const ErrorBlock = styled.div({
  zIndex: 10000,
  position: `fixed`,
  left: 0,
  top: 0,
  minHeight: `2rem`,
  minWidth: `5rem`,
  padding: `1rem`,
  margin: `1rem`,
  border: `1px solid #ab2727`,
  backgroundImage: `repeating-linear-gradient(
    135deg,
    rgba(255, 220, 220, 1),
    rgba(255, 220, 220, 1) 11px,
    rgba(255, 255, 220, 1) 10px,
    rgba(255, 255, 220, 1) 20px
  )`,
  backgroundSize: `28px 28px`,
  color: `black`,
})
