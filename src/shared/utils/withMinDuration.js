export function withMinDuration(promise, minMs = 350) {
  return Promise.all([promise, new Promise((r) => setTimeout(r, minMs))]).then(
    ([result]) => result,
  );
}