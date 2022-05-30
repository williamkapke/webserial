<script setup>
import { useConnectionStore } from '../stores/connection.js'
import { ref, watch } from "vue";
const connection = useConnectionStore()

async function connect() {
  if (await connection.selectPort()) {
    await connection.connect()
  }
}
</script>

<template>
  <div v-if="!connection.open" id="options" :class="{start:!connection.messages.length}">
    <h2>DISCONNECTED</h2>
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
      <button @click="connect">Select Serial Port...</button>
    </fieldset>
  </div>
</template>

<style>

#options {
  position: relative;
  margin: -2px auto;
  font-family: 'Fira Code', 'Syne Mono', monospace;
  width: 180px;
  background-color: rgba(0,0,0,0.7);
  color: #8ba4cb;
  border-radius: 0 0 0.25rem 0.25rem;
  height: 34px;
  overflow: hidden;
  transition: height .2s, width .2s;
}
#options.start,
#options:hover {
  width: 400px;
  height: 270px;
}
#options h2 {
  font-family: 'Syne Mono', monospace;
  margin: -2px auto;
  background-color: #dc3545;
  color: white;
  text-align: center;
  border-radius: 0 0 0.25rem 0.25rem;
  font-style: normal;
  font-size: 22px;
  width: 180px;
  font-weight: 400;
}
/*#options dt,*/
/*#options dd {*/
/*  display: inline-block;*/
/*  width: 100px;*/
/*}*/
/*#options dd::after {*/
/*  content: '';*/
/*  display: block;*/
/*}*/
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
</style>
