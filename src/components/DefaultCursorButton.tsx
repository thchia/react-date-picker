import * as React from 'react'

export interface ICursorBtnProps {
  disabled: boolean
  onClick: () => void
}

export default ({
  children,
  direction,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  direction: 'prev' | 'next'
} & ICursorBtnProps) => <button {...props}>{direction}</button>
