<script setup>
import {hex} from "./util.js";
import { useConnectionStore } from './stores/connection.js'
import {onMounted, ref, watch} from "vue"
import ConnectModal from "./components/ConnectModal.vue"
import AsciiInput from "./components/AsciiInput.vue"
import { decode, encodeWithHtml } from "./asciiEncoder.js"
import { getUsbInfo } from "./usb-ids.js"
const connection = useConnectionStore()
window.conn = connection
const supported = !!navigator.serial
let newlines = ref(true)
let left = ref(0)
let displayedInput = ref('')
let inputData = ref('')
let prepend = ref('')
let append = ref('\n')
const history = []
let historyIndex = 0
let wip = ''
let scrolledToBottom = true

if (navigator.serial) {
  navigator.serial.getPorts().then(async (ports) => {
    console.log('ports', ports)
    for (let port of ports) {
      const {usbVendorId, usbProductId} = port.getInfo()
      const vid = hex(usbVendorId)
      const pid = hex(usbProductId)
      const info = await getUsbInfo(vid, pid)
      console.log('paired', `${vid}:${pid}`, info.product)
    }
    // for await (let port of makeTextFileLineIterator('/public/usb-ids.txt')) {
    //
    // }
    // getUsbInfo('0dd4','0237').then(console.log)
  });
}

watch(inputData, async (data) => {
  displayedInput.value = encodeWithHtml(data, false)
})

function handleToolbarClick(e) {
  if (e.target.tagName !== 'BUTTON') return
  e.preventDefault()
  const textarea = document.querySelector('#input textarea')
  textarea.focus()
  setTimeout(() => {
    document.execCommand('insertText', false, e.target.textContent)
  }, 10)
}
// this works enough for now
const keyCombo = (e) => [
  (e.metaKey || e.key === 'Meta') && 'META',
  (e.ctrlKey || e.key === 'Ctrl') && 'CTRL',
  (e.altKey || e.key === 'Alt') && 'ALT',
  (e.shiftKey || e.key === 'Shift') && 'SHIFT',
  (e.key!=='Meta' && e.key!=='Shift' && e.key!=='Ctrl' && e.key!=='Alt') && e.key.toUpperCase()
].filter(Boolean).join('+')

function inputKeyup(e) {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    return
  }
  wip = e.target.value
}
function inputKeydown(e) {
  // console.log(keyCombo(e), e)
  switch (keyCombo(e)) {
    case 'META+K':
      e.preventDefault()
      connection.messages.length = 0
      return true // say that it has been handled
    case 'META+ENTER':
      document.execCommand('insertText', false, '␊')
      return true
    case 'ENTER':
      // SUBMIT
      e.preventDefault()
      if (history[history.length-1] !== e.target.value) {
        history.push(e.target.value)
      }
      historyIndex = history.length
      wip = ''
      const cmd = prepend.value + e.target.value + append.value
      connection.write(decode(cmd))

      // clear the input
      setInputValue(e.target, '')
      return true // say that it has been handled
    case 'ARROWUP':
      if (historyIndex !== 0) {
        historyIndex--
        setInputValue(e.target, history[historyIndex])
        return true
      }
      break
    case 'ARROWDOWN':
      historyIndex++
      if (historyIndex >= history.length) {
        setInputValue(e.target, wip)
        historyIndex = history.length
        return true
      }
      if (historyIndex < history.length) {
        setInputValue(e.target, history[historyIndex])
        return true
      }
      break
  }
}
function setInputValue(target, value) {
  target.selectionStart = 0
  target.selectionEnd = target.value.length
  document.execCommand('insertText', false, value)
}
// async function connect() {
//   selectingConnection.value = true
//   if(await connection.selectPort()) {
//     //
//   }
//   selectingConnection.value = false
// }

onMounted(() => {
  const consoleDiv = document.querySelector('#console')
  const outputDiv = document.querySelector('#output')
  const resizeObserver = new ResizeObserver(entries => {
    if (scrolledToBottom) {
      window.setTimeout(() => {
        consoleDiv.scrollTop = Number.MAX_SAFE_INTEGER
      },100)
    }
  });
  resizeObserver.observe(outputDiv);
})
function consoleScroll(e) {
  const scrollPoint = e.target.scrollTop + e.target.clientHeight
  scrolledToBottom = scrollPoint+10 >= e.target.scrollHeight
}
</script>

