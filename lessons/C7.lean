structure Account where
  owner    : String
  lamports : Nat
def alice : Account := { owner := "alice", lamports := 5000 }
#eval repr alice
