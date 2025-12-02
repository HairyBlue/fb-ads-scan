export const fbAdsLibraryUrl = 'https://www.facebook.com/ads/library/';

export const defaultFbAdsQrP = {
  active_status: 'active',
  ad_type: 'all',
  country: 'ALL',
  is_targeted_country: false,
  media_type: 'all',
  search_type: 'page',
};

export const defaultChromeArgs: string[] = [
  // Incognito / Privacy
  //   '--incognito',

  // Window / Display
  '--window-position=0,0',
  '--window-size=1280,1000',

  // Sandbox / Security / Site Isolation
  '--no-sandbox',
  '--disable-web-security',
  '--disable-site-isolation-trials',
  '--disable-features=IsolateOrigins,site-per-process',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions', // disable all extensions
  '--ignore-certificate-errors', // ignore invalid SSL certs
  '--ignore-ssl-errors', // ignore SSL errors

  // Automation detection
  '--disable-blink-features=AutomationControlled',
  '--disable-infobars',
  '--disable-popup-blocking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-window-activation',
  '--disable-focus-on-load',

  // WebGL / GPU / Graphics
  '--disable-gpu',
  '--disable-webgl',
  '--disable-webgl-image-chromium',
  '--disable-webgl2',
  '--disable-accelerated-2d-canvas',
  '--disable-accelerated-jpeg-decoding',
  '--disable-accelerated-video-decode',
  '--disable-accelerated-mjpeg-decode',
  '--disable-software-rasterizer',

  // Performance / Memory
  '--disable-dev-shm-usage',
  '--disable-logging',
  '--disable-breakpad',
  '--disable-crash-reporter',

  // Debug / Remote
  '--remote-debugging-port=9222',
  // '--no-startup-window'  // optional

  // Optional stealth / anti-fingerprinting
  '--enable-features=NetworkService,NetworkServiceInProcess', // reduces detection
  '--disable-webrtc', // block WebRTC IP leaks
  '--hide-scrollbars', // mimic real browsing behavior
  '--disable-background-networking', // block background requests that reveal automation
];
