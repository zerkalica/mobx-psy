import React from 'react'

export const CheckBox = ({
  value,
  id,
  name,
  onChange,
  disabled,
}: {
  disabled?: boolean
  id?: string
  name: string
  value: boolean
  onChange: (next: boolean) => void
}) => {
  const setValue = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked)
    },
    []
  )

  return (
    <input
      id={id}
      disabled={disabled}
      type="checkbox"
      name={name}
      checked={value}
      onChange={setValue}
    />
  )
}