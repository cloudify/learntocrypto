#!/usr/bin/env ts-node
// teller.js
const jsonStream = require('duplex-json-stream')
const net = require('net')

import { Command } from "./types";

function getCommand(): Command | undefined {
  switch(process.argv[2]) {
    case "balance":
      return {
        cmd: "balance"
      }
    case "deposit":
      return {
        cmd: "deposit",
        amount: parseInt(process.argv[3], 10)
      }
    case "withdraw":
      return {
        cmd: "withdraw",
        amount: parseInt(process.argv[3], 10)
      }
    default:
      return undefined
  }
}

const command = getCommand();
if(!command) {
  console.error("Please provide a command");
  process.exit();
}

const client = jsonStream(net.connect(3876))

client.write(command)
client.on('data', function (msg) {
  console.log('Teller received:', msg)
})

client.end()
