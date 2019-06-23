import * as React from 'react'

import { createMonths, getMonthsFromDate, isYearInRange } from '../utils'
import DefaultCursorBtn, { ICursorBtnProps } from './DefaultCursorButton'
import DefaultDaysOfWeek from './DefaultDaysOfWeek'
import DefaultDates, { IRenderDatesProps } from './DefaultDates'
import DefaultMonthLabel, { IRenderMonthLabelProps } from './DefaultMonthLabel'

export interface IRenderYearSelectorProps {
  selectedYear: number
  selectYear: (year: number) => void
}

export interface IRenderMonthAndCursorProps {
  children?: any
  first?: boolean
  last?: boolean
}

export interface IRenderMonthsContainerProps {
  children?: any
}

export interface IRenderCalendarContainerProps {
  index: number
  children?: any
}

export interface IDatePickerProps {
  range: [Date, Date]
  subRange?: [Date, Date]
  selectedDate: [Date, Date]
  onDateChanged: (date: [Date, Date]) => void
  type: 'range' | 'single'
  calendarCount?: number
  renderMonthsContainer?: (p: IRenderMonthsContainerProps) => React.ReactNode
  renderCalendarContainer?: (
    p: IRenderCalendarContainerProps
  ) => React.ReactNode
  renderYearSelector?: (p: IRenderYearSelectorProps) => React.ReactNode
  renderNextBtn?: (p: ICursorBtnProps) => React.ReactNode
  renderPrevBtn?: (p: ICursorBtnProps) => React.ReactNode
  renderMonthAndCursor?: (p: IRenderMonthAndCursorProps) => React.ReactNode
  renderMonthLabel?: (p: IRenderMonthLabelProps) => React.ReactNode
  renderDaysOfWeek?: () => React.ReactNode
  renderDates?: (p: IRenderDatesProps) => React.ReactNode
}

