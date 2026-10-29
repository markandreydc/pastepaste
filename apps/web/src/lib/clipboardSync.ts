import { decryptText, encryptText, type EncryptedText } from './crypto'

type ClipboardSyncOptions = {
  key: CryptoKey
  send: (payload: EncryptedText) => Promise<void>
  onText: (text: string) => void
  onSynced: () => void
  onSendError: () => void
  onReceiveError: () => void
}

export function createClipboardSync(options: ClipboardSyncOptions) {
  let active = true
  let pending: string | null = null
  let sending = false
  let localRevision = 0
  let receiveRevision = 0

  async function flush() {
    if (sending || !active) return
    sending = true

    try {
      while (pending !== null && active) {
        const nextText = pending
        pending = null

        try {
          const encrypted = await encryptText(options.key, nextText)
          if (!active) return
          await options.send(encrypted)
        } catch {
          if (active) {
            pending ??= nextText
            options.onSendError()
          }
          return
        }
      }

      if (active) options.onSynced()
    } finally {
      sending = false
    }
  }

  return {
    send(nextText: string) {
      if (!active) return
      localRevision += 1
      pending = nextText
      void flush()
    },
    async receive(payload: EncryptedText) {
      if (!active) return
      const revision = ++receiveRevision
      const editRevision = localRevision
      const isCurrent = () => active
        && revision === receiveRevision
        && editRevision === localRevision

      try {
        const nextText = await decryptText(options.key, payload)
        if (!isCurrent()) return
        options.onText(nextText)
        if (!sending && pending === null) options.onSynced()
      } catch {
        if (isCurrent()) options.onReceiveError()
      }
    },
    dispose() {
      active = false
      pending = null
    },
  }
}
