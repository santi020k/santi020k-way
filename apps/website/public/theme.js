try {
  const saved = localStorage.getItem('way-theme')
  let system = 'dark'

  if (matchMedia('(prefers-color-scheme: light)').matches) system = 'light'

  document.documentElement.dataset.theme = saved === 'light' || saved === 'dark' ? saved : system
} catch {
  // The default appearance remains available when storage is unavailable.
}
