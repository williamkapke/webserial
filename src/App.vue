<script setup>
import { useConnectionStore } from './stores/connection.js'
import {onMounted, ref, watch} from "vue"
import ConnectModal from "./components/ConnectModal.vue"
import AsciiInput from "./components/AsciiInput.vue"
import { decode, encodeWithHtml } from "./asciiEncoder.js"
import Toolbar from "./components/Toolbar.vue";
import {keyCombo, shortcuts} from "./shortcuts.js";
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

watch(inputData, async (data) => {
  displayedInput.value = encodeWithHtml(data, false)
})


function inputKeyup(e) {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    return
  }
  wip = e.target.value
}
function inputKeydown(e) {
  // console.log(keyCombo(e), e)
  switch (keyCombo(e)) {
    case shortcuts.CLEAR:
      e.preventDefault()
      connection.messages.length = 0
      return true // say that it has been handled
    case shortcuts.IGNORE_LF:
      document.execCommand('insertText', false, '␊')
      return true
    case shortcuts.SEND:
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
    case shortcuts.UP:
      if (historyIndex !== 0) {
        historyIndex--
        setInputValue(e.target, history[historyIndex])
        return true
      }
      break
    case shortcuts.DOWN:
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

onMounted(async () => {
  const qs = new URLSearchParams(window.location.search);
  if (qs.get('vid') && qs.get('pid')) {
    await connection.init(qs.get('vid'), qs.get('pid'))
  }

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

  window.addEventListener('keydown', async (e) => {
    if (keyCombo(e) === shortcuts.TOGGLE_CONNECTION) {
      e.preventDefault();
      e.stopPropagation();
      if (!connection.open)
        await connection.connect()
      else
        await connection.close()
    }
  })
})
function consoleScroll(e) {
  const scrollPoint = e.target.scrollTop + e.target.clientHeight
  scrolledToBottom = scrollPoint+10 >= e.target.scrollHeight
}
</script>

<template>
  <header>
    <h1>
      <a href="https://webserial.io">WebSerial</a>
    </h1>
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
    <Toolbar v-model:prepend="prepend" v-model:append="append"></Toolbar>
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
  padding-top: 32px;
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
#app > header > h1 > a {
  text-decoration: none;
  color: inherit;
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

#input {
  width: 100%;
  min-height: 3em;
}

#prepend, #append {
  min-width: 2ch;
  width: fit-content;
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
