inductive Instruction where
  | deposit  (amount : Nat)
  | withdraw (amount : Nat)
  | close
deriving Repr

def describe : Instruction → String
  | .deposit n  => s!"deposit {n}"
  | .withdraw n => s!"withdraw {n}"
  | .close      => "close account"

#eval describe (.deposit 100)
#eval describe .close

def applyIx (balance : Nat) : Instruction → Nat
  | .deposit n  => balance + n
  | .withdraw n => balance - n
  | .close      => 0

#eval applyIx 500 (.withdraw 200)
#eval applyIx 500 (.withdraw 900)

def safeWithdraw (balance amount : Nat) : Option Nat :=
  if amount ≤ balance then some (balance - amount) else none

#eval safeWithdraw 500 200
#eval safeWithdraw 500 900
