import calendar, { createMonths } from '../index'

describe('utils', () => {
  describe('calendar utility', () => {
    test('happy path', () => {
      const result = calendar(0, 2019)
      const janDates = result.filter(r => r[1] === 0)
      const decDates = result.filter(r => r[1] === 11)
      const febDates = result.filter(r => r[1] === 1)

      expect(result.length).toBe(42)
      expect(janDates.length).toBe(31)
      expect(decDates.length).toBe(2)
      expect(febDates.length).toBe(9)
    })
  })

  describe('createMonths', () => {
    test('happy path', () => {
      const result = createMonths([new Date(2019, 0, 1), new Date(2019, 1, 1)])

      expect(result.length).toBe(2)
    })

    it('works across years', () => {
      const result = createMonths([
        new Date(2019, 0, 1),
        new Date(2020, 11, 31)
      ])

      expect(result.length).toBe(24)
    })
  })
})
