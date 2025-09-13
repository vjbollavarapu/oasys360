import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'

// Mock session provider for testing
const MockSessionProvider = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider session={null}>{children}</SessionProvider>
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: MockSessionProvider, ...options })

// Re-export everything from testing library
export * from '@testing-library/react'
export { customRender as render }
