import { Fzf } from 'fzf'

import { COMMANDS } from './commands'
import type { Command } from './types'

const fzf = new Fzf(COMMANDS, {
  selector: (cmd) => `${cmd.name} ${cmd.description}`,
})

export function getFilteredCommands(query: string): Command[] {
  if (query.length === 0) return COMMANDS
  return fzf.find(query).map((entry) => entry.item)
}
