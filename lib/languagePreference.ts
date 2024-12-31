export function setLanguagePreference(language: string): void {
  localStorage.setItem('languagePreference', language);
}

export function getLanguagePreference(): string | null {
  return localStorage.getItem('languagePreference');
}