function DatePicker({
  renderMonthsContainer = defaultRenderMonthsContainer,
  renderCalendarContainer = defaultRenderCalendarContainer,
  renderYearSelector = defaultRenderYearSelector,
  renderNextBtn = defaultRenderNextBtn,
  renderPrevBtn = defaultRenderPrevBtn,
  renderMonthAndCursor = defaultRenderMonthAndCursor,
  renderMonthLabel = defaultRenderMonthLabel,
  renderDaysOfWeek = defaultRenderDaysOfWeek,
  renderDates = defaultRenderDates,
  calendarCount = 2,
  ...props
}: IDatePickerProps) {
  const allDates = createMonths(props.range)
  const cursorMax = Math.max(0, allDates.length - calendarCount)
  const [cursor, setCursor] = React.useState(getInitialCursor(cursorMax))
  const slicedDates = allDates.slice(cursor, cursor + calendarCount)

  function getInitialCursor(_cursorMax: number) {
    if (props.selectedDate) {
      return Math.min(
        _cursorMax,
        getMonthsFromDate(props.range[0], props.selectedDate[0])
      )
    } else if (isYearInRange(new Date(), props.range)) {
      const _target = new Date()
      // @Note: this defaults to Jan of the closest year.
      // Remove to default to current month
      _target.setMonth(0)
      return Math.min(_cursorMax, getMonthsFromDate(props.range[0], _target))
    } else {
      return 0
    }
  }

  function getViewingYear() {
    if (cursor >= cursorMax) return props.range[1].getFullYear()
    return (
      props.range[0].getFullYear() +
      Math.floor((cursor + props.range[0].getMonth()) / 12)
    )
  }

  function handlePrevious() {
    setCursor(Math.max(0, cursor - 1))
  }

  function handleNext() {
    setCursor(Math.min(cursor + 1, cursorMax))
  }

  function handleSelectYear(year: number) {
    if (year < props.range[0].getFullYear()) return
    if (year > props.range[1].getFullYear()) return
    const _cursor = getMonthsFromDate(
      props.range[0],
      new Date(Date.UTC(year, 0, 1))
    )
    setCursor(Math.min(_cursor, cursorMax))
  }

  function handleCellClicked(cellDate: Date) {
    const _asUTC = dateToUTC(cellDate)
    if (props.type === 'single') {
      props.onDateChanged([_asUTC, _asUTC])
    } else {
      // 1. No selection yet
      if (!props.selectedDate) {
        props.onDateChanged([_asUTC, _asUTC])
      } else if (
        // 2. One date selected
        props.selectedDate[0].valueOf() === props.selectedDate[1].valueOf()
      ) {
        // 2.a. Incoming date is before or equal to current date
        if (_asUTC <= props.selectedDate[0]) {
          props.onDateChanged([_asUTC, props.selectedDate[0]])
        } else {
          // 2.b. Incoming date is after current date
          props.onDateChanged([props.selectedDate[0], _asUTC])
        }
        // 3. Two dates selected
      } else {
        // 3.a. Incoming date is strictly before selected range
        if (_asUTC < props.selectedDate[0]) {
          props.onDateChanged([_asUTC, _asUTC])
          // 3.b. Incoming date is strictly after selected range
        } else if (_asUTC > props.selectedDate[1]) {
          props.onDateChanged([_asUTC, _asUTC])
        } else {
          // 3.c. Incoming date is within selected range
          props.onDateChanged([props.selectedDate[0], _asUTC])
        }
      }
    }
  }

  function getMonthAndCursorChildrenPrev(date: number[][]) {
    return (
      <React.Fragment>
        {renderPrevBtn({
          disabled: cursor === 0,
          onClick: handlePrevious
        })}
        {renderMonthLabel({ monthIndex: date[10][1] })}
      </React.Fragment>
    )
  }

  function getMonthAndCursorChildrenNext(date: number[][]) {
    return (
      <React.Fragment>
        {renderMonthLabel({ monthIndex: date[10][1] })}
        {renderNextBtn({
          disabled: cursor >= cursorMax,
          onClick: handleNext
        })}
      </React.Fragment>
    )
  }

  function dateToUTC(date: Date) {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    )
  }

  function renderDate(month: number) {
    return (date: number[], i: number) => {
      const _asUTC = dateToUTC(new Date(date[0], date[1], date[2]))
      const isBeforeMonth = _asUTC < dateToUTC(props.range[0])
      const isBeforeSubrange = props.subRange
        ? _asUTC < dateToUTC(props.subRange[0])
        : false
      const isAfterMonth = _asUTC > dateToUTC(props.range[1])
      const isAfterSubrange = props.subRange
        ? _asUTC > dateToUTC(props.subRange[1])
        : false
      const isSelectedLowerBound = props.selectedDate
        ? _asUTC >= dateToUTC(props.selectedDate[0])
        : false
      const isSelectedUpperBound = props.selectedDate
        ? _asUTC <= dateToUTC(props.selectedDate[1])
        : false

      const isHidden = month !== date[1]
      const isDisabled =
        isBeforeMonth || isAfterMonth || isBeforeSubrange || isAfterSubrange
      const isSelected = props.selectedDate
        ? isSelectedLowerBound && isSelectedUpperBound
        : false
      const isFirstSelected =
        isSelected &&
        _asUTC.valueOf() === dateToUTC(props.selectedDate[0]).valueOf()
      const isLastSelected =
        isSelected &&
        _asUTC.valueOf() === dateToUTC(props.selectedDate[1]).valueOf()

      const isWeekend = i % 7 === 0 || (i + 1) % 7 === 0

      function handleClicked() {
        if (isHidden || isDisabled) return
        const _date = new Date(Date.UTC(date[0], date[1], date[2]))
        handleCellClicked(_date)
      }

      return {
        date,
        isHidden,
        isDisabled,
        isSelected,
        isFirstSelected,
        isLastSelected,
        isWeekend,
        onClick: handleClicked
      }
    }
  }

  function renderCalendarContainerBase(
    dates: number[][],
    position?: 'first' | 'last'
  ) {
    return (
      <React.Fragment>
        {position === 'first'
          ? /* Prev Btn and Month Label */
            renderMonthAndCursor({
              children: getMonthAndCursorChildrenPrev(dates),
              first: true
            })
          : null}
        {position === 'last'
          ? /* Next Btn and Month Label */
            renderMonthAndCursor({
              children: getMonthAndCursorChildrenNext(dates),
              last: true
            })
          : null}
        {!position && renderMonthLabel({ monthIndex: dates[10][1] })}
        {/* Days of Week */}
        {renderDaysOfWeek()}
        {/* Dates */}
        {renderDates({
          dates: dates.map(renderDate(dates[10][1]))
        })}
      </React.Fragment>
    )
  }

  function renderMonths() {
    return (
      <React.Fragment>
        {slicedDates.map((date, i) => {
          const first = i === 0 ? 'first' : null
          const last = i === slicedDates.length - 1 ? 'last' : null
          return renderCalendarContainer({
            index: i,
            children: renderCalendarContainerBase(date, first || last)
          })
        })}
      </React.Fragment>
    )
  }

  return (
    <div>
      {renderYearSelector({
        selectYear: year => handleSelectYear(year),
        selectedYear: getViewingYear()
      })}
      {renderMonthsContainer({ children: renderMonths() })}
    </div>
  )
}

export default DatePicker

// Render prop defaults
function defaultRenderPrevBtn(p: ICursorBtnProps) {
  return <DefaultCursorBtn direction="prev" {...p} />
}

function defaultRenderNextBtn(p: ICursorBtnProps) {
  return <DefaultCursorBtn direction="next" {...p} />
}

function defaultRenderMonthAndCursor({ children }: IRenderMonthAndCursorProps) {
  return <div>{children}</div>
}

function defaultRenderDaysOfWeek() {
  return <DefaultDaysOfWeek />
}

function defaultRenderDates(p: IRenderDatesProps) {
  return <DefaultDates {...p} />
}

function defaultRenderMonthLabel(p: IRenderMonthLabelProps) {
  return <DefaultMonthLabel {...p} />
}

function defaultRenderYearSelector(p: IRenderYearSelectorProps) {
  return <div>{p.selectedYear}</div>
}

function defaultRenderMonthsContainer({
  children
}: IRenderMonthsContainerProps) {
  return <div>{children}</div>
}

function defaultRenderCalendarContainer({
  children,
  index
}: IRenderCalendarContainerProps) {
  return <div key={index}>{children}</div>
}
