const GA_ID = 'G-LJ62YCR276';

// Load GA4 script
const script = document.createElement('script');
script.async = true;
script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
document.head.appendChild(script);

// Init dataLayer
window.dataLayer = window.dataLayer || [];
// eslint-disable-next-line prefer-rest-params
function gtag() { window.dataLayer.push(arguments); }
window.gtag = gtag;
gtag('js', new Date());
gtag('config', GA_ID);
