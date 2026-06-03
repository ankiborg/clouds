export const logger = {
  harvest: (msg: string) => console.log(`[HARVEST ${new Date().toISOString()}] ${msg}`),
  classify: (msg: string) => console.log(`[CLASSIFY ${new Date().toISOString()}] ${msg}`),
}