<template>
  <header>
    <h1>WebSerial</h1>
    <span id="cred"> by <a href="https://github.com/williamkapke" target="_blank">William Kapke</a></span>
    <aside>
      <label for="checkbox">New Lines</label><input id="checkbox" type="checkbox" v-model="newlines">
    </aside>
    <ConnectModal></ConnectModal>
  </header>
  <main id="console" :style="{left:left+'px'}" @scroll="consoleScroll">
    <section id="output" :class="{ newlines:newlines }">
      <pre v-for="message in connection.messages" v-html="encodeWithHtml(message)"></pre>
    </section>
  </main>
  <footer :style="{left:left+'px'}">
    <div id="toolbar" @click="handleToolbarClick">
      <button>␀</button>
      <button>␁</button>
      <button>␂</button>
      <button>␃</button>
      <button>␄</button>
      <button>␅</button>
      <button>␆</button>
      <button>␇</button>
      <button>␈</button>
      <button>␉</button>
      <button>␊</button>
      <button>␋</button>
      <button>␌</button>
      <button>␍</button>
      <button>␎</button>
      <button>␏</button>
      <button>␐</button>
      <button>␑</button>
      <button>␒</button>
      <button>␓</button>
      <button>␔</button>
      <button>␕</button>
      <button>␖</button>
      <button>␗</button>
      <button>␘</button>
      <button>␙</button>
      <button>␚</button>
      <button>␛</button>
      <button>␜</button>
      <button>␝</button>
      <button>␞</button>
      <button>␟</button>
      <button>␡</button>
      <span>
        <label for="ascii-input-prepend">PREPEND</label>
        <AsciiInput id="prepend" max-length="2" :value="prepend" @change="prepend = $event"></AsciiInput>
      </span>
      <span>
        <label for="ascii-input-append">APPEND</label>
        <AsciiInput id="append" max-length="2" :value="append" @change="append = $event"></AsciiInput>
      </span>
    </div>
    <AsciiInput id="input"
                @change="inputData = $event"
                @keyup="inputKeyup"
                placeholder="Enter data. Press RETURN to send!"
                :interceptor="inputKeydown"></AsciiInput>
    <div id="attribution">
      &copy; William Kapke <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png" /></a>This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.
    </div>
  </footer>
  <div id="na" v-if="!supported">
    <h1>
      This Web Browser does not support the WebSerial API.
    </h1>
    <p>
      Maybe consider using Chrome for this?
    </p>
  </div>
</template>

<style>
@import './assets/base.css';

#app {
  position: relative;
  /*background-color: #282828;*/
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

#app > header {
  font-family: 'Syne Mono', monospace;
  font-size: 1rem;
  background-color: #5298ff;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1;
  padding: 0 10px;
  height: 32px;
}
#app > header > h1 {
  display: inline-block;
  line-height: 1em;
  color: #f5f5f5
}
#app > header > aside {
  position: fixed;
  top: 0;
  right: 0;
}
#app > header > aside > input {
  font-size: 10px;
}
#cred {
  font-size: 12px;
  line-height: 1em;
}

#app footer {
  /*position: fixed;*/
  /*bottom: 0;*/
  width: 100%;
}
main {
  /*position: absolute;*/
  line-height: 1.4rem;
  left: 0;
  right: 0;
  /*top: 32px;*/
  /*bottom: 4.5rem;*/
  overflow-y: scroll;
  max-width: 100%
}
#history > h1 {
  font-size: 1rem;
}
#history {
  position: fixed;
  top: 32px;
  bottom: 0;
}

#toolbar,
#output > pre {
  font-family: 'Fira Code VF', monospace;
  letter-spacing: 0.1ch;
  white-space: pre;
  border: 0;
  padding: 0;
  outline: 0;
}

#output {
  background-color: #fcfcfc;
  min-height: 100%;
}
#output > pre {
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  display: inline;
}
#output > pre > br {
   display: none;
}
#output.newlines > pre > br {
   display: initial;
}

#toolbar {
  font-family: 'Syne Mono', monospace;
  padding: 3px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  border: solid #a6a6a6;
  border-width: 1px 0;
  background-color: #e6e6e6;
  font-size: 12px;
  vertical-align: top;
}
#toolbar > button:hover {
  background-color: #9cd1ff;
}
#toolbar > span {
  display: contents;
}
#toolbar label {
  margin-top: 3px;
}
#toolbar > button {
  font-size: 40px;
  cursor: pointer;
  border: 1px solid #9cd1ff;
  border-radius: 2px;
  margin: 0 1px;
  padding: 0;
  width: 1.6ch;
  height: 1.4rem;
  line-height: 1rem;
}
#toolbar > button::first-letter {
  margin-left: -2px;
}

#input {
  width: 100%;
  height: 3em;
}

#prepend, #append {
  width: 3ch;
  font-size: 22px;
}

#attribution {
  font-size: 12px;
  text-align: center;
  background-color: #5a5a5a;
  border-top: 2px solid #a6a6a6;
  color: white;
}
#attribution a {
  color: #9cd1ff;
}
#attribution img {
  vertical-align: middle;
  margin: 0 10px;
}
</style>
