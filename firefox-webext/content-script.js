var url = '';
function messenger() {
    chrome.runtime.sendMessage(
      {'message': url}
    );
}
function extractDomain(url) {
   var domain;
   if (url.indexOf("://") > -1) {
     domain = url.split('/')[2];
   }
   else {
     domain = url.split('/')[0];
   }
   domain = domain.split(':')[0];
   return domain;
}
url = extractDomain(window.location.href);
messenger();
