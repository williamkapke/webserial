<script setup>
import AsciiInput from "./AsciiInput.vue";
import { useConnectionStore } from '../stores/connection.js'
const connection = useConnectionStore()

const props = defineProps({
  prepend: {
    type: String,
    required: false
  },
  append: {
    type: String,
    required: false
  },
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
</script>

<template>
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
        <AsciiInput id="prepend" max-length="5" :value="prepend" @change="$emit('update:prepend', $event)"></AsciiInput>
      </span>
    <span>
        <label for="ascii-input-append">APPEND</label>
        <AsciiInput id="append" max-length="5" :value="append" @change="$emit('update:append', $event)"></AsciiInput>
      </span>
  </div>
</template>

<style scoped>
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
  font-family: 'Fira Code VF';
  font-size: 40px;
  cursor: pointer;
  border: 1px solid #9cd1ff;
  border-radius: 2px;
  margin: 0 1px;
  padding: 0;
  width: 1.6ch;
  height: 1.4rem;
  line-height: 1.6rem;
}
#toolbar > button::first-letter {
  margin-left: -2px;
}

</style>