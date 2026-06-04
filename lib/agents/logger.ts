export const logger = {
  harvest: (msg: string) => console.log(`[HARVEST ${new Date().toISOString()}] ${msg}`),
  classify: (msg: string) => console.log(`[CLASSIFY ${new Date().toISOString()}] ${msg}`),
  pattern: (msg: string) => console.log(`[PATTERN ${new Date().toISOString()}] ${msg}`),
  submit: (msg: string) => console.log(`[SUBMIT ${new Date().toISOString()}] ${msg}`),
}
