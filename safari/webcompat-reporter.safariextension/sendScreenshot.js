safari.self.addEventListener("message", function(event){
  if (event.name === "screenshot-data") {
    window.postMessage(event.message, "*");
  }
}, false);

if (window === window.top && window.location.host == "webcompat.com") {
  safari.self.tab.dispatchMessage("request-screenshot", "");
}