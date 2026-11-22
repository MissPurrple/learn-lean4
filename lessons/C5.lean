structure Account where
  owner    : String
  lamports : Nat
deriving Repr
def alice : Account := { owner := "alice", lamports := 5000 }
def bob   : Account := { owner := "bob",   lamports := 1200 }
def deposit (acc : Account) (amount : Nat) : Account :=
  { acc with lamports := acc.lamports + amount }
#eval (deposit (deposit alice 100) 50).lamports
def withdrawAll (acc : Account) : Account :=
  { acc with lamports := 0 }
#eval withdrawAll alice
inductive Instruction where
  | deposit  (amount : Nat)
  | withdraw (amount : Nat)
  | close
  | freeze
deriving Repr
def isWithdraw : Instruction → Bool
  | .withdraw _ => true
  | .deposit _  => false
  | .close      => false
  | .freeze     => false
def applyIx (balance : Nat) : Instruction → Nat
  | .deposit n  => balance + n
  | .withdraw n => balance - n
  | .close      => 0
  | .freeze     => balance
#eval applyIx 70 .freeze
def safeWithdraw (balance amount : Nat) : Option Nat :=
  if amount ≤ balance then some (balance - amount) else none
#eval safeWithdraw 500 500
def accounts : List Account :=
  [{ owner := "alice", lamports := 5000 },
   { owner := "bob",   lamports := 1200 },
   { owner := "carol", lamports := 300 }]
def count : List Account → Nat
  | []        => 0
  | _ :: rest => 1 + count rest
#eval count accounts
def total : List Account → Nat
  | []        => 0
  | a :: rest => a.lamports + total rest
#eval total []
#eval (accounts.filter (fun a => a.lamports < 1000)).length
def richest : List Account → Nat
  | []        => 0
  | a :: rest => max a.lamports (richest rest)
#eval richest accounts
def transfer (src dst : Account) (amount : Nat) : Except String (Account × Account) :=
  if amount ≤ src.lamports then
    .ok ({ src with lamports := src.lamports - amount },
         { dst with lamports := dst.lamports + amount })
  else
    .error s!"insufficient funds: has {src.lamports}, needs {amount}"
#eval transfer bob alice 1200
def withdraw (acc : Account) (amount : Nat) : Except String Account :=
  if amount ≤ acc.lamports then
    .ok { acc with lamports := acc.lamports - amount }
  else
    .error "insufficient funds"
#eval withdraw alice 6000
example (a b : Nat) : a + b = b + a := by omega
theorem t (a b : Nat) (h : a ≤ b) : a - b = 0 := by omega
theorem t2 (a b : Nat) (h : a ≤ b) : a - b = 0 := by sorry
example : 2 + 2 = 4 := by decide
example : 2 + 2 = 4 := by omega
