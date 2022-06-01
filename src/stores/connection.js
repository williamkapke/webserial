import { defineStore } from 'pinia'
import {ref} from "vue";
import {hex} from "../util.js";
import { getUsbInfo } from "../usb-ids.js"

const vid_pid = (port) => {
  const info = port.getInfo()
  return hex(info.usbVendorId) + ':' + hex(info.usbProductId)
}
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const useConnectionStore = defineStore({
  id: 'connection',
  state: () => ({
    id: undefined,
    vendor: undefined,
    product: undefined,
    port: undefined,
    physicallyConnected: false,
    open: false,
    _reader: undefined,
    options: {
      baudRate: ref(115200),
      bufferSize: ref(255),
      dataBits: ref(8),
      flowControl: ref("none"),
      parity: ref("none"),
      stopBits: ref(1)
    },
    signals: {},
    messages: [],
    prepend: '',
    append: '\n'
  }),
  getters: {
  },
  actions: {
    async selectPort() {
      try {
        if (!navigator.serial) return false

        const port = await navigator.serial.requestPort()
        const info = await getUsbInfo(port)
        window.location.search = `?vid=${info.vid}&pid=${info.pid}`
        return true
      }
      catch(e) {}
    },
    async init(vid, pid) {
      const ports = await navigator.serial.getPorts()
      const id = vid + ':' + pid
      this.port = ports.find((port) => vid_pid(port) === id)
      if (!this.port) {
        window.location.search = ``
        return;
      }
      this.id = id
      const info = await getUsbInfo(this.port)
      this.vendor = info.vendor
      this.product = info.product
      this.physicallyConnected = true

      // notification for a USB device getting physically connected
      const onconnect = (e) => {
        console.log(id + 'device connected', e)
        this.port = e.target
        this.physicallyConnected = true
      }
      navigator.serial.addEventListener('connect', onconnect);

      // notification for a USB device getting physically disconnected
      const ondisconnect = (e) => {
        console.log(id + ' disconnect')
        this.physicallyConnected = false
        this.open = false
      }
      navigator.serial.addEventListener('disconnect', ondisconnect);
      console.log(id + ' initialized')
    },
    async connect() {
      if (!this.port) return
      console.log(this.id + ': opening')
      try {
        await this.port.open(this.options)
        this.open = !!this.port?.readable
        console.log(this.id + ': opened')
        // const { clearToSend, dataCarrierDetect, dataSetReady, ringIndicator} = await this.port.getSignals()
        // console.log({ clearToSend, dataCarrierDetect, dataSetReady, ringIndicator})
        this.monitor()
      }
      catch (e) {
        console.log(e)
        window.alert(e.message)
      }
    },
    async monitor() {
      console.log('monitor()')
      while (this.open && this.port?.readable) {
        this.open = true
        const reader = this.port.readable.getReader()
        this._reader = reader
        try {
          while (this.open) {
            console.log('reading...')
            const { value, done } = await reader.read()
            if (done) {
              // |reader| has been canceled.
              this.open = false
              break;
            }
            const decoded = decoder.decode(value)
            // console.log('read complete:', decoded, value, done)
            this.messages.push(decoded)
          }
        } catch (error) {
          console.error('reading error', error)
        } finally {
          reader.releaseLock()
        }
      }
    },
    async write(data) {
      if (this.port?.writable) {
        const writer = this.port.writable.getWriter()
        await writer.write(encoder.encode(data))
        writer.releaseLock()
      }
    },
    async close() {
      if (this._reader) {
        await this._reader.cancel()
      }
      this.port.close()
    }
  }
})



export { useConnectionStore }
