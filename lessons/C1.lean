structure Account where
  owner    : String
  lamports : Nat
-- no deriving Repr on purpose
def alice : Account := { owner := "alice", lamports := 5000 }
#eval alice
