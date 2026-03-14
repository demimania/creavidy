// ============================================================================
// Variable Utils — {variable} syntax extraction and injection
// ============================================================================

/**
 * Extract all unique variable names from a template string.
 * e.g. "Hello {name}, you are {age}" → ["name", "age"]
 */
export function extractVariables(text: string): string[] {
  const matches = text.matchAll(/\{([^}]+)\}/g)
  return [...new Set([...matches].map((m) => m[1]))]
}

/**
 * Inject variable values into a template string.
 * e.g. "Hello {name}" + { name: "World" } → "Hello World"
 * If a variable has no value, it is left as-is: {variable}
 */
export function injectVariables(
  template: string,
  values: Record<string, string>
): string {
  return template.replace(/\{([^}]+)\}/g, (_, key) => values[key] ?? `{${key}}`)
}
