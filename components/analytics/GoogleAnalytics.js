import Script from 'next/script'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

import siteMetadata from '@/data/siteMetadata'

const GAScript = () => {
  const router = useRouter()
  useEffect(() => {
    const pageView = () =>
      window.gtag?.('event', 'page_view', {
        page_path: window.location.pathname,
        page_location: window.location.href,
        page_title: document.title,
        send_to: siteMetadata.analytics.googleAnalyticsId,
      })
    const bookingClick = (event) => {
      const link = event.target instanceof Element && event.target.closest('a[href]')
      if (!link || new URL(link.href).hostname !== 'calendly.com') return
      window.gtag?.('event', 'book_a_call_click', {
        link_url: link.href,
        send_to: siteMetadata.analytics.googleAnalyticsId,
      })
    }
    router.events.on('routeChangeComplete', pageView)
    document.addEventListener('click', bookingClick)
    return () => {
      router.events.off('routeChangeComplete', pageView)
      document.removeEventListener('click', bookingClick)
    }
  }, [router.events])
  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${siteMetadata.analytics.googleAnalyticsId}`}
      />

      <Script strategy="lazyOnload" id="ga-script">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${siteMetadata.analytics.googleAnalyticsId}', {
              page_path: window.location.pathname,
            });
        `}
      </Script>
    </>
  )
}

export default GAScript

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const logEvent = (action, category, label, value) => {
  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
