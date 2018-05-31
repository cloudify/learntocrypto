#!/usr/bin/env ts-node
// bank.js
import jsonStream = require('duplex-json-stream')
import * as net from 'net';
import * as fs from "fs";

import { Command } from "./types";

const logFile = "log.json";

function readLog(): Promise<Command[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(logFile, (err, data) => {
      if(err) {
        return resolve([]);
      }
      const commands = JSON.parse(data.toString()) as Command[];
      console.log(`log read: ${commands.length}`);
      return resolve(commands);
    })
  });
}

function writeLog(log: Command[]): Promise<Command[]> {
  return new Promise((resolve, reject) => {
    fs.writeFile(logFile, JSON.stringify(log), (err) => {
      if(err) {
        return reject(err);
      }
      console.log(`log written: ${log.length}`);
      return resolve(log);
    })
  });
}

async function appendCommand(cmd: Command): Promise<Command[]> {
  const log = await readLog();
  log.push(cmd);
  return await writeLog(log);
}

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

async function processCommand(command: Command): Promise<{}> {
  const log = await readLog();
  switch(command.cmd) {
    case "balance":
      return({cmd: 'balance', balance: getBalance(log)})
    case "deposit":
      await appendCommand(command);
      return(CMD_STATUS_OK)
    case "withdraw":
      if(command.amount > 0 && canWithdraw(log, command.amount)) {
        await appendCommand(command);
        return(CMD_STATUS_OK)
      } else {
        return(CMD_STATUS_ERROR)
      }
    default:
      return CMD_STATUS_ERROR;
  }
}

const server = net.createServer(function (socket) {
  socket = jsonStream(socket)

  socket.on('data', async function (msg) {
    console.log('Bank received:', msg)
    const command = (msg as any) as Command;
    const r = await processCommand(command)
    console.log('Sending:', r);
    socket.write(r);
  })
})

server.listen(3876)
