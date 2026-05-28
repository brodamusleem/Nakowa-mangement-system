import { useState, useEffect } from "react"

/**
 * useDebounce — delays updating a value until after `delay` ms of no changes.
 * Use for search inputs so we don't fire an API call on every keystroke.
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 400)
 * useEffect(() => { fetchResults(debouncedSearch) }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
