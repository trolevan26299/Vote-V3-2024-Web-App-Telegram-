const currentUTC7Time = new Date().toLocaleString('en-US', {
  timeZone: 'Asia/Bangkok',
  hour12: false,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const [month, day, year, time] = currentUTC7Time.split(/[/, ]+/);

export const currentTimeUTC7 = `${day}/${month}/${year} ${time}`;
