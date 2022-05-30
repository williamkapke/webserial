import { defineStore } from 'pinia'
import {ref} from "vue";
import {hex} from "../util.js";
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
    port: undefined,
    physicallyConnected: false,
    open: false,
    options: {
      baudRate: ref(115200),
      bufferSize: ref(255),
      dataBits: ref(8),
      flowControl: ref("none"),
      parity: ref("none"),
      stopBits: ref(1)
    },
    signals: {},
    messages: [
      // 'Mess\x0Dage1\x7FMessage1\x02Message1\x03Message1 Message1ES',
      // '00000000000000000000000000000000000000000000000000000000000000000',
      // 'This is #2 This is #2 This is #2 This is #2 This is #2',
      // 'Here comes 3 Here comes 3 Here comes 3 Here comes 3 ',
      // '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F',
      // '000000000000000000000000000000000',
      // 'May the 4th be with you'
    ]
  }),
  getters: {
  },
  actions: {
    async selectPort() {
      try {
        if (!navigator.serial) return false

        this.port = await navigator.serial.requestPort()
        const id = vid_pid(this.port)
        this.id = id
        this.physicallyConnected = true

        // notification for a USB device getting physically connected
        const onconnect = (e) => {
          console.log(id + 'device connected', e)
          if (!this.physicallyConnected && vid_pid(e.target) === id) {
            this.port = e.target
            this.physicallyConnected = true
          }
        }
        navigator.serial.addEventListener('connect', onconnect);

        // notification for a USB device getting physically disconnected
        const ondisconnect = (e) => {
          console.log(id + ' disconnect', e)
          if (this.physicallyConnected && e.target === this.port) {
            this.physicallyConnected = false
            this.open = false
          }
        }
        navigator.serial.addEventListener('disconnect', ondisconnect);
        return true
      }
      catch(e) {}
    },
    async connect() {
      if (!this.port) return
      console.log(this.id + ': opening')
      await this.port.open(this.options)
      this.open = !!this.port?.readable
      console.log(this.id + ': opened')
      // const { clearToSend, dataCarrierDetect, dataSetReady, ringIndicator} = await this.port.getSignals()
      // console.log({ clearToSend, dataCarrierDetect, dataSetReady, ringIndicator})
      this.monitor()
    },
    async monitor() {
      console.log('monitor()')
      while (this.port?.readable) {
        this.open = true
        const reader = this.port.readable.getReader();
        try {
          while (this.open) {
            console.log('reading...')
            const { value, done } = await reader.read();
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
          reader.releaseLock();
        }
      }
    },
    async write(data) {
      if (this.port?.writable) {
        const writer = this.port.writable.getWriter();
        await writer.write(encoder.encode(data));
        writer.releaseLock();
      }
    }
  }
})

//
// navigator.serial.getPorts().then((ports) => {
//   // Initialize the list of available ports with `ports` on page load.
//   known_ports.value = ports
//   console.log('known_ports', ports)
// });



export { useConnectionStore }
