const mapThMonthToNumber = (thMonth: string) => {
  const thMonths = [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ]

  const monthNo = thMonths.indexOf(thMonth) + 1

  if (monthNo >= 10) {
    return String(monthNo)
  }

  return `0${monthNo}`
}

export default mapThMonthToNumber
