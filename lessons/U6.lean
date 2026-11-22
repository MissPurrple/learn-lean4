structure Account where
  owner    : String
  lamports : Nat
deriving Repr

def transfer (src dst : Account) (amount : Nat) : Except String (Account × Account) :=
  if amount ≤ src.lamports then
    .ok ({ src with lamports := src.lamports - amount },
         { dst with lamports := dst.lamports + amount })
  else
    .error s!"insufficient funds: has {src.lamports}, needs {amount}"

def alice : Account := { owner := "alice", lamports := 5000 }
def bob   : Account := { owner := "bob",   lamports := 1200 }

#eval transfer alice bob 2000
#eval transfer alice bob 9000

def twoTransfers : Except String (Account × Account) := do
  let (a1, b1) ← transfer alice bob 2000
  let (b2, a2) ← transfer b1 a1 500
  return (a2, b2)

#eval twoTransfers
