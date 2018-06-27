const start = (queue, handler, freq = 2500) =>
  setInterval(() => next(queue, handler), freq);

const next = (queue, handler) => {
  if (queue.length == 0) return false;
  const img = queue.shift();
  handler(img);
};

export default {
  start,
  next
}