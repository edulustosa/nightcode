import { useCallback, useMemo, useRef, useState } from 'react'
import { Fzf } from 'fzf'
import { useKeyboard } from '@opentui/react'
import {
  type ScrollBoxRenderable,
  type InputRenderable,
  TextAttributes,
} from '@opentui/core'

import { useKeyboardLayer } from '../providers/keyboard-layer'
import { useTheme } from '../providers/theme'

const MAX_VISIBLE_ITEMS = 6

interface DialogSearchListProps<T extends object> {
  items: T[]
  onSelect: (item: T) => void
  onHighlight?: (item: T) => void
  selector: (item: T) => string
  renderItem: (item: T, isSelected: boolean) => React.ReactNode
  getKey: (item: T) => string
  placeholder?: string
  emptyText?: string
}

export function DialogSearchList<T extends object>({
  items,
  onSelect,
  onHighlight,
  selector,
  renderItem,
  getKey,
  placeholder = 'Search...',
  emptyText = 'No results found.',
}: DialogSearchListProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const inputRef = useRef<InputRenderable>(null)
  const scrollRef = useRef<ScrollBoxRenderable>(null)
  const { isTopLayer } = useKeyboardLayer()
  const { colors } = useTheme()

  const handleContentChange = useCallback(() => {
    const text = inputRef.current?.value ?? ''
    setSearchValue(text)
    setSelectedIndex(0)

    const scrollbox = scrollRef.current
    if (scrollbox) {
      scrollbox.scrollTo(0)
    }
  }, [])

  // fzf's options tuple is conditional on `U extends string`, which TS cannot
  // reduce for an unresolved generic. Widening to `object[]` makes the element
  // concrete so the conditional resolves; results are cast back to T.
  const fzf = useMemo(
    () =>
      new Fzf(items as object[], {
        selector: selector as (item: object) => string,
      }),
    [items, selector],
  )

  const filtered = searchValue
    ? (fzf.find(searchValue).map((entry) => entry.item) as T[])
    : items

  const visibleHeight = Math.min(filtered.length, MAX_VISIBLE_ITEMS)

  useKeyboard((key) => {
    if (!isTopLayer('dialog')) return

    if (key.name === 'return' || key.name === 'enter') {
      const item = filtered[selectedIndex]
      if (item) {
        onSelect(item)
      }
    } else if (key.name === 'up') {
      setSelectedIndex((prev) => {
        const newIndex = Math.max(0, prev - 1)
        const sb = scrollRef.current
        if (sb && newIndex < sb.scrollTop) {
          sb.scrollTo(newIndex)
        }

        const item = filtered[newIndex]
        if (item && onHighlight) {
          onHighlight(item)
        }

        return newIndex
      })
    } else if (key.name === 'down') {
      setSelectedIndex((prev) => {
        const newIndex = Math.min(filtered.length - 1, prev + 1)
        const sb = scrollRef.current
        if (sb) {
          const viewportHeight = sb.viewport.height
          const visibleEnd = sb.scrollTop + viewportHeight - 1
          if (newIndex > visibleEnd) {
            sb.scrollTo(newIndex - visibleHeight + 1)
          }
        }

        const item = filtered[newIndex]
        if (item && onHighlight) {
          onHighlight(item)
        }

        return newIndex
      })
    }
  })

  return (
    <box flexDirection="column" gap={1}>
      <input
        ref={inputRef}
        placeholder={placeholder}
        focused
        onContentChange={handleContentChange}
      />

      {filtered.length === 0 ? (
        <text attributes={TextAttributes.DIM}>{emptyText}</text>
      ) : (
        <scrollbox ref={scrollRef} height={visibleHeight}>
          {filtered.map((item, i) => {
            const isSelected = i === selectedIndex
            return (
              <box
                key={getKey(item)}
                flexDirection="row"
                height={1}
                overflow="hidden"
                backgroundColor={isSelected ? colors.selection : undefined}
                onMouseMove={() => {
                  setSelectedIndex(i)
                  if (onHighlight) onHighlight(item)
                }}
                onMouseDown={() => onSelect(item)}
              >
                {renderItem(item, isSelected)}
              </box>
            )
          })}
        </scrollbox>
      )}
    </box>
  )
}
