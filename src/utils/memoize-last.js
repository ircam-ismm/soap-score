export default function memoizeLast(func) {
  let lastArguments = null;
  let lastResult = null;

  return function(...args) {
    if (lastArguments !== null && args.every((item, index) => item === lastArguments[index])) {
      return lastResult;
    }

    lastResult = func(...args);
    lastArguments = args;
    return lastResult;
  }
}
