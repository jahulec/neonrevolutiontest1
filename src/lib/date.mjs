export function displayDate(date) {
  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year}`;
}
