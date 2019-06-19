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
}

export interface IRenderMonthsContainerProps {
  children?: any
}

export interface IRenderCalendarContainerProps {
  children?: any
}

export interface IDatePickerProps {
  range: [Date, Date]
  selectedDate: [Date, Date]
  onDateChanged: (date: [Date, Date]) => void
  type: 'range' | 'single'
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
  ...props
}: IDatePickerProps) {
  const [cursor, setCursor] = React.useState(getInitialCursor())

  const allDates = createMonths(props.range)
  const cursorMax = allDates.length - 2
  const [first, second] = allDates.slice(cursor, cursor + 2)

  function getInitialCursor() {
    if (props.selectedDate) {
      return getMonthsFromDate(props.range[0], props.selectedDate[0])
    } else if (isYearInRange(new Date(), props.range)) {
      const _target = new Date()
      // @Note: this defaults to Jan of the closest year.
      // Remove to default to current month
      _target.setMonth(0)
      return getMonthsFromDate(props.range[0], _target)
    } else {
      return 0
    }
  }

  function getViewingYear() {
    return props.range[0].getFullYear() + Math.floor(cursor / 12)
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

  function getMonthAndCursorChildrenPrev() {
    return (
      <React.Fragment>
        {renderPrevBtn({
          disabled: cursor === 0,
          onClick: handlePrevious
        })}
        {renderMonthLabel({ monthIndex: first[10][1] })}
      </React.Fragment>
    )
  }

  function getMonthAndCursorChildrenNext() {
    return (
      <React.Fragment>
        {renderMonthLabel({ monthIndex: second[10][1] })}
        {renderNextBtn({
          disabled: cursor === cursorMax,
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
      const isAfterMonth = _asUTC > dateToUTC(props.range[1])
      const isSelectedLowerBound = props.selectedDate
        ? _asUTC >= dateToUTC(props.selectedDate[0])
        : false
      const isSelectedUpperBound = props.selectedDate
        ? _asUTC <= dateToUTC(props.selectedDate[1])
        : false

      const isHidden = month !== date[1]
      const isDisabled = isBeforeMonth || isAfterMonth
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

  function renderFirstCalendarContainer() {
    return (
      <React.Fragment>
        {/* Prev Btn and Month Label */}
        {renderMonthAndCursor({
          children: getMonthAndCursorChildrenPrev()
        })}
        {/* Days of Week */}
        {renderDaysOfWeek()}
        {/* Dates */}
        {renderDates({
          dates: first.map(renderDate(first[10][1]))
        })}
      </React.Fragment>
    )
  }

  function renderSecondCalendarContainer() {
    return (
      <React.Fragment>
        {/* Next Btn and Month Label */}
        {renderMonthAndCursor({
          children: getMonthAndCursorChildrenNext()
        })}
        {/* Days of Week */}
        {renderDaysOfWeek()}
        {/* Dates */}
        {renderDates({
          dates: second.map(renderDate(second[10][1]))
        })}
      </React.Fragment>
    )
  }

  function renderMonths() {
    return (
      <React.Fragment>
        {renderCalendarContainer({ children: renderFirstCalendarContainer() })}
        {renderCalendarContainer({
          children: renderSecondCalendarContainer()
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

function defaultRenderMonthAndCursor(p: IRenderMonthAndCursorProps) {
  return <div {...p} />
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
  children
}: IRenderCalendarContainerProps) {
  return <div>{children}</div>
}
