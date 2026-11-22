def weiPerGwei : Nat := 10 ^ 9
def weiPerEther : Nat := 10 ^ 18
def lamportsPerSol : Nat := 1000000000

def etherToWei (eth : Nat) : Nat := eth * weiPerEther
def solToLamports (sol : Nat) : Nat := sol * lamportsPerSol

#eval etherToWei 2
#eval solToLamports 3
#check etherToWei

def gasCost (gasUsed gasPriceGwei : Nat) : Nat :=
  gasUsed * gasPriceGwei * weiPerGwei

#eval gasCost 21000 30
#check gasCost
#check gasCost 21000

def double := fun (n : Nat) => n * 2
#eval double 21
