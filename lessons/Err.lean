theorem bad : 2 + 2 = 5 := by decide
theorem unfinished (n : Nat) : n + 1 > n := by
  sorry
def oops : Nat := "five"
example (a b : Nat) (h : a ≤ b) : a - b = 0 := by omega
