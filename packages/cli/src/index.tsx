import { createCliRenderer } from '@opentui/core'
import { createRoot } from '@opentui/react'

import { Header } from './components/header'
import { InputBar } from './components/input-bar'
import { ToastProvider } from './providers/toast'
import { KeyboardLayerProvider } from './providers/keyboard-layer'
import { DialogProvider } from './providers/dialog'

function App() {
  return (
    <KeyboardLayerProvider>
      <DialogProvider>
        <ToastProvider>
          <box
            alignItems="center"
            justifyContent="center"
            backgroundColor="#0D0D12"
            width="100%"
            height="100%"
            gap={2}
          >
            <Header />
            <box width="100%" maxWidth={78} paddingX={2}>
              <InputBar onSubmit={() => {}} />
            </box>
          </box>
        </ToastProvider>
      </DialogProvider>
    </KeyboardLayerProvider>
  )
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
