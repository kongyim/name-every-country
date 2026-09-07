let previousPageLocation

export function trackEvent(name, parameters = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', name, parameters)
}

export function trackPageView(game) {
  if (typeof window === 'undefined') return
  const page = new URL(window.location.href)
  page.hash = game ? `game/${game.id}` : 'menu'
  const parameters = {
    page_title: game ? game.label : 'Name Every Country — Menu',
    page_location: page.href,
    page_referrer: previousPageLocation || document.referrer,
    game_id: game ? game.id : 'menu'
  }
  // Keep subsequent events associated with the current virtual page.
  if (typeof window.gtag === 'function') window.gtag('set', parameters)
  trackEvent('page_view', parameters)
  previousPageLocation = page.href
}
