<script setup>
import {decode, encode, encodeWithHtml} from "../asciiEncoder.js";
import {ref, watch} from "vue";

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: false
  },
  placeholder: {
    type: String,
    required: false
  },
  maxLength: {
    type: String,
    required: false
  },
  interceptor: {
    type: Function,
    required: false
  }
})

const emit = defineEmits(['change'])

const inputData = ref('')
const displayedInput = ref('')
watch(inputData, async (data) => {
  emit('change', decode(data))
  displayedInput.value = encodeWithHtml(data, false)
})
inputData.value = encode(props.value||'')

function keydown(e) {
  if (props.interceptor && props.interceptor(e)) {
    return
  }
  if (e.key === 'Tab') {
    e.preventDefault()
    document.execCommand('insertText', false, '␋')
  }
  else if (e.key === 'Enter') {
    e.preventDefault()
    document.execCommand('insertText', false, '␊')
  }
}

</script>

<template>
  <div class="ascii-input-wrap" :id="id">
    <pre v-html="displayedInput"></pre>
    <textarea :id="'ascii-input-'+id" v-model="inputData" @keydown="keydown"
             spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"
             :placeholder="placeholder" :maxLength="maxLength"></textarea>
  </div>
</template>


<style>
x {
  color: #053157;
  font-style: normal;
}
x::after {
  content: ' ';
  display: inline-block;
  color: transparent;
  position: absolute;
  left: 0px;
  top: 2px;
  bottom: 4px;
  width: 1ch;
  border: solid #9cd1ff;
  border-width: 3px 0;
}

.ascii-input-wrap {
  font-family: 'Fira Code VF', monospace;
  height: fit-content;
  min-height: 1em;
  background-color: #fff;
  width: 15ch;
}
.ascii-input-wrap > pre,
.ascii-input-wrap > textarea {
  font-family: 'Fira Code VF', monospace;
  letter-spacing: 0.1ch;
  white-space: pre;
  border: 0;
  padding: 0;
  outline: 0;
}
.ascii-input-wrap > pre,
.ascii-input-wrap > textarea {
  min-height: 1em;
  font-size: 1rem;
  word-break: break-all;
  white-space: pre-wrap;
  line-height: 1.2em;
}
.ascii-input-wrap > textarea {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
}
.ascii-input-wrap > textarea::placeholder {
  -webkit-text-fill-color: initial;
}
.ascii-input-wrap > textarea {
  -webkit-text-fill-color: transparent;
  background-color: transparent;
  resize: none;
}
.ascii-input-wrap > pre {
  outline: none;
}


</style>