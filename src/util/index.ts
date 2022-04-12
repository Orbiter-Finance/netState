export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });
}

export function isDevelopment() {
  return process.env.NODE_ENV === "development";
}
