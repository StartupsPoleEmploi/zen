import ReactGA from 'react-ga'

const ZEN_TRACKER_NAME = 'ZEN_TRACKER'
const REACT_APP_GA_ID = process.env.REACT_APP_GA_ID || 'UA-119908609-2'

export class GoogleAnalyticsService {
  static initGoogleAnalytics() {
    if (REACT_APP_GA_ID && REACT_APP_GA_ID !== '') {
      const ids = [
        {
          trackingId: REACT_APP_GA_ID,
          gaOptions: { name: ZEN_TRACKER_NAME },
        },
      ]

      // Anonymous mode for RGPD purpose : https://developers.google.com/analytics/devguides/collection/analyticsjs/ip-anonymization
      ReactGA.initialize(ids, {
        gaOptions: { cookieExpires: 31536000, anonymizeIp: true },
      })
    }
  }

  static isGASetup() {
    return REACT_APP_GA_ID && REACT_APP_GA_ID !== ''
  }

  static getTrackers() {
    return [ZEN_TRACKER_NAME]
  }

  static setPageView(pageView) {
    const trackers = GoogleAnalyticsService.getTrackers()
    ReactGA.set({ page: pageView }, trackers)
    ReactGA.pageview(pageView, trackers)
  }

  static sendEvent({ category, action }) {
    const trackers = GoogleAnalyticsService.getTrackers()
    ReactGA.event({ category, action }, trackers)
  }
}
