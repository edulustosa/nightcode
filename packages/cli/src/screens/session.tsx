import { useParams } from 'react-router'

export function Session() {
  const { id } = useParams<{ id: string }>()

  return (
    <box flexGrow={1} padding={2}>
      <text>Session: {id}</text>
    </box>
  )
}
