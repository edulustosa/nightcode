import { useMemo, useRef, useState } from 'react'
import { useKeyboard } from '@opentui/react'
import { type ScrollBoxRenderable } from '@opentui/core'

import { getFilteredCommands } from './filter-command'
import type { Command } from './types'

export function useCommandMenu() {
  const [textValue, setTextValue] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showCommandMenu, setShowCommandMenu] = useState(false)
  const scrollRef = useRef<ScrollBoxRenderable>(null)

  const commandQuery =
    showCommandMenu && textValue.startsWith('/') ? textValue.slice(1) : ''

  const filteredCommands = useMemo(
    () => getFilteredCommands(commandQuery),
    [commandQuery],
  )

  const handleContentChange = (text: string) => {
    setTextValue(text)
    setSelectedIndex(0)

    const scrollbox = scrollRef.current
    if (scrollbox) {
      scrollbox.scrollTo(0)
    }

    const prefix = text.startsWith('/') ? text.slice(1) : null
    if (prefix !== null && !prefix.includes(' ')) {
      setShowCommandMenu(true)
      return
    }

    setShowCommandMenu(false)
  }

  const resolveCommand = (index: number): Command | undefined => {
    const command = filteredCommands[index]
    if (command) {
      setShowCommandMenu(false)
    }

    return command
  }

  useKeyboard((key) => {
    if (!showCommandMenu) return

    switch (key.name) {
      case 'enter':
        key.preventDefault()
        resolveCommand(selectedIndex)
        break
      case 'up':
        key.preventDefault()
        setSelectedIndex((i: number) => {
          const newIndex = Math.max(0, i - 1)

          const sb = scrollRef.current
          if (sb && newIndex < sb.scrollTop) {
            sb.scrollTo(newIndex)
          }

          return newIndex
        })
        break
      case 'down':
        key.preventDefault()
        setSelectedIndex((i: number) => {
          if (filteredCommands.length === 0) return 0

          const newIndex = Math.min(filteredCommands.length - 1, i + 1)

          const sb = scrollRef.current
          if (sb) {
            const viewportHeight = sb.viewport.height
            const visibleEnd = sb.scrollTop + viewportHeight - 1
            if (newIndex > visibleEnd) {
              sb.scrollTo(newIndex - viewportHeight + 1)
            }
          }

          return newIndex
        })
        break
    }
  })

  return {
    showCommandMenu,
    commandQuery,
    selectedIndex,
    scrollRef,
    handleContentChange,
    resolveCommand,
    setSelectedIndex,
  }
}
