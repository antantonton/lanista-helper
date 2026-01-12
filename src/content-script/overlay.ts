import { Me } from 'src/app/shared/services/me-api.service'

export async function openOverlay(me: Me) {
  // Create pip window
  const pipWindow: Window = await (
    window as any
  ).documentPictureInPicture.requestWindow()
  if (!pipWindow) {
    return
  }

  // Copy all stylesheet links from main document
  Array.from(document.styleSheets).forEach((sheet) => {
    if (sheet.href) {
      const link = pipWindow.document.createElement('link')
      link.rel = 'stylesheet'
      link.href = sheet.href
      pipWindow.document.head.appendChild(link)
    }
  })

  // Copy CSS variables from main document root
  const rootStyles = getComputedStyle(document.documentElement)
  const childRoot = pipWindow.document.documentElement
  for (const key in rootStyles) {
    if (key.startsWith('--')) {
      childRoot.style.setProperty(key, rootStyles.getPropertyValue(key))
    }
  }

  // Create container div in the PIP window
  const container = pipWindow.document.createElement('div')
  container.className = 'w-full h-full flex flex-col gap-2 bg-white notice p-3'
  pipWindow.document.body.appendChild(container)

  // Back to lanista button
  const backToTabButton = pipWindow.document.createElement('button')
  backToTabButton.onclick = () => window.focus()
  backToTabButton.textContent = 'Lanista'
  backToTabButton.className = 'btn-action'
  container.appendChild(backToTabButton)

  // Generate content container
  const contentContainer = pipWindow.document.createElement('div')
  contentContainer.id = 'content-container'
  contentContainer.style.pointerEvents = 'none'

  // Generate the cloned content and add it to the container
  const clone = _getClonedContent()
  contentContainer.append(...clone)
  container.appendChild(contentContainer)

  // Start interval for refreshing content
  const interval = setInterval(() => {
    const clone = _getClonedContent()
    contentContainer.replaceChildren(...clone)
  }, 500)

  // Cleanup when window closes
  const cleanup = () => {
    console.log('PIP Window closed, cleaning up.')
    clearInterval(interval)
  }
  pipWindow.addEventListener('pagehide', cleanup)
}

/**
 * Returns the cloned element to put in the overlay content
 * @returns
 */
function _getClonedContent() {
  const [originalElement] = _findChildWithDataIntro(
    document.body,
    'Här ser du din gladiators nuvarande status',
  )
  const characterDataElement = originalElement?.cloneNode(true) as
    | HTMLElement
    | undefined
  if (!characterDataElement) {
    return null
  }

  Array.from(characterDataElement.firstElementChild.children)
    .filter((el) => el.tagName === 'DIV')
    .pop()
    ?.remove()
  Array.from(characterDataElement.firstElementChild.children)
    .filter((el) => el.tagName === 'DIV')
    .pop()
    ?.remove()

  const clonedElements = [
    ..._getPreviousSiblings(originalElement, 3).map(
      (el) => el.cloneNode(true) as HTMLElement,
    ),
    characterDataElement,
  ]
  return clonedElements
}

/**
 * Finds the given nested child element with the given data intro text
 * @param element
 * @param text
 * @returns
 */
function _findChildWithDataIntro(
  element: HTMLElement,
  text: string,
): HTMLElement[] {
  return Array.from(element.querySelectorAll('[data-intro]')).filter((el) =>
    el
      .getAttribute('data-intro')
      ?.toLowerCase()
      ?.trim()
      ?.includes(text?.toLowerCase()?.trim()),
  ) as HTMLElement[]
}

/**
 * Returns the X previous siblings
 * @param el
 * @param count
 * @returns
 */
function _getPreviousSiblings(el: HTMLElement, count: number): HTMLElement[] {
  const parent = el.parentElement
  if (!parent) return []

  const children = Array.from(parent.children)
  const index = children.indexOf(el)

  if (index === -1) return []
  // slice the previous `count` elements before this one
  return children.slice(Math.max(0, index - count), index) as HTMLElement[]
}
