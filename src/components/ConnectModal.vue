<script setup>
import { useConnectionStore } from '../stores/connection.js'
const connection = useConnectionStore()

const info = () => {
  if (!connection.id) return ''
  return ` - ${connection.product || connection.vendor || 'Unknown Device'} (${connection.id})`
}
</script>

<template>
  <div id="options" :class="{start:!connection.messages.length, open:connection.open}">
    <h2>
      <strong v-if="connection.open">CONNECTED</strong>
      <strong v-else-if="!connection.id || connection.physicallyConnected">CONNECTED</strong>
      <strong v-else>UNPLUGGED</strong>
      {{info()}}
    </h2>

    <fieldset>
      <legend>Options</legend>
      <dl>
        <dt>Baud Rate</dt><dd><input :value="connection.options.baudRate" type="number"></dd>
        <dt>Buffer Size</dt><dd><input :value="connection.options.bufferSize" type="number"></dd>
        <dt>Data Bits</dt><dd>
          <input v-model="connection.options.dataBits" id="data7" type="radio" value="7"><label for="data7">7</label>
          <input v-model="connection.options.dataBits" id="data8" type="radio" value="8"><label for="data8">8</label>
        </dd>
        <dt>Flow Control</dt>
        <dd>
          <input v-model="connection.options.flowControl" id="flowNone" type="radio" value="none"><label for="flowNone">none</label>
          <input v-model="connection.options.flowControl" id="flowHardware" type="radio" value="hardware"><label for="flowHardware">hardware</label>
        </dd>

        <dt>Parity</dt>
        <dd>
          <input v-model="connection.options.parity" id="parityNone" type="radio" value="none"><label for="parityNone">none</label>
          <input v-model="connection.options.parity" id="parityEven" type="radio" value="even"><label for="parityEven">even</label>
          <input v-model="connection.options.parity" id="parityOdd" type="radio" value="odd"><label for="parityOdd">odd</label>
        </dd>

        <dt>Stop Bits</dt>
        <dd>
          <input v-model="connection.options.stopBits" id="stop1" type="radio" value="1"><label for="stop1">1</label>
          <input v-model="connection.options.stopBits" id="stop2" type="radio" value="2"><label for="stop2">2</label>
        </dd>
      </dl>
      <button v-if="!connection.id || !connection.physicallyConnected" @click="connection.selectPort">Select Serial Port...</button>
      <button v-else @click="connection.connect">Connect</button>
    </fieldset>
  </div>
</template>

<style>

#options {
  position: relative;
  height: fit-content;
  width: fit-content;
  margin: -4px auto;
  font-family: 'Fira Code', 'Syne Mono', monospace;
  background-color: rgba(0,0,0,0.7);
  color: #8ba4cb;
  border-radius: 3px;
  overflow: hidden;
}
#options h2 {
  font-family: 'Syne Mono', monospace;
  background-color: #dc3545;
  color: white;
  text-align: center;
  font-size: 14px;
  padding: 0 10px;
  line-height: 1.2em;
}
#options fieldset {
  border: none;
}
#options legend {
  color: transparent;
}
#options dl {
  display: grid;
  grid-template-columns: max-content auto;
}

#options dt {
  font-family: 'Syne Mono', monospace;
  grid-column-start: 1;
  width: 190px;
}

#options dd {
  grid-column-start: 2;
}
#options dd > input[type=number] {
  color: #555;
  width: 80px;
  border: 0;
}
#options dd > label {
  margin: 0 8px 0 3px
}
#options button {
  font-family: 'Syne Mono', monospace;
  display: block;
  margin: 10px auto;
  cursor: pointer;
  font-weight: bold;
}
#options button:hover {
  color: #368dd8;
  background-color: #ddd;
}

#options.open > fieldset {
  display: none;
}
#options.open > h2 {
  background-color: green;
  color: #ddd;
}


</style>
