
export const commonHelpers = {
  methods: {
    upperCase(string) {
      return string.replace(/\b\w/g, l => l.toUpperCase())
    }
  }
}