// teller.js
const jsonStream = require('duplex-json-stream')
const net = require('net')

const client = jsonStream(net.connect(3876))

client.write({cmd: "balance"})
client.on('data', function (msg) {
  console.log('Teller received:', msg)
})


// client.end can be used to send a request and close the socket
