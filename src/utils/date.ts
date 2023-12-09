function padZero(n: number) {
  if (n < 10) return `0${n}`;
  return n;
}

export function getHMS(t: number) {
  let time = t;
  time /= 1000;

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  hours = Math.floor(time / 3600);
  time -= hours * 3600;

  minutes = Math.floor(time / 60);
  time -= minutes * 60;

  seconds = Math.floor(time);

  const hourPhrase = `${padZero(hours)}`;
  const minutePhrase = `${padZero(minutes)}`;
  const secondPhrase = `${padZero(seconds)}`;

  if (hours === 0) return [minutePhrase, secondPhrase].join(":");

  return [hourPhrase, minutePhrase, secondPhrase].join(":");
}
