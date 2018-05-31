#!/usr/bin/env ts-node
// bank.js
import jsonStream = require('duplex-json-stream')
import net = require('net')

import { Command } from "./types";

let log: Command[] = [];

function getBalance(log: Command[]): number {
  return log.reduce((acc, command) => {
    if(command.cmd === "deposit") {
      return acc + command.amount;
    }
    if(command.cmd === "withdraw") {
      return acc - command.amount;
    }
    return acc;
  }, 0);
}

function canWithdraw(log: Command[], amount: number): boolean {
  return getBalance(log) >= amount;
}

const CMD_STATUS_OK = {cmd: 'status', message: "ok"};
const CMD_STATUS_ERROR = {cmd: 'status', message: "error"};

const server = net.createServer(function (socket) {
  socket = jsonStream(socket)

  socket.on('data', function (msg) {
    console.log('Bank received:', msg)
    const command = (msg as any) as Command;
    switch(command.cmd) {
      case "balance":
        socket.write({cmd: 'balance', balance: getBalance(log)})
        break;
      case "deposit":
        log.push(command);
        socket.write(CMD_STATUS_OK)
        break;
      case "withdraw":
        if(canWithdraw(log, command.amount)) {
          log.push(command);
          socket.write(CMD_STATUS_OK)
        } else {
          socket.write(CMD_STATUS_ERROR)
        }
        break;
    }
  })
})

server.listen(3876)
