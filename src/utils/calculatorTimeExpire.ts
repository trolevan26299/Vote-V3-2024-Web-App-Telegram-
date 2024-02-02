import { parse, format } from 'date-fns';

export const ExpireTimeFunc = (currentTime: string, expireTime: string) => {
  console.log('type current time :', currentTime);
  console.log('type expire time:', expireTime);
  const expireHours = parseInt(expireTime, 10);
  const currentTimeObject = parse(currentTime, 'dd/MM/yyyy HH:mm:ss', new Date());
  const expirationTimeObject = new Date(currentTimeObject.getTime() + expireHours * 60 * 1000);
  const formattedExpirationTime = format(expirationTimeObject, 'dd/MM/yyyy HH:mm:ss');
  return formattedExpirationTime;
};
