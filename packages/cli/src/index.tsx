import { createCliRenderer } from '@opentui/core'
import { createRoot } from '@opentui/react'
import { createMemoryRouter, RouterProvider } from 'react-router'

import { RootLayout } from './layouts/root-layout'
import { Home } from './screens/home'
import { NewSession } from './screens/new-session'
import { Session } from './screens/session'

const router = createMemoryRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'session/new',
        element: <NewSession />,
      },
      {
        path: 'session/:id',
        element: <Session />,
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

const renderer = await createCliRenderer({
  targetFps: 60,
  exitOnCtrlC: false,
  // Negotiate the Kitty keyboard protocol so terminals that support it
  // (kitty, WezTerm, Ghostty, iTerm2...) send a distinct sequence for
  // Shift+Enter. Terminals without it fall back silently to Ctrl+J.
  useKittyKeyboard: {},
})
createRoot(renderer).render(<App />)
