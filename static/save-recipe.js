(function() {
  const rgHost = 'https://recipes-ui-dycgvjyr2a-uw.a.run.app';
  const rgSaveUrl = encodeURIComponent(location.href);
  const rgPath = '/bookmarklet';

  if (rgHost !== '') {
    const rgUrl = rgHost + rgPath;
    const rgDiv = document.createElement('div');
    rgDiv.style.cssText = "position:fixed;top:0;width:100%;z-index:2147483647";

    const rgIframe = document.createElement('iframe');
    rgIframe.id = 'nytIframe';
    rgIframe.style.cssText = "width:100%;position:fixed;border:0;left:0";

    rgIframe.setAttribute('src', rgUrl + "?url=" + rgSaveUrl);
    rgDiv.appendChild(rgIframe);
    document.body.appendChild(rgDiv);
  }

  function receiveMessage(event)
  {
    if (event.origin !== rgHost)
      return;
    if (event.data == 'remove' && rgDiv.hasChildNodes()) {
      rgDiv.removeChild(rgIframe); // clean up iframe on page
    } else if (event.data == 'authHeight') {
      rgIframe.style.height = '100%';
    } else if (event.data == 'bookmarkletHeight') {
      rgIframe.style.height = '60px';
    }
  }
  window.addEventListener("message", receiveMessage, false);

})();
