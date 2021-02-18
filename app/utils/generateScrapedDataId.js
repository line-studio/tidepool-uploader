export default function (date, value) {
  const epochDate = date.getTime()
  const idWithDot = epochDate + value

  return idWithDot.toString().replace('.', '')
}
