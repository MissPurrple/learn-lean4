example : 2 + 2 = 4 := rfl
theorem ether_in_wei : 10 ^ 18 = 1000000000000000000 := rfl
example : 21000 * 30 = 630000 := by decide
#check ether_in_wei

theorem add_zero_example (n : Nat) : n + 0 = n := rfl

theorem le_refl_example (n : Nat) : n ≤ n := Nat.le_refl n

example (p q : Prop) (hp : p) (hq : q) : p ∧ q := And.intro hp hq

example (p q : Prop) : p ∧ q → q ∧ p := by
  intro h
  exact And.intro h.2 h.1

theorem double_pos (n : Nat) (h : 0 < n) : 0 < 2 * n := by
  omega

#check @double_pos
