import * as React from 'react'

export interface IRenderDatesProps {
  dates: Array<{
    date: number[]
    // For the leading and trailing days
    isHidden: boolean
    // For dates from same month outside range
    isDisabled: boolean
    // In selected range
    isSelected: boolean
    // Is first selected date
    isFirstSelected: boolean
    // Is last selected date
    isLastSelected: boolean
    isWeekend: boolean
    isToday: boolean
    onClick: () => void
  }>
}

export default function DefaultDates(props: IRenderDatesProps) {
  return <div>{props.dates.map(d => d.date.join('-'))}</div>
}
