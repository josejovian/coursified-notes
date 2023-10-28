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

  seconds = Math.ceil(time);

  let hourPhrase = `${hours}h`;
  let minutePhrase = `${minutes}m`;
  let secondPhrase = `${seconds}s`;

  if (hours === 0) return [minutePhrase, secondPhrase].join(" ");

  return [hourPhrase, minutePhrase, secondPhrase].join(" ");
}
