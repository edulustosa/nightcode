import { createContext, useCallback, useContext, useState } from 'react'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

import {
  DEFAULT_THEME,
  THEMES,
  type Theme,
  type ThemeColors,
} from '../../theme'

const CONFIG_DIR = join(homedir(), '.nightcode')
const THEME_PREFERENCES_PATH = join(CONFIG_DIR, 'preferences.json')

interface ThemePreferences {
  themeName: string
}

function getInitialTheme(): Theme {
  try {
    const preferences = JSON.parse(
      readFileSync(THEME_PREFERENCES_PATH, 'utf8'),
    ) as Partial<ThemePreferences>
    const savedTheme = THEMES.find(
      (theme) => theme.name === preferences.themeName,
    )

    return savedTheme ?? DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

function persistTheme(theme: Theme) {
  try {
    mkdirSync(CONFIG_DIR, { recursive: true })
    writeFileSync(
      THEME_PREFERENCES_PATH,
      JSON.stringify(
        { themeName: theme.name } satisfies ThemePreferences,
        null,
        2,
      ),
      'utf8',
    )
  } catch {
    // Ignore errors, we don't want to crash the app if we can't save the theme
  }
}

export type ThemeContextValue = {
  colors: ThemeColors
  currentTheme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext)
  if (!value) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return value
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme)

  const setTheme = useCallback((theme: Theme) => {
    setCurrentTheme(theme)
    persistTheme(theme)
  }, [])

  return (
    <ThemeContext.Provider
      value={{ colors: currentTheme.colors, currentTheme, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
