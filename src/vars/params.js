var __ParamsHandler = {

  isRunningOnServer () {
    return typeof global !== 'undefined'
  },

  bundle () {
    return this.isRunningOnServer() ? global._mainParams : _params
  },

  get (name) {
    return this.bundle()[name]
  },

  all () {
    var { all, ...result } = { ...this, ...this._public, ...this._private }
    return result
  },

  publics () {
    var { all, _private, publics, ...result } = { ...this, ...this._public }
    return result
  },

  export () {
    var keys = Object.keys(this._public).map((key) => {
      return Str.between(this._public[key].toString(), "('", "')")
    })

    return keys.reduce((o, key) => {
      o[key] = this.bundle()[key]
      return o
    }, {})
  },

  /** Bellow Functions are visible only on backend **/
  _private: {
    productImageUrl (sku) {
      return this.productionUrl() + '/product/image-redirect?sku=' + sku
    },

    productUrl (sku) {
      return this.productionUrl() + '/product/url-redirect?sku=' + sku
    },

    productionUrl () {
      return this.get('prodution-url')
    },

    storeUrl () {
      return this.get('store-url')
    },

    storeFeedUrl () {
      return this.get('store-feed-url')
    },

    eccosysUrl () {
      return this.get('eccosys-url')
    },

    eccosysApi () {
      return this.get('eccosys-api')
    },

    eccosysSecret () {
      return this.get('eccosys-secret')
    },

    eccosysApiReportEmails () {
      return this.get('eccosys-api-down-email')
    },

    emailName () {
      return this.get('email-name')
    },

    replayEmail () {
      return this.get('email-reply')
    },

    email () {
      return this.get('email')
    },

    emailPass () {
      return this.get('email-pass')
    },

    imgurId () {
      return this.get('imgur-id')
    },

    imgurEmail () {
      return this.get('imgur-email')
    },

    imgurPass () {
      return this.get('imgur-pass')
    },

    mundipaggUrl () {
      return this.get('mundipagg-url')
    },

    mundipaggSecret () {
      return this.get('mundipagg-secret')
    },

    magentoUrl () {
      return this.get('magento-url')
    },

    magentoXmlPath () {
      return this.get('xmlrpc-path')
    },

    magentoLogin () {
      return this.get('magento-login')
    },

    magentoPass () {
      return this.get('magento-pass')
    },

    updateProductWeightMagento () {
      return this.get('update-product-weight-magento')
    },

    updateProductStockMagento () {
      return this.get('update-product-stock-magento')
    },

    devMaxSalesOnPicking () {
      return this.get('dev-max-sales-picking')
    },

    androidAppKey () {
      return this.get('android-id')
    },

    apiAppKeys () {
      return this.get('api-app-keys')
    },

    accessTimeRenew () {
      return this.get('access-time-renew')
    },

    workTimeRange () {
      return this.get('work-time-range').split('-')
    },

    trackingUrl () {
      return this.get('tracking-url')
    },

    trackingUrlExt () {
      return this.get('tracking-url-ext')
    },

    getResponseSecret () {
      return this.get('getresponse-key')
    },

    getResponseDomain () {
      return this.get('getresponse-domain')
    },

    getResponseCheckbox () {
      return this.get('getresponse-checkbox')
    },

    getResponseBaseId () {
      return this.get('getresponse-base-id')
    },

    performanceEmailsReport () {
      return this.get('performance-emails')
    },

    activePerformanceEmailReport () {
      return this.get('active-performance-report')
    },

    enableJobsOnDevMode () {
      return this.get('enable-jobs-on-dev')
    },

    getEmailPaymentNotify () {
      return this.get('recused-payment')
    },

    getGDriveToken() {
      return this.get('gdrive-token')
    },

    getGDriveCredentials() {
      return this.get('gdrive-credentials')
    },

    getGDriveFolder() {
      return this.get('gdrive-folder')
    }
  },

  /** Bellow Functions  are visible on frontend **/
  _public: {

    autoBlockPending () {
      return this.get('auto-block-pending')
    },

    timeBlockPending () {
      return this.get('time-block-pending')
    },

    activeDifalControlOC () {
      return this.get('active-difal-oc')
    },
    difalUfs () {
      return this.get('difal-ufs')
    }
  }

}

const Params = __ParamsHandler.publics()

if (typeof module !== 'undefined') {
  module.exports = __ParamsHandler.all()
}

__ParamsHandler = {}
