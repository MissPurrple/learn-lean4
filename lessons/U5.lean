structure Account where
  owner    : String
  lamports : Nat
deriving Repr

def accounts : List Account :=
  [{ owner := "alice", lamports := 5000 },
   { owner := "bob",   lamports := 1200 },
   { owner := "carol", lamports := 300 }]

def total : List Account → Nat
  | []        => 0
  | a :: rest => a.lamports + total rest

#eval total accounts
#eval accounts.length
#eval accounts.map (·.owner)
#eval accounts.map (fun a => a.lamports)
#eval (accounts.filter (fun a => a.lamports ≥ 1000)).map (·.owner)
#eval accounts.foldl (fun acc a => acc + a.lamports) 0
#eval [1, 2, 3] ++ [4]
#eval 0 :: [1, 2]
