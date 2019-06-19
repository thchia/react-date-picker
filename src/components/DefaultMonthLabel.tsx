import * as React from 'react'

export interface IRenderMonthLabelProps {
  monthIndex: number
}

export default function defaultMonthLabel({
  monthIndex
}: IRenderMonthLabelProps) {
  return <div>Month: {monthIndex}</div>
}
