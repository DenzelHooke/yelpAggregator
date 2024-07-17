export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
