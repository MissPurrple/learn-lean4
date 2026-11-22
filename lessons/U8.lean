structure Account where
  owner    : String
  lamports : Nat
deriving Repr

def transfer (src dst : Account) (amount : Nat) : Except String (Account × Account) :=
  if amount ≤ src.lamports then
    .ok ({ src with lamports := src.lamports - amount },
         { dst with lamports := dst.lamports + amount })
  else
    .error "insufficient funds"

/-- Conservation: a successful transfer never creates or destroys lamports. -/
theorem transfer_conserves (src dst src' dst' : Account) (amount : Nat)
    (h : transfer src dst amount = .ok (src', dst')) :
    src'.lamports + dst'.lamports = src.lamports + dst.lamports := by
  unfold transfer at h
  split at h
  · simp at h
    obtain ⟨h1, h2⟩ := h
    subst h1; subst h2
    simp
    omega
  · simp at h

/-- Safety: a successful transfer never moves more than the sender had. -/
theorem transfer_within_balance (src dst src' dst' : Account) (amount : Nat)
    (h : transfer src dst amount = .ok (src', dst')) :
    amount ≤ src.lamports := by
  unfold transfer at h
  split at h
  · assumption
  · simp at h

/-- Overdrafts are always rejected. -/
theorem transfer_rejects_overdraft (src dst : Account) (amount : Nat)
    (h : src.lamports < amount) :
    transfer src dst amount = .error "insufficient funds" := by
  unfold transfer
  simp
  omega

def total : List Account → Nat
  | []        => 0
  | a :: rest => a.lamports + total rest

theorem total_append (xs ys : List Account) :
    total (xs ++ ys) = total xs + total ys := by
  induction xs with
  | nil => simp [total]
  | cons a rest ih => simp [total, ih]; omega

#print axioms transfer_conserves
