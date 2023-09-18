// alert('Hello from inject.js')

const iframeId = 'lanista-helper'
const iframe = document.createElement('iframe')
iframe.id = iframeId
iframe.src = chrome.runtime.getURL('index.html')
// iframe.style.backgroundColor = 'rbga(0,0,0,0.5)'
iframe.style.position = 'fixed'
iframe.style.zIndex = '1000'
iframe.style.height = '48px'
// iframe.style.minHeight = '64px'

// iframe.style.height = 'auto'
iframe.style.width = '48px'
iframe.style.bottom = '0'
iframe.style.right = '0'
iframe.style.border = 'none'
// iframe.style.right = '0'
// iframe.style.bottom = '0'
// iframe.style.pointerEvents = 'none'

// var iframe = document.createElement('p') // is a node
// iframe.innerHTML = 'ANTON TEST'
// document.body.appendChild(iframe)

console.log('document: ', document)
console.log('iframe: ', iframe)

// document.body.appendChild(iframe)

// var object = document.createElement('embed')
// object.src = index

const existingElement = document.getElementById(iframeId)
console.log('existingElement: ', existingElement)
if (existingElement) {
  existingElement.remove()
}
document.body.appendChild(iframe)
