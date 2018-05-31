export type Command = {
  cmd: "balance"
} | {
  cmd: "deposit",
  amount: number
} | {
  cmd: "withdraw",
  amount: number
}
