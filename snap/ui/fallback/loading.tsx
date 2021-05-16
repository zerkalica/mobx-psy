import React from 'react'

import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'

export function SnapUiFallbackLoading({ children }: { children?: React.ReactNode }) {
  return <Container>{children ? <Body>{children}</Body> : null}</Container>
}

const waitAnimation = keyframes({
  from: {
    backgroundPosition: `0 0`,
  },

  to: {
    backgroundPosition: `200vmax 0`,
  },
})

const Container = styled.div({
  minWidth: `2rem`,
  minHeight: `2rem`,
  backgroundImage: `repeating-linear-gradient(
45deg,
hsla(0, 0%, 50%, 0.1) 0%,
hsla(0, 0%, 50%, 0) 5%,
hsla(0, 0%, 50%, 0) 45%,
hsla(0, 0%, 50%, 0.1) 50%,
hsla(0, 0%, 50%, 0) 55%,
hsla(0, 0%, 50%, 0) 95%,
hsla(0, 0%, 50%, 0.1) 100%
)`,
  backgroundSize: `200vmax 200vmax`,
  animation: `${waitAnimation} 1s linear infinite`,
})

const Body = styled.div({
  pointerEvents: 'none',
})
