export default function (data) {
  const fullName = `${data.firstName} ${data.lastName}`
  const dob = new Date(data.dob * 1000).toLocaleDateString('es-MX', {
    timeZone: 'UTC',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit'
  })

  return { fullName, dob, email: data.email }
}
