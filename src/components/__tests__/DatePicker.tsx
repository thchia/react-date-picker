import * as React from 'react'
import { fireEvent, render } from '@testing-library/react'

import DatePicker, { IDatePickerProps } from '../DatePicker'

describe('DatePicker', () => {
  describe('functionality', () => {
    it('next button works', () => {
      const { getByText, queryByText } = render(
        <DatePicker
          range={[new Date('2019-12-31'), new Date('2020-12-31')]}
          selectedDate={[new Date('2020-01-01'), new Date('2020-01-01')]}
          onDateChanged={jest.fn()}
          type="single"
        />
      )
      // @Note: We expect to see all of Jan and Feb, and partial Dec (18) and Mar (19)
      const lastDayOfMarch = /2020-2-31/
      expect(queryByText(lastDayOfMarch)).toBeNull()
      const nextBtn = getByText('next')
      fireEvent.click(nextBtn)
      // @Note: We now expect to see all of Feb and Mar, and partial Jan/Apr
      getByText(lastDayOfMarch)
    })
    it('prev button works', () => {
      const { getByText, queryByText } = render(
        <DatePicker
          range={[new Date('2019-12-31'), new Date('2020-12-31')]}
          selectedDate={[new Date('2020-01-01'), new Date('2020-01-01')]}
          onDateChanged={jest.fn()}
          type="single"
        />
      )
      const nextBtn = getByText('next')
      const prevBtn = getByText('prev')

      const lastDayOfMarch = /2020-2-31/
      expect(queryByText(lastDayOfMarch)).toBeNull()
      fireEvent.click(nextBtn)
      getByText(lastDayOfMarch)
      fireEvent.click(prevBtn)
      expect(queryByText(lastDayOfMarch)).toBeNull()
    })
    it('prev button has limit', () => {
      const { getByText, queryByText } = render(
        <DatePicker
          range={[new Date('2019-12-31'), new Date('2020-12-31')]}
          selectedDate={[new Date('2020-01-01'), new Date('2020-01-01')]}
          onDateChanged={jest.fn()}
          type="single"
        />
      )
      const prevBtn = getByText('prev')

      fireEvent.click(prevBtn)
      fireEvent.click(prevBtn)

      // @Note: Don't expect to see 1 Nov
      expect(queryByText(/2019-10-1/)).toBeNull()
    })
    it('next button has limit', () => {
      const { getByText, queryByText } = render(
        <DatePicker
          range={[new Date('2019-12-31'), new Date('2020-12-31')]}
          selectedDate={[new Date('2020-11-01'), new Date('2020-11-01')]}
          onDateChanged={jest.fn()}
          type="single"
        />
      )
      const nextBtn = getByText('next')

      expect(queryByText(/2021-0-31/)).toBeNull()
      fireEvent.click(nextBtn)
      expect(queryByText(/2021-0-31/)).toBeNull()
    })
    it('sets initial cursor', () => {
      const { getByText } = render(
        <DatePicker
          range={[new Date('2018-12-31'), new Date('2020-12-31')]}
          selectedDate={[new Date('2019-07-04'), new Date('2019-07-04')]}
          onDateChanged={jest.fn()}
          type="single"
        />
      )
      getByText(/2019-6-1/) // 1st July
    })
  })

  describe('onDateChanged', () => {
    it('works for single dates', () => {
      const mockedOnChange = jest.fn()
      const { getAllByText } = renderWithState({
        onDateChanged: mockedOnChange
      })

      const jan15 = getAllByText('2019-0-15')[0]
      fireEvent.click(jan15)
      expect(mockedOnChange).toHaveBeenCalledWith([
        new Date('2019-01-15'),
        new Date('2019-01-15')
      ])
    })
    it('[range] works when no date is selected yet', () => {
      const mockedOnChange = jest.fn()
      const { getAllByText } = renderWithState({
        type: 'range',
        onDateChanged: mockedOnChange
      })

      const jan15 = getAllByText('2019-0-15')[0]
      fireEvent.click(jan15)
      expect(mockedOnChange).toHaveBeenCalledWith([
        new Date('2019-01-15'),
        new Date('2019-01-15')
      ])
    })
    it('[range] works when clicked date is before existing date', () => {
      const { getAllByText, getByText } = renderWithState({
        type: 'range'
      })

      const jan13 = getAllByText('2019-0-13')[0]
      const jan15 = getAllByText('2019-0-15')[0]
      fireEvent.click(jan15)
      fireEvent.click(jan13)

      getByText(
        JSON.stringify([new Date('2019-01-13'), new Date('2019-01-15')])
      )
    })
    it('[range] works when clicked date is after existing date', () => {
      const { getAllByText, getByText } = renderWithState({
        type: 'range'
      })

      const jan13 = getAllByText('2019-0-13')[0]
      const jan15 = getAllByText('2019-0-15')[0]
      fireEvent.click(jan13)
      fireEvent.click(jan15)

      getByText(
        JSON.stringify([new Date('2019-01-13'), new Date('2019-01-15')])
      )
    })
    it('[range] works when clicked date is before selected range', () => {
      const { getAllByText, getByText } = renderWithState({
        type: 'range'
      })

      const jan11 = getAllByText('2019-0-11')[0]
      const jan13 = getAllByText('2019-0-13')[0]
      const jan15 = getAllByText('2019-0-15')[0]
      fireEvent.click(jan13)
      fireEvent.click(jan15)
      fireEvent.click(jan11)

      getByText(
        JSON.stringify([new Date('2019-01-11'), new Date('2019-01-11')])
      )
    })
    it('[range] works when clicked date is after selected range', () => {
      const { getAllByText, getByText } = renderWithState({
        type: 'range'
      })

      const jan11 = getAllByText('2019-0-11')[0]
      const jan13 = getAllByText('2019-0-13')[0]
      const jan15 = getAllByText('2019-0-15')[0]
      fireEvent.click(jan11)
      fireEvent.click(jan13)
      fireEvent.click(jan15)

      getByText(
        JSON.stringify([new Date('2019-01-15'), new Date('2019-01-15')])
      )
    })
    it('[range] works when clicked date is inside selected range', () => {
      const { getAllByText, getByText } = renderWithState({
        type: 'range'
      })

      const jan11 = getAllByText('2019-0-11')[0]
      const jan13 = getAllByText('2019-0-13')[0]
      const jan15 = getAllByText('2019-0-15')[0]
      fireEvent.click(jan11)
      fireEvent.click(jan15)
      fireEvent.click(jan13)

      getByText(
        JSON.stringify([new Date('2019-01-11'), new Date('2019-01-13')])
      )
    })
  })

  describe('renderProps', () => {
    it('passes next button', () => {
      const { getByText, getByTestId } = render(
        <DatePicker
          range={[new Date('2018-12-31'), new Date('2020-12-31')]}
          selectedDate={[new Date('2019-07-04'), new Date('2019-07-04')]}
          onDateChanged={jest.fn()}
          type="single"
          renderNextBtn={p => (
            <button {...p} data-testid="next-renderprop">
              NEXT
            </button>
          )}
        />
      )

      getByText('NEXT')
      getByTestId('next-renderprop')
    })
    it('passes previous button', () => {
      const { getByText, getByTestId } = render(
        <DatePicker
          range={[new Date('2018-12-31'), new Date('2020-12-31')]}
          selectedDate={[new Date('2019-07-04'), new Date('2019-07-04')]}
          onDateChanged={jest.fn()}
          type="single"
          renderPrevBtn={p => (
            <button {...p} data-testid="prev-renderprop">
              PREVIOUS
            </button>
          )}
        />
      )

      getByText('PREVIOUS')
      getByTestId('prev-renderprop')
    })
    it('passes renderMonthAndCursor', () => {
      const { getAllByText, getAllByTestId } = render(
        <DatePicker
          range={[new Date('2018-12-31'), new Date('2020-12-31')]}
          selectedDate={[new Date('2019-07-04'), new Date('2019-07-04')]}
          onDateChanged={jest.fn()}
          type="single"
          renderMonthAndCursor={({ children }) => (
            <div data-testid="month-and-cursor-renderprop">
              <p>Arbitrary Heading</p>
              {children}
            </div>
          )}
        />
      )

      expect(getAllByTestId('month-and-cursor-renderprop')).toHaveLength(2)
      expect(getAllByText('Arbitrary Heading')).toHaveLength(2)
    })
    it('passes renderDaysOfWeek', () => {
      const { getAllByText } = render(
        <DatePicker
          range={[new Date('2018-12-31'), new Date('2020-12-31')]}
          selectedDate={[new Date('2019-07-04'), new Date('2019-07-04')]}
          onDateChanged={jest.fn()}
          type="single"
          renderDaysOfWeek={() => <div>Test Days of Week</div>}
        />
      )

      expect(getAllByText('Test Days of Week')).toHaveLength(2)
    })
    it('passes renderDates', () => {
      const { getAllByTestId } = render(
        <DatePicker
          range={[new Date('2018-12-31'), new Date('2020-12-31')]}
          selectedDate={[new Date('2019-07-04'), new Date('2019-07-04')]}
          onDateChanged={jest.fn()}
          type="single"
          renderDates={({ dates }) => (
            <div data-testid="dates-renderprop">{JSON.stringify(dates)}</div>
          )}
        />
      )

      expect(getAllByTestId('dates-renderprop')).toHaveLength(2)
    })
    it('passes selected date config', () => {
      const { getByText } = render(
        <DatePicker
          range={[new Date('2019-01-10'), new Date('2019-12-31')]}
          selectedDate={[new Date('2019-01-20'), new Date('2019-01-20')]}
          onDateChanged={jest.fn()}
          type="single"
          renderDates={({ dates }) => (
            <div data-testid="dates-renderprop">
              {dates.map(({ date, ...rest }) => (
                <div key={date.join('-')}>
                  date: {date.join('-')}
                  {JSON.stringify(rest)}
                </div>
              ))}
            </div>
          )}
        />
      )
      getByText(content => {
        const isSelectedDate = /2019-0-20/.test(content)
        const isMarkedSelected = /"isSelected":true/.test(content)
        const isMarkedFirstSelected = /"isFirstSelected":true/.test(content)
        const isMarkedLastSelected = /"isLastSelected":true/.test(content)
        return (
          isSelectedDate &&
          isMarkedSelected &&
          isMarkedFirstSelected &&
          isMarkedLastSelected
        )
      })
    })
    it('passes weekend date config', () => {
      const { getByText } = render(
        <DatePicker
          range={[new Date('2019-01-10'), new Date('2019-12-31')]}
          selectedDate={[new Date('2019-01-20'), new Date('2019-01-20')]}
          onDateChanged={jest.fn()}
          type="single"
          renderDates={({ dates }) => (
            <div data-testid="dates-renderprop">
              {dates.map(({ date, ...rest }) => (
                <div key={date.join('-')}>
                  date: {date.join('-')}
                  {JSON.stringify(rest)}
                </div>
              ))}
            </div>
          )}
        />
      )
      getByText(content => {
        const isWeekend = /2019-1-23/.test(content)
        const isMarkedWeekend = /"isWeekend":true/.test(content)
        return isWeekend && isMarkedWeekend
      })
    })
    it('passes hidden date config', () => {
      const { getByText } = render(
        <DatePicker
          range={[new Date('2019-01-10'), new Date('2019-12-31')]}
          selectedDate={[new Date('2019-01-20'), new Date('2019-01-20')]}
          onDateChanged={jest.fn()}
          type="single"
          renderDates={({ dates }) => (
            <div data-testid="dates-renderprop">
              {dates.map(({ date, ...rest }) => (
                <div key={date.join('-')}>
                  date: {date.join('-')}
                  {JSON.stringify(rest)}
                </div>
              ))}
            </div>
          )}
        />
      )
      getByText(content => {
        const isHidden = /2019-2-1/.test(content)
        const isMarkedHidden = /"isHidden":true/.test(content)
        return isHidden && isMarkedHidden
      })
    })
    it('passes disabled date config', () => {
      const { getByText } = render(
        <DatePicker
          range={[new Date('2019-01-10'), new Date('2019-12-31')]}
          selectedDate={[new Date('2019-01-20'), new Date('2019-01-20')]}
          onDateChanged={jest.fn()}
          type="single"
          renderDates={({ dates }) => (
            <div data-testid="dates-renderprop">
              {dates.map(({ date, ...rest }) => (
                <div key={date.join('-')}>
                  date: {date.join('-')}
                  {JSON.stringify(rest)}
                </div>
              ))}
            </div>
          )}
        />
      )
      getByText(content => {
        const isDisabled = /2019-0-1/.test(content)
        const isMarkedDisabled = /"isDisabled":true/.test(content)
        return isDisabled && isMarkedDisabled
      })
    })
    it('passes renderYearSelector', () => {
      const { getByText, getAllByText, queryAllByText } = render(
        <DatePicker
          range={[new Date('2018-12-31'), new Date('2022-07-04')]}
          selectedDate={[new Date('2019-07-04'), new Date('2019-07-04')]}
          onDateChanged={jest.fn()}
          type="single"
          renderYearSelector={({ selectYear }) => (
            <button
              data-testid="year-select-renderprop"
              onClick={() => selectYear(2021)}
            >
              Set Year to 2021
            </button>
          )}
        />
      )

      expect(queryAllByText(/2021-0-1/)).toHaveLength(0)
      const changeYear = getByText('Set Year to 2021')
      fireEvent.click(changeYear)
      expect(getAllByText(/2021-0-1/)).toHaveLength(2)
    })
    it('year selector works when range does not start in Jan', () => {
      const { getByText } = render(
        <DatePicker
          range={[new Date('2018-05-01'), new Date('2019-11-31')]}
          selectedDate={null}
          onDateChanged={jest.fn()}
          type="single"
          renderYearSelector={({ selectedYear, selectYear }) => (
            <React.Fragment>
              <p>Current Year: {selectedYear}</p>
              <button
                data-testid="year-select-renderprop"
                onClick={() => selectYear(2018)}
              >
                Set Year to 2018
              </button>
              <button
                data-testid="year-select-renderprop"
                onClick={() => selectYear(2019)}
              >
                Set Year to 2019
              </button>
            </React.Fragment>
          )}
        />
      )

      const changeYear2018 = getByText('Set Year to 2018')
      const changeYear2019 = getByText('Set Year to 2019')
      fireEvent.click(changeYear2019)
      getByText('Current Year: 2019')
      fireEvent.click(changeYear2018)
      getByText('Current Year: 2018')
      getByText(/2018-4-1/)
    })
  })
})

function renderWithState(props?: Partial<IDatePickerProps>) {
  function DateState() {
    const [selectedDate, setSelectedDate] = React.useState(null)
    return (
      <React.Fragment>
        <div data-testid="assert-container">{JSON.stringify(selectedDate)}</div>
        <DatePicker
          range={[new Date('2019-01-01'), new Date('2019-12-31')]}
          type="single"
          selectedDate={selectedDate}
          onDateChanged={d => setSelectedDate(d)}
          renderDates={({ dates }) =>
            dates.map(({ date, onClick }) => (
              <div key={date.join('-')} onClick={onClick}>
                {date.join('-')}
              </div>
            ))
          }
          {...props}
        />
      </React.Fragment>
    )
  }
  return render(<DateState />)
}
