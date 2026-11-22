def weiPerGwei : Nat := 10 ^ 9
def gweiToWei (g : Nat) : Nat := g * weiPerGwei
#eval 10 ^ 9
#eval gweiToWei 30
structure Account where
  owner    : String
  lamports : Nat
  frozen   : Bool
deriving Repr
def alice : Account := { owner := "alice", lamports := 5000, frozen := false }
#eval alice
