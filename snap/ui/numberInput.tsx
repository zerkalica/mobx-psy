import React from 'react'

export const SnapUiNumberInput = ({
  value,
  onChange,
  id,
  min = 0,
  max = 10000,
  name,
  disabled,
}: {
  disabled?: boolean
  id?: string
  min?: number
  max?: number
  name: string
  value: number
  onChange: (next: number) => void
}) => {
  const [syncedValue, setSyncedValue] = React.useState(String(value))

  React.useEffect(() => setSyncedValue(String(value)), [value])

  const setValue = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSyncedValue(e.target.value)
      onChange(Number(e.target.value))
    },
    [setSyncedValue, onChange]
  )

  return <input id={id} type="number" name={name} min={min} max={max} disabled={disabled} value={syncedValue} onChange={setValue} />
}
