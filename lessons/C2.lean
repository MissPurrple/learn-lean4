inductive Instruction where
  | deposit  (amount : Nat)
  | withdraw (amount : Nat)
  | close
def applyIx (balance : Nat) : Instruction → Nat
  | .deposit n  => balance + n
  | .withdraw n => balance - n
