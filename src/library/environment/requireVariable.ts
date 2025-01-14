export function requireVariable(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`${name} missing`)
    throw new Error(`${name} missing`)
  }
  return value
}
