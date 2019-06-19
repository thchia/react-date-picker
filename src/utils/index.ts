const THIS_YEAR = +new Date().getFullYear()
const THIS_MONTH = +new Date().getMonth()
const CALENDAR_WEEKS = 6

const makeSingleMonth = (month = THIS_MONTH, year = THIS_YEAR) => {
  const monthDays = getMonthDays(month, year)
  const monthFirstDay = getMonthFirstDay(month, year)

  // We always need a 6x7 grid, so we must calculate the extra days
  // on either side of the actual month
  const daysFromPreviousMonth = monthFirstDay - 1
  const daysFromNextMonth =
    CALENDAR_WEEKS * 7 - (daysFromPreviousMonth + monthDays)

  const [prevMonth, prevMonthYear] = getPreviousMonth(month, year)
  const [nextMonth, nextMonthYear] = getNextMonth(month, year)

  const prevMonthDays = getMonthDays(prevMonth, prevMonthYear)

  const prevMonthDates = [
    ...new Array(daysFromPreviousMonth).fill(undefined).map((_, index) => {
      const day = index + 1 + (prevMonthDays - daysFromPreviousMonth)
      return [prevMonthYear, prevMonth, day]
    })
  ]
  const thisMonthDates = [
    ...new Array(monthDays).fill(undefined).map((_, index) => {
      const day = index + 1
      return [year, month, day]
    })
  ]
  const nextMonthDates = [
    ...new Array(daysFromNextMonth).fill(undefined).map((_, index) => {
      const day = index + 1
      return [nextMonthYear, nextMonth, day]
    })
  ]

  return [...prevMonthDates, ...thisMonthDates, ...nextMonthDates]
}

export default makeSingleMonth

export function createMonths(range: [Date, Date]) {
  const [start, end] = range
  let months: number[][][] = []

  let done = false
  let curr = start
  while (!done) {
    const _nextYear =
      curr.getMonth() < 11 ? curr.getFullYear() : curr.getFullYear() + 1
    const _nextMonth = curr.getMonth() < 11 ? curr.getMonth() + 1 : 0
    if (
      curr.getFullYear() === end.getFullYear() &&
      curr.getMonth() === end.getMonth()
    ) {
      done = true
    }

    months.push(makeSingleMonth(curr.getMonth(), curr.getFullYear()))
    curr = new Date(_nextYear, _nextMonth, 1)
  }
  return months
}

export function isYearInRange(year: Date, range: [Date, Date]) {
  const isInLowerBound = year >= range[0]
  const isInUpperBound = year <= range[1]
  return isInLowerBound && isInUpperBound
}

export function getMonthsFromDate(base: Date, target: Date) {
  const baseMonth = base.getMonth()
  const baseYear = base.getFullYear()
  const targetMonth = target.getMonth()
  const targetYear = target.getFullYear()
  if (targetYear === baseYear) {
    return Math.max(0, targetMonth - baseMonth)
  } else if (targetYear - 1 === baseYear) {
    return 12 - baseMonth + targetMonth
  } else {
    return 11 - baseMonth + 12 * (targetYear - baseYear - 1) + targetMonth
  }
}

function getMonthDays(month = THIS_MONTH, year = THIS_YEAR) {
  const months30 = [3, 5, 8, 10]
  const leapYear = year % 4 === 0

  if (month === 1) {
    return leapYear ? 29 : 28
  } else {
    return months30.includes(month) ? 30 : 31
  }
}

function getMonthFirstDay(month = THIS_MONTH, year = THIS_YEAR) {
  return +new Date(`${year}-${zeroPad(month + 1, 2)}-01`).getDay() + 1
}

function zeroPad(value: number, length: number) {
  return `${value}`.padStart(length, '0')
}

function getPreviousMonth(month: number, year: number) {
  const prevMonth = month > 0 ? month - 1 : 11
  const prevMonthYear = month > 0 ? year : year - 1

  return [prevMonth, prevMonthYear]
}

function getNextMonth(month: number, year: number) {
  const nextMonth = month < 11 ? month + 1 : 0
  const nextMonthYear = month < 11 ? year : year + 1

  return [nextMonth, nextMonthYear]
}
