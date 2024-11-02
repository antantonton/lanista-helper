const originalXHROpen = window.XMLHttpRequest.prototype.open
window.XMLHttpRequest.prototype.open = function (method, url) {
  this.addEventListener('load', function () {
    window.postMessage(
      { type: 'FROM_INTERCEPTOR', url: url, responseText: this.responseText },
      '*',
    )
  })
  return originalXHROpen.apply(this, arguments)
}
