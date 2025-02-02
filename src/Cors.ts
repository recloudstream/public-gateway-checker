import fetchPonyfill from 'fetch-ponyfill'
import { CheckBase } from './CheckBase'
import { Log } from './Log'
import { HASH_TO_TEST } from './constants'
import type { GatewayNode } from './GatewayNode'
import type { Checkable } from './types'

const { fetch } = fetchPonyfill()

const log = new Log('Cors')

class Cors extends CheckBase implements Checkable {
  _className = 'Cors'
  _tagName = 'div'
  constructor (protected parent: GatewayNode) {
    super(parent, 'div', 'Cors')
  }

  async check (): Promise<void> {
    const now = Date.now()
    const gatewayAndHash = this.parent.gateway.replace(':hash', HASH_TO_TEST)
    const testUrl = `${gatewayAndHash}?now=${now}#x-ipfs-companion-no-redirect`
    // response body can be accessed only if fetch was executed when
    // liberal CORS is present (eg. '*')
    try {
      const response = await fetch(testUrl)
      const { status } = response
      const text = await response.text()
      this.tag.title = `Response code: ${status}`
      if (text.trim().includes('c7TphrPJk4AXlG4P_J3ZRpJ7V3yFzG_cjd-A37ih1fE')) {
        // this.parent.checked()
        this.tag.asterisk()
        this.parent.tag.classList.add('cors')
      } else {
        log.debug('The response text did not match the expected string')
        this.onerror()
        throw new Error(`URL '${testUrl} does not support CORS`)
      }
    } catch (err) {
      log.error(err)
      this.onerror()
      throw err
    }
  }

  checked (): void {
    log.warn('Not implemented yet')
  }

  onerror (): void {
    this.tag.empty()
  }
}

export { Cors }
