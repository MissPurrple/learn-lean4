structure Account where
  owner    : String
  lamports : Nat
deriving Repr

def alice : Account := { owner := "alice", lamports := 5000 }

#eval alice
#eval alice.lamports
#eval alice.owner

def deposit (acc : Account) (amount : Nat) : Account :=
  { acc with lamports := acc.lamports + amount }

#eval deposit alice 250
#eval alice.lamports
