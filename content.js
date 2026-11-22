// All Lean code below was compiled on Lean 4.36.0; every "output" is copied from the real run.
const UNITS = [
{
  id: "u1", n: 1, title: "Lean as a calculator",
  hook: "Run your first Lean commands and meet the type that every token balance lives in.",
  goals: ["Use #eval to compute a value", "Use #check to ask for a value's type", "Tell Nat, Int, String, Bool and Prop apart", "Explain why 5 − 7 is 0 for Nat, and why that matters for balances"],
  explain: `
<p>A Lean file is checked <b>while you type</b>. In VS Code, put your cursor on a line and the <b>Infoview</b> panel on the right shows its result. There is no separate "run" button for these commands.</p>
<p><code>#eval</code> means "work this out and show me the answer". <code>#check</code> means "don't work it out, just tell me its <b>type</b>". In Lean every value has exactly one type, written after a colon: <code>42 : Nat</code> reads "42 has type Nat".</p>
<ul>
<li><b>Nat</b>: the natural numbers 0, 1, 2, …, with no upper limit. <b>There are no negative Nats.</b></li>
<li><b>Int</b>: whole numbers, including negatives.</li>
<li><b>String</b>: text in double quotes. <b>Bool</b>: <code>true</code> or <code>false</code>.</li>
<li><b>Prop</b>: a <i>statement</i> that might be true or false, like <code>3 ≤ 5</code>. You will prove Props in Unit 7.</li>
</ul>
<p><b>The key surprise:</b> since a Nat can't go below zero, Lean's subtraction on Nat stops at 0. So <code>5 - 7</code> is <code>0</code>. This is called <i>truncated subtraction</i>. If a balance is a Nat and you subtract more than it holds, you <b>silently</b> get 0. You don't get an error. You must check <code>amount ≤ balance</code> yourself, and Units 4, 6 and 8 build exactly that check.</p>`,
  worked: { code: `#eval 2 + 3
#eval 10 ^ 18          -- wei in one ether
#eval "Hello, " ++ "Lean"
#eval 5 - 7            -- Nat subtraction
#eval 7 / 2            -- whole-number division
#eval 7 % 2            -- remainder
#check 42
#check "wei"
#check 3 ≤ 5
#eval (5 : Int) - 7    -- same sum, as an Int`,
    output: `5
1000000000000000000
"Hello, Lean"
0
3
1
42 : Nat
"wei" : String
3 ≤ 5 : Prop
-2`,
    notes: ["<code>^</code> is \"to the power of\". 10<sup>18</sup> is the number of wei in one ether.", "<code>++</code> joins two strings.", "<code>5 - 7</code> gives 0 because both numbers are Nat.", "<code>/</code> on Nat throws away the remainder, and <code>%</code> gives you the remainder.", "<code>(5 : Int)</code> is a <i>type ascription</i>: \"treat this 5 as an Int\". Now negatives are allowed, so the answer is −2."] },
  bridge: `<p><b>Solidity:</b> since version 0.8.0, arithmetic on <code>uint256</code> is checked by default, so an underflow like 5 − 7 <b>reverts</b> the transaction instead of wrapping (you can opt out with <code>unchecked { }</code>). <b>Rust:</b> in debug builds integer overflow panics, and in release builds it wraps around unless overflow checks are turned on. Methods like <code>checked_sub</code> return an <code>Option</code> so you can handle failure. <b>Lean's Nat</b> does a third thing: it never overflows (no maximum) and floors at 0. Three languages, three different behaviours for the same sum. Knowing which one you're in is a real security skill.</p>`,
  faded: { prompt: "Fill the blank so Lean shows the type of the text \"wei\" (the output should be <code>\"wei\" : String</code>).", code: `#____ "wei"`, options: ["eval", "check", "type", "print"], answer: 1, why: "<code>#check</code> shows the type. <code>#eval</code> would show the value <code>\"wei\"</code> without its type." },
  quiz: [
    { id: "u1q1", tag: "nat-subtraction", q: "What does Lean print for this line?", code: "#eval 5 - 7", options: ["-2", "0", "An error", "2"], a: 1, why: "Both numbers are Nat, which has no negatives, so subtraction stops at 0 (truncated subtraction)." },
    { id: "u1q2", tag: "eval-vs-check", q: "What does <code>#check</code> do?", options: ["Computes the value and prints it", "Prints the type of an expression without computing it", "Checks the file for spelling mistakes", "Proves the expression is true"], a: 1, why: "#check reports the type, such as <code>42 : Nat</code>. #eval does the computing." },
    { id: "u1q3", tag: "types", q: "What does Lean print here?", code: "#check 3 ≤ 5", options: ["true", "3 ≤ 5 : Prop", "3 ≤ 5 : Bool", "Bool.true : Bool"], a: 1, why: "<code>3 ≤ 5</code> is a statement, so its type is Prop. #check doesn't decide whether it's true." },
    { id: "u1q4", tag: "nat-division", q: "What does Lean print?", code: "#eval 7 / 2", options: ["3.5", "4", "3", "1"], a: 2, why: "Division on Nat is whole-number division and drops the remainder. <code>7 % 2</code> would give the remainder, 1." },
    { id: "u1q5", tag: "types", q: "You need a number that can go negative (for example a profit or loss). Which type?", options: ["Nat", "Int", "String", "Prop"], a: 1, why: "Int includes negative numbers. Nat stops at 0." }
  ],
  challenge: { id: "u1c1", tag: "type-ascription", q: "What does Lean print?", code: "#eval (5 : Int) - 7", options: ["0", "-2", "An error", "2"], a: 1, why: "The ascription makes 5 an Int, and Lean then treats 7 as an Int too, so ordinary subtraction gives −2." },
  practice: { task: "Create a file <code>Unit1.lean</code> in VS Code, type the worked example line by line, and click each line to see the Infoview output. Then try <code>#eval 10 ^ 9</code> (wei in one gwei).", expected: "1000000000" }
},
{
  id: "u2", n: 2, title: "Definitions and functions",
  hook: "Name values, write functions that convert ether to wei, and read function types.",
  goals: ["Define a constant with def", "Write a function with typed inputs and an output type", "Call a function with arguments separated by spaces", "Read an arrow type like Nat → Nat → Nat"],
  explain: `
<p><code>def</code> gives a name to something: <code>def name : Type := value</code>. Once defined, the name can be used anywhere below it in the file.</p>
<p>A <b>function</b> is a definition with inputs. You write each input in brackets with its type, then the output type: <code>def etherToWei (eth : Nat) : Nat := eth * weiPerEther</code>.</p>
<p><b>Calling</b> a function needs no brackets or commas. You write the function name, then a space, then the arguments: <code>etherToWei 2</code>. With two inputs it looks like <code>gasCost 21000 30</code>.</p>
<p><b>Function types</b> use arrows. <code>Nat → Nat</code> means "give me a Nat and I'll give you a Nat". <code>gasCost</code> has two Nat inputs, so its type behaves like <code>Nat → Nat → Nat</code>. If you give only the first argument (<code>gasCost 21000</code>), you get back a function still waiting for the second one, with type <code>Nat → Nat</code>. This is called <i>partial application</i>.</p>
<p><code>fun (n : Nat) => n * 2</code> is a function without a name (an anonymous function, or "lambda").</p>`,
  worked: { code: `def weiPerGwei : Nat := 10 ^ 9
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
#check gasCost 21000

def double := fun (n : Nat) => n * 2
#eval double 21`,
    output: `2000000000000000000
3000000000
etherToWei (eth : Nat) : Nat
630000000000000
gasCost 21000 : Nat → Nat
42`,
    notes: ["1 ether = 10<sup>18</sup> wei, 1 gwei = 10<sup>9</sup> wei, and 1 SOL = 10<sup>9</sup> lamports.", "21000 is the gas used by a plain ETH transfer. At a gas price of 30 gwei that costs 630,000,000,000,000 wei (0.00063 ETH).", "<code>(gasUsed gasPriceGwei : Nat)</code> is shorthand for two inputs that are both Nat.", "<code>gasCost 21000</code> on its own is a function still waiting for the gas price, so its type is <code>Nat → Nat</code>."] },
  bridge: `<p><b>Rust</b> equivalent: <code>fn ether_to_wei(eth: u128) -&gt; u128 { eth * WEI_PER_ETHER }</code>. Rust puts arguments in brackets with commas (<code>gas_cost(21000, 30)</code>), and Lean uses spaces (<code>gasCost 21000 30</code>). Rust's <code>u128</code> has a maximum value and Lean's <code>Nat</code> has none. That difference matters when you later prove things about a Rust program: a proof about unlimited Nats does not automatically hold for fixed-size integers.</p>`,
  faded: { prompt: "Complete the function so it converts SOL to lamports.", code: `def lamportsPerSol : Nat := 1000000000
def solToLamports (sol : Nat) : Nat := sol * ____`, options: ["sol", "lamportsPerSol", "Nat", "1000"], answer: 1, why: "Multiply the number of SOL by the named constant <code>lamportsPerSol</code>. Naming the constant once avoids typing the wrong number of zeros." },
  quiz: [
    { id: "u2q1", tag: "calling", q: "How do you call <code>gasCost</code> with gas 21000 and price 30?", options: ["gasCost(21000, 30)", "gasCost 21000 30", "gasCost[21000][30]", "21000.gasCost(30)"], a: 1, why: "In Lean, arguments follow the function name, separated by spaces." },
    { id: "u2q2", tag: "function-types", q: "What does Lean print?", code: "#check etherToWei", options: ["etherToWei : Nat", "etherToWei (eth : Nat) : Nat", "2000000000000000000", "Nat → Prop"], a: 1, why: "#check on a function shows its inputs and output type." },
    { id: "u2q3", tag: "partial-application", q: "What is the type of <code>gasCost 21000</code>?", options: ["Nat", "Nat → Nat", "Nat → Nat → Nat", "An error, because an argument is missing"], a: 1, why: "One of the two arguments has been supplied, so what's left is a function from the remaining Nat to a Nat." },
    { id: "u2q4", tag: "def-syntax", q: "Which line correctly defines a constant?", options: ["def fee : Nat = 5", "def fee : Nat := 5", "let fee: Nat := 5;", "fee : Nat := def 5"], a: 1, why: "The pattern is <code>def name : Type := value</code>, with <code>:=</code> rather than <code>=</code>." },
    { id: "u2q5", tag: "lambda", q: "What does <code>fun (n : Nat) => n * 2</code> create?", options: ["A theorem", "A function without a name that doubles its input", "A structure", "A loop"], a: 1, why: "<code>fun</code> builds an anonymous function. <code>double</code> in the example gave it a name." }
  ],
  challenge: { id: "u2c1", tag: "units", q: "<code>gasCost 21000 30</code> evaluates to 630000000000000. What unit is that number in?", options: ["gwei", "wei", "ether", "lamports"], a: 1, why: "The function multiplies by <code>weiPerGwei</code>, which converts gwei into wei." },
  practice: { task: "Write <code>def gweiToWei (g : Nat) : Nat := g * weiPerGwei</code> and run <code>#eval gweiToWei 30</code>.", expected: "30000000000" }
},
{
  id: "u3", n: 3, title: "Structures: modelling an account",
  hook: "Bundle related data into one value, the way a Solana account bundles an owner and a lamport balance.",
  goals: ["Declare a structure with named fields", "Create a value and read a field with dot notation", "Make an updated copy with the { x with … } syntax", "Explain why the original value doesn't change"],
  explain: `
<p>A <b>structure</b> groups named fields into one type, much like a row in a table. <code>structure Account where</code>, followed by one field per line with its type.</p>
<p>You build one with curly braces: <code>{ owner := "alice", lamports := 5000 }</code>, and read a field with a dot: <code>alice.lamports</code>.</p>
<p><code>deriving Repr</code> asks Lean to write the code that <i>prints</i> the structure (a <code>Repr</code> instance). If you forget it, <code>#eval alice</code> still works in Lean 4.36 because #eval generates one on the spot, but code that calls <code>repr alice</code> fails with <i>failed to synthesize instance of type class Repr Account</i>. So write it.</p>
<p><b>Lean values never change.</b> <code>{ acc with lamports := … }</code> builds a <i>new</i> Account that copies every field except the one you name. The old value is untouched. That's why <code>alice.lamports</code> is still 5000 after a deposit. Everything a function does shows up in what it <i>returns</i>, and that makes it much easier to prove things about it later.</p>`,
  worked: { code: `structure Account where
  owner    : String
  lamports : Nat
deriving Repr

def alice : Account := { owner := "alice", lamports := 5000 }

#eval alice
#eval alice.lamports

def deposit (acc : Account) (amount : Nat) : Account :=
  { acc with lamports := acc.lamports + amount }

#eval deposit alice 250
#eval alice.lamports`,
    output: `{ owner := "alice", lamports := 5000 }
5000
{ owner := "alice", lamports := 5250 }
5000`,
    notes: ["The fields are indented under <code>where</code>.", "<code>deposit</code> returns a <i>new</i> Account with 250 more lamports.", "The last line shows alice is still 5000. Nothing was changed in place."] },
  bridge: `<p><b>Rust</b> equivalent: <code>struct Account { owner: String, lamports: u64 }</code>. In Rust you would often write <code>fn deposit(acc: &amp;mut Account, amount: u64)</code> and change the account in place. Every Solana account really does carry a <code>lamports</code> balance. Tools that translate Rust into Lean (such as <b>Aeneas</b>, which Microsoft uses to verify Rust cryptography) turn exactly this kind of in-place change into a function that takes the old value and returns the new one, as in the Lean version above.</p>`,
  faded: { prompt: "Complete <code>withdrawAll</code> so it returns a copy of the account with a balance of 0.", code: `def withdrawAll (acc : Account) : Account :=
  { acc ____ lamports := 0 }`, options: ["and", "with", "where", ":="], answer: 1, why: "<code>{ acc with field := value }</code> copies <code>acc</code> and changes only the named field." },
  quiz: [
    { id: "u3q1", tag: "immutability", q: "After <code>#eval deposit alice 250</code>, what does <code>#eval alice.lamports</code> print?", options: ["5250", "5000", "250", "An error"], a: 1, why: "deposit returns a new account. Lean values never change, so alice stays at 5000." },
    { id: "u3q2", tag: "field-access", q: "How do you read the owner of <code>alice</code>?", options: ["alice[owner]", "alice.owner", "owner(alice) only", "alice->owner"], a: 1, why: "Dot notation reads a field." },
    { id: "u3q3", tag: "deriving", q: "What is <code>deriving Repr</code> for?", options: ["It makes the structure faster", "It creates a Repr instance, the code that turns values of the structure into printable text (needed by functions like repr)", "It proves the fields are correct", "It makes fields changeable"], a: 1, why: "Repr is how Lean turns a value into displayable text. #eval can generate one on the fly, but repr needs the real instance." },
    { id: "u3q4", tag: "with-update", q: "What does <code>{ acc with lamports := 0 }</code> produce?", options: ["It changes acc in place", "A new Account like acc but with lamports set to 0", "A Bool", "A proof that the balance is 0"], a: 1, why: "with-update builds a new value. The original is untouched." }
  ],
  challenge: { id: "u3c1", tag: "with-update", q: "What does <code>#eval deposit (deposit alice 100) 50</code> show for lamports?", options: ["5050", "5150", "150", "5100"], a: 1, why: "The inner call gives 5100, and depositing 50 into that gives 5150." },
  practice: { task: "Add a field <code>frozen : Bool</code> to Account. Lean will now complain that <code>alice</code> is missing a field. Fix it by adding <code>frozen := false</code>.", expected: "{ owner := \"alice\", lamports := 5000, frozen := false }" }
},
{
  id: "u4", n: 4, title: "Inductive types and pattern matching",
  hook: "Describe instructions as a closed list of choices and handle each case, the same shape as a Rust enum with match.",
  goals: ["Declare an inductive type with several constructors", "Write a function by pattern matching on each case", "Use Option for an answer that might be missing", "Spot the bug that truncated subtraction causes"],
  explain: `
<p>An <b>inductive type</b> lists every possible shape a value can have. Each shape is a <i>constructor</i>, written after <code>|</code>, and a constructor can carry data: <code>| deposit (amount : Nat)</code>.</p>
<p>You use one with <b>pattern matching</b>. The function gives one line per constructor, and Lean picks the matching line. <code>.deposit n</code> is a short way to write <code>Instruction.deposit n</code>. Lean <b>refuses to accept the definition</b> if you forget a case. Leaving out the <code>.close</code> line is a compile error, not a bug you find later.</p>
<p><code>s!"deposit {n}"</code> builds a string with the value of <code>n</code> inserted.</p>
<p><b>Look closely at the worked example:</b> <code>applyIx 500 (.withdraw 900)</code> returns 0. The user withdrew 900 from 500 and nothing complained. That's truncated subtraction from Unit 1 turning into a real bug. The fix is <b>Option</b>: a value is either <code>some x</code> (here is the answer) or <code>none</code> (there is no valid answer). <code>safeWithdraw</code> returns <code>none</code> instead of pretending.</p>`,
  worked: { code: `inductive Instruction where
  | deposit  (amount : Nat)
  | withdraw (amount : Nat)
  | close
deriving Repr

def describe : Instruction → String
  | .deposit n  => s!"deposit {n}"
  | .withdraw n => s!"withdraw {n}"
  | .close      => "close account"

#eval describe (.deposit 100)

def applyIx (balance : Nat) : Instruction → Nat
  | .deposit n  => balance + n
  | .withdraw n => balance - n
  | .close      => 0

#eval applyIx 500 (.withdraw 200)
#eval applyIx 500 (.withdraw 900)   -- the bug

def safeWithdraw (balance amount : Nat) : Option Nat :=
  if amount ≤ balance then some (balance - amount) else none

#eval safeWithdraw 500 200
#eval safeWithdraw 500 900`,
    output: `"deposit 100"
300
0
some 300
none`,
    notes: ["Three constructors give three cases, and every function must handle all three.", "<code>applyIx 500 (.withdraw 900)</code> gives 0. That is the silent bug.", "<code>safeWithdraw</code> checks first and returns <code>none</code> when the withdrawal isn't allowed."] },
  bridge: `<p><b>Rust</b> has the same idea: <code>enum Instruction { Deposit(u64), Withdraw(u64), Close }</code> plus a <code>match</code>, and Rust also rejects a match that misses a case. This is the shape commonly used to decode and dispatch the instructions a Solana program receives. Lean's <code>Option</code> (<code>some</code>/<code>none</code>) is Rust's <code>Option</code> (<code>Some</code>/<code>None</code>).</p>`,
  faded: { prompt: "Complete the missing case so the function handles every instruction.", code: `def isWithdraw : Instruction → Bool
  | .withdraw _ => true
  | .deposit _  => false
  | ____        => false`, options: [".close", "_ =>", ".withdraw", "none"], answer: 0, why: "The remaining constructor is <code>.close</code>. Without that line Lean reports a missing case. (A wildcard <code>_</code> line would also work, but it hides which cases you meant.)" },
  quiz: [
    { id: "u4q1", tag: "nat-subtraction", q: "What does <code>applyIx 500 (.withdraw 900)</code> return?", options: ["-400", "0", "none", "An error"], a: 1, why: "500 − 900 on Nat floors to 0. That's why safeWithdraw exists." },
    { id: "u4q2", tag: "option", q: "What does <code>safeWithdraw 500 900</code> return?", options: ["0", "some 0", "none", "some (-400)"], a: 2, why: "900 ≤ 500 is false, so the else branch returns none." },
    { id: "u4q3", tag: "exhaustiveness", q: "You delete the <code>| .close => 0</code> line from applyIx. What happens?", options: ["It compiles and returns 0 for close", "Lean reports an error because a case is missing", "It returns none for close", "It crashes when run"], a: 1, why: "Lean checks that every constructor is handled before it accepts a definition." },
    { id: "u4q4", tag: "constructors", q: "How many constructors does Instruction have?", options: ["1", "2", "3", "4"], a: 2, why: "deposit, withdraw and close." },
    { id: "u4q5", tag: "rust-bridge", q: "Which Rust feature is the closest match to a Lean inductive type like Instruction?", options: ["struct", "enum", "trait", "Vec"], a: 1, why: "A Rust enum lists alternatives, and each alternative can carry data, just like constructors." }
  ],
  challenge: { id: "u4c1", tag: "option", q: "What does <code>safeWithdraw 500 500</code> return?", options: ["none", "some 0", "0", "some 500"], a: 1, why: "500 ≤ 500 is true, so it returns some (500 − 500) = some 0. Withdrawing everything is allowed." },
  practice: { task: "Add a constructor <code>| freeze</code> to Instruction. Notice Lean now reports errors in describe and applyIx. Add the missing cases (for applyIx, return <code>balance</code> unchanged).", expected: "No errors in the Infoview once every function handles .freeze" }
},
{
  id: "u5", n: 5, title: "Lists and recursion: a ledger",
  hook: "Store many accounts in a list and add up the total supply with a function that calls itself.",
  goals: ["Write list literals and use :: and ++", "Define a recursive function over a list", "Use map, filter and foldl", "Explain why recursion on a list must finish"],
  explain: `
<p>A <b>List</b> holds values of one type in order: <code>[1, 2, 3]</code>. Every list is either empty, <code>[]</code>, or an element stuck on the front of a smaller list, <code>a :: rest</code>. These are exactly List's two constructors (in Lean's own source they're called <code>nil</code> and <code>cons</code>).</p>
<p>So a function on lists usually has two cases, and the second one calls the function again on the smaller <code>rest</code>. That's <b>recursion</b>. Because <code>rest</code> is always shorter, it must eventually reach <code>[]</code>, and Lean checks this. A definition that might loop forever is rejected unless you tell Lean otherwise.</p>
<p>Ready-made tools: <code>map</code> applies a function to every element, <code>filter</code> keeps the elements that pass a test, and <code>foldl</code> walks the list carrying a running total. <code>(·.owner)</code> is shorthand for <code>fun a => a.owner</code>.</p>`,
  worked: { code: `def accounts : List Account :=
  [{ owner := "alice", lamports := 5000 },
   { owner := "bob",   lamports := 1200 },
   { owner := "carol", lamports := 300 }]

def total : List Account → Nat
  | []        => 0
  | a :: rest => a.lamports + total rest

#eval total accounts
#eval accounts.map (·.owner)
#eval (accounts.filter (fun a => a.lamports ≥ 1000)).map (·.owner)
#eval accounts.foldl (fun acc a => acc + a.lamports) 0
#eval 0 :: [1, 2]`,
    output: `6500
["alice", "bob", "carol"]
["alice", "bob"]
6500
[0, 1, 2]`,
    notes: ["This uses the Account structure from Unit 3.", "<code>total</code>: the empty list totals 0. Otherwise it's this account's lamports plus the total of the rest.", "<code>filter</code> keeps accounts with at least 1000 lamports, and then <code>map</code> takes their owners.", "<code>foldl</code> gets the same 6500 as total, by keeping a running sum that starts at 0."] },
  bridge: `<p><b>Rust</b>: <code>accounts.iter().map(|a| a.lamports).sum::&lt;u64&gt;()</code>. Same idea, different spelling. In blockchain terms, <code>total</code> is a <i>total supply</i> calculation, and in Unit 8 you'll prove a fact about it for <i>every possible</i> list, which no number of tests can do.</p>`,
  faded: { prompt: "Complete the recursive case to count how many accounts are in the list.", code: `def count : List Account → Nat
  | []        => 0
  | _ :: rest => 1 + ____`, options: ["count rest", "rest", "count", "1"], answer: 0, why: "Each account adds 1 to the count of the rest of the list. <code>_</code> means \"there is an element here, but I don't need its name\"." },
  quiz: [
    { id: "u5q1", tag: "recursion", q: "What is <code>total []</code>?", options: ["An error", "0", "none", "1"], a: 1, why: "The first case of total says the empty list totals 0." },
    { id: "u5q2", tag: "list-ops", q: "What does <code>#eval 0 :: [1, 2]</code> print?", options: ["[1, 2, 0]", "[0, 1, 2]", "[[0], 1, 2]", "3"], a: 1, why: "<code>::</code> puts an element on the front." },
    { id: "u5q3", tag: "list-ops", q: "Which tool keeps only the elements that pass a test?", options: ["map", "filter", "foldl", "::"], a: 1, why: "filter keeps the elements where the test returns true." },
    { id: "u5q4", tag: "termination", q: "Why does Lean accept <code>total</code> without complaint?", options: ["Lean never checks recursion", "Each recursive call is on a shorter list, so it must finish", "Because it uses Nat", "Because of deriving Repr"], a: 1, why: "Lean checks termination. Here the call is on <code>rest</code>, which is structurally smaller." }
  ],
  challenge: { id: "u5c1", tag: "list-ops", q: "Using the same three accounts, what does <code>(accounts.filter (fun a => a.lamports < 1000)).length</code> give?", options: ["0", "1", "2", "3"], a: 1, why: "Only carol (300) has fewer than 1000 lamports." },
  practice: { task: "Write <code>def richest : List Account → Nat</code> that returns the largest balance (use <code>max</code>, with 0 for the empty list) and evaluate it on <code>accounts</code>.", expected: "5000" }
},
{
  id: "u6", n: 6, title: "Errors as values: a safe transfer",
  hook: "Return either a success or a clear failure reason, Lean's version of Solidity's require and Rust's Result.",
  goals: ["Use Except to return ok or error", "Write a transfer that refuses overdrafts", "Chain steps with do and ←, stopping at the first failure", "Compare Except with Rust Result and Solidity require"],
  explain: `
<p><code>Except ε α</code> means "either an error of type ε, or a success of type α". You build a success with <code>.ok value</code> and a failure with <code>.error reason</code>.</p>
<p><code>Account × Account</code> is a <b>pair</b> type: two accounts together, written <code>(a, b)</code>. A transfer changes two accounts, so it returns a pair.</p>
<p><b>do-notation</b> lets you write steps one after another. <code>let (a1, b1) ← transfer …</code> means "run this, and if it succeeded, unpack the pair and carry on. If it failed, stop and return that error". <code>return</code> wraps the final answer as a success.</p>`,
  worked: { code: `def transfer (src dst : Account) (amount : Nat)
    : Except String (Account × Account) :=
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

#eval twoTransfers`,
    output: `Except.ok ({ owner := "alice", lamports := 3000 }, { owner := "bob", lamports := 3200 })
Except.error "insufficient funds: has 5000, needs 9000"
Except.ok ({ owner := "alice", lamports := 3500 }, { owner := "bob", lamports := 2700 })`,
    notes: ["Because of the check <code>amount ≤ src.lamports</code>, the subtraction can never floor to 0.", "The 9000 transfer is refused with a reason, and neither account changes.", "twoTransfers: alice sends bob 2000, then bob sends 500 back, so alice ends at 3500 and bob at 2700. 6200 in total before and after."] },
  bridge: `<p><b>Solidity</b>: <code>require(balance &gt;= amount, "insufficient funds");</code> reverts the whole transaction if the condition fails. <b>Rust</b>: a function returning <code>Result&lt;(Account, Account), String&gt;</code> with <code>Ok(…)</code> and <code>Err(…)</code>, where the <code>?</code> operator stops at the first error. Lean's <code>←</code> inside <code>do</code> plays the role of Rust's <code>?</code>.</p>`,
  faded: { prompt: "Complete the failure branch so an overdraft returns an error.", code: `def withdraw (acc : Account) (amount : Nat) : Except String Account :=
  if amount ≤ acc.lamports then
    .ok { acc with lamports := acc.lamports - amount }
  else
    ____ "insufficient funds"`, options: [".ok", ".error", "none", "return"], answer: 1, why: "Failures are built with <code>.error</code>. <code>.ok</code> is for success." },
  quiz: [
    { id: "u6q1", tag: "except", q: "What does <code>transfer alice bob 9000</code> return (alice has 5000)?", options: ["Except.ok with alice at 0", "Except.error \"insufficient funds: has 5000, needs 9000\"", "none", "Except.ok with alice at -4000"], a: 1, why: "9000 ≤ 5000 is false, so the else branch returns an error with a reason." },
    { id: "u6q2", tag: "do-notation", q: "Inside <code>do</code>, what does <code>←</code> do when the step returns an error?", options: ["Ignores the error and continues", "Stops and returns that error", "Retries the step", "Converts the error to 0"], a: 1, why: "← continues only on success. Like Rust's ?, it hands back the first error." },
    { id: "u6q3", tag: "rust-bridge", q: "Which Rust type matches <code>Except String α</code>?", options: ["Option&lt;α&gt;", "Result&lt;α, String&gt;", "Vec&lt;α&gt;", "Box&lt;α&gt;"], a: 1, why: "Result holds either Ok(value) or Err(error). Option has no reason attached to a failure." },
    { id: "u6q4", tag: "pairs", q: "Why does transfer return <code>Account × Account</code>?", options: ["Because Lean needs two return values for every function", "Because a transfer changes two accounts, so it returns both updated accounts", "It's a multiplication", "To store the error message"], a: 1, why: "× here builds a pair type, not a multiplication." }
  ],
  challenge: { id: "u6c1", tag: "invariant", q: "In twoTransfers, what is alice's balance plus bob's balance at the end?", options: ["6200", "6700", "5700", "5000"], a: 0, why: "3500 + 2700 = 6200, the same as at the start (5000 + 1200). Transfers move funds without creating any. You'll prove this in Unit 8." },
  practice: { task: "Write <code>#eval transfer bob alice 1200</code> (exactly bob's whole balance). Predict the result first, then check.", expected: "Except.ok ({ owner := \"bob\", lamports := 0 }, { owner := \"alice\", lamports := 6200 })" }
},
{
  id: "u7", n: 7, title: "Propositions and first proofs",
  hook: "State a fact as a type, then give Lean a proof that it checks. This is what makes Lean more than a programming language.",
  goals: ["Write a theorem: name, statement, proof", "Prove simple facts with rfl and decide", "Use the tactics intro, exact and omega", "Read Lean's error messages and the sorry warning"],
  explain: `
<p>A <b>theorem</b> looks just like a definition: <code>theorem name : statement := proof</code>. The statement is a <b>Prop</b> (Unit 1), and the proof is a value of that type. Lean checks the proof the same way it checks that <code>42</code> has type <code>Nat</code>. This idea is called <i>propositions as types</i>. <code>example</code> is a theorem without a name.</p>
<p><b>Proof terms you'll use first:</b> <code>rfl</code> proves <code>a = b</code> when both sides compute to the same thing. <code>by decide</code> asks Lean to just work out whether a concrete statement is true.</p>
<p><b>Tactic mode</b> starts with <code>by</code>. You give step-by-step instructions, and the Infoview shows the current <i>goal</i> after each step:</p>
<ul><li><code>intro h</code>: to prove "if P then Q", assume P (call that assumption h), then prove Q.</li>
<li><code>exact e</code>: "e is exactly the proof needed".</li>
<li><code>omega</code>: proves facts made of +, −, ≤ and &lt; over Nat and Int automatically.</li></ul>
<p><b>When it goes wrong</b>, Lean tells you precisely. A false claim proved <code>by decide</code> gives: <i>Tactic \`decide\` proved that the proposition 2 + 2 = 5 is false</i>. A proof left as <code>sorry</code> is accepted with a <b>warning</b>, <i>declaration uses \`sorry\`</i>. A theorem that uses sorry is <b>not</b> proved.</p>`,
  worked: { code: `example : 2 + 2 = 4 := rfl
theorem ether_in_wei : 10 ^ 18 = 1000000000000000000 := rfl
example : 21000 * 30 = 630000 := by decide

theorem add_zero_example (n : Nat) : n + 0 = n := rfl

example (p q : Prop) : p ∧ q → q ∧ p := by
  intro h
  exact And.intro h.2 h.1

theorem double_pos (n : Nat) (h : 0 < n) : 0 < 2 * n := by
  omega

#check ether_in_wei
#check @double_pos`,
    output: `ether_in_wei : 10 ^ 18 = 1000000000000000000
double_pos : ∀ (n : Nat), 0 < n → 0 < 2 * n`,
    notes: ["No output for a theorem means Lean accepted the proof. Silence is success.", "<code>add_zero_example</code> holds for <b>every</b> n, not just ones we tested.", "<code>p ∧ q</code> is \"p and q\". h.1 and h.2 are its two halves, so we swap them.", "The #check of double_pos reads: for every n, if 0 &lt; n then 0 &lt; 2n. <code>∀</code> means \"for all\"."] },
  bridge: `<p>A <b>test</b> checks some inputs, and a <b>proof</b> covers all of them. A Solidity or Rust test suite might try 1,000 balances. The Lean theorem <code>double_pos</code> covers every natural number there is. Every proof is checked by Lean's small <b>kernel</b> (see Unit 9), so you don't have to trust the person or the AI that wrote the proof, only the kernel.</p>`,
  faded: { prompt: "Pick the tactic that finishes this proof automatically (it's linear arithmetic on Nat).", code: `example (a b : Nat) (h : a ≤ b) : a - b = 0 := by
  ____`, options: ["rfl", "omega", "intro h", "sorry"], answer: 1, why: "omega handles +, −, ≤ over Nat, including truncated subtraction. sorry would leave the theorem unproved." },
  quiz: [
    { id: "u7q1", tag: "sorry", q: "A theorem's proof is <code>sorry</code>. What does Lean do?", options: ["Rejects the file with an error", "Accepts it with a warning, but the theorem is not actually proved", "Proves it automatically", "Deletes the theorem"], a: 1, why: "sorry is a placeholder. Lean warns \"declaration uses `sorry`\". Never trust a result that depends on sorry." },
    { id: "u7q2", tag: "rfl", q: "Which proof works for <code>example : 2 + 2 = 4</code>?", options: ["rfl", "intro h", "sorry is required", "omega is impossible here"], a: 0, why: "Both sides compute to 4, so rfl (reflexivity) proves it. decide or omega would work too." },
    { id: "u7q3", tag: "intro", q: "Your goal is <code>p ∧ q → q ∧ p</code>. What does <code>intro h</code> do?", options: ["Proves the goal immediately", "Assumes p ∧ q as h, leaving the goal q ∧ p", "Swaps p and q", "Introduces a new variable called p"], a: 1, why: "To prove an implication, you assume the left side and prove the right side." },
    { id: "u7q4", tag: "decide-error", q: "What happens with <code>theorem bad : 2 + 2 = 5 := by decide</code>?", options: ["It's accepted", "Lean reports that decide proved the proposition is false", "Lean warns about sorry", "It loops forever"], a: 1, why: "decide evaluates the claim, finds it false, and reports exactly that." },
    { id: "u7q5", tag: "proof-vs-test", q: "What does <code>double_pos</code> establish that tests cannot?", options: ["That the code runs fast", "That the statement holds for every natural number n", "That n is always even", "Nothing more than tests"], a: 1, why: "A theorem with ∀ covers all inputs. Tests only check the inputs someone picked." }
  ],
  challenge: { id: "u7c1", tag: "omega", q: "Which statement can <code>omega</code> prove?", options: ["∀ n : Nat, n * n ≥ n + 1", "∀ a b : Nat, a + b = b + a", "∀ s : String, s ++ \"\" = s", "2 + 2 = 5"], a: 1, why: "omega handles linear arithmetic: + and −, and multiplication by fixed numbers. n·n is not linear (and the first claim is false at n = 0 anyway). Strings are outside omega's domain." },
  practice: { task: "Type <code>theorem t (a b : Nat) (h : a ≤ b) : a - b = 0 := by omega</code>. Then change <code>by omega</code> to <code>by sorry</code> and read the warning.", expected: "No output for the omega version. With sorry: warning: declaration uses `sorry`" }
},
{
  id: "u8", n: 8, title: "Proving a contract invariant",
  hook: "Prove that your transfer can never create or destroy funds and never allows an overdraft, for every possible input.",
  goals: ["State a safety property of a transfer function as a theorem", "Follow unfold, split, simp, subst, omega step by step", "Prove a property about every list by induction", "Explain what the proof does and does not cover"],
  explain: `
<p>This is the payoff of Units 1–7. We take <code>transfer</code> from Unit 6 (here with a fixed error text) and prove three <b>invariants</b>, things that must always be true:</p>
<ol><li><b>Conservation</b>: if a transfer succeeds, the two balances add up to the same total afterwards.</li>
<li><b>No overdraft</b>: if a transfer succeeds, the amount was at most the sender's balance.</li>
<li><b>Rejection</b>: if the amount is more than the balance, the result is always the error.</li></ol>
<p><b>New tactics:</b> <code>unfold transfer at h</code> replaces the name with its definition. <code>split at h</code> splits the <code>if … then … else</code> into two cases, which the <code>·</code> bullets handle one at a time. <code>simp</code> simplifies using known facts. <code>obtain ⟨h1, h2⟩ := h</code> unpacks "A and B" into two facts. <code>subst</code> replaces a variable with what it equals. <code>assumption</code> finishes the goal when it's already one of your facts.</p>
<p><b>Induction</b> (last theorem): to prove something for every list, prove it for <code>[]</code>, then prove that if it holds for <code>rest</code> (the <i>induction hypothesis</i> <code>ih</code>) it holds for <code>a :: rest</code>. This is the same as proof by induction on numbers in first-year maths.</p>
<p><b>Read the limits honestly:</b> these theorems are about <i>this Lean model</i>. They say nothing yet about a deployed Solidity contract or Solana program. Closing that gap is exactly what the real projects in Unit 9 work on.</p>`,
  worked: { code: `theorem transfer_conserves (src dst src' dst' : Account) (amount : Nat)
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

theorem transfer_within_balance (src dst src' dst' : Account) (amount : Nat)
    (h : transfer src dst amount = .ok (src', dst')) :
    amount ≤ src.lamports := by
  unfold transfer at h
  split at h
  · assumption
  · simp at h

theorem transfer_rejects_overdraft (src dst : Account) (amount : Nat)
    (h : src.lamports < amount) :
    transfer src dst amount = .error "insufficient funds" := by
  unfold transfer
  simp
  omega

theorem total_append (xs ys : List Account) :
    total (xs ++ ys) = total xs + total ys := by
  induction xs with
  | nil => simp [total]
  | cons a rest ih => simp [total, ih]; omega

#print axioms transfer_conserves`,
    output: `'transfer_conserves' depends on axioms: [propext, Quot.sound]`,
    notes: ["All four theorems are accepted, so the only output is the #print line.", "In transfer_conserves, the first bullet is the success branch: unpack the two new accounts, then omega shows (s − a) + (d + a) = s + d, which is valid because a ≤ s is known in that branch.", "The second bullet is the failure branch. There h claims an error equals a success, which is impossible, and simp closes it.", "<code>#print axioms</code> lists what the proof ultimately relies on. propext and Quot.sound are standard axioms of Lean's logic. The important thing is that <code>sorryAx</code> doesn't appear, so nothing was skipped."] },
  bridge: `<p>The same pattern (model the program, state an invariant, prove it) shows up in real projects. <b>Verity</b> describes itself as a formally verified smart contract compiler for Ethereum written in Lean 4. <b>Blanc</b> includes a WETH port and a solvency proof. On Solana, the Solana Foundation's experimental <b>Solanalib</b> aims to be a shared Lean library of formal models for Solana programs. Conservation of funds is the kind of property these projects care about.</p>`,
  faded: { prompt: "In <code>transfer_within_balance</code>'s success branch, the fact <code>amount ≤ src.lamports</code> is already one of your hypotheses. Which tactic closes the goal?", code: `  split at h
  · ____
  · simp at h`, options: ["assumption", "sorry", "intro h", "induction"], answer: 0, why: "assumption searches your hypotheses for one that exactly matches the goal." },
  quiz: [
    { id: "u8q1", tag: "invariant", q: "What does <code>transfer_conserves</code> say?", options: ["Transfers are fast", "After a successful transfer, the sum of the two balances is unchanged", "Every transfer succeeds", "Alice always has more than Bob"], a: 1, why: "Funds are moved and never created or destroyed." },
    { id: "u8q2", tag: "split", q: "What does <code>split at h</code> do here?", options: ["Splits a list in two", "Breaks the if-then-else inside h into a success case and a failure case", "Divides numbers", "Splits the file"], a: 1, why: "Each branch of the if becomes its own goal, handled by its own · bullet." },
    { id: "u8q3", tag: "induction", q: "In <code>induction xs with</code>, what is <code>ih</code> in the cons case?", options: ["A new list", "The assumption that the theorem holds for rest", "The final answer", "An error message"], a: 1, why: "The induction hypothesis lets you use the result for the smaller list." },
    { id: "u8q4", tag: "axioms", q: "Why run <code>#print axioms</code>?", options: ["To make the proof faster", "To confirm the proof doesn't rely on sorry or unexpected assumptions", "To print the code", "To deploy the contract"], a: 1, why: "If sorryAx appeared in the list, the proof would have a hole." },
    { id: "u8q5", tag: "model-gap", q: "Do these theorems prove a deployed Solana program is safe?", options: ["Yes, fully", "No, they prove facts about this Lean model. Connecting a model to real deployed code is separate work", "Only on mainnet", "Only if tests pass"], a: 1, why: "A proof is only as good as how faithfully the model matches the real code. That's why projects model real EVM and sBPF semantics." }
  ],
  challenge: { id: "u8c1", tag: "invariant", q: "Which hypothesis makes <code>omega</code> succeed in the success branch of transfer_conserves?", options: ["dst.lamports > 0", "amount ≤ src.lamports (from the if condition)", "amount = 0", "None, since omega needs no facts"], a: 1, why: "Without amount ≤ src.lamports, (s − a) + (d + a) could differ from s + d because of truncated subtraction. split puts the if condition into the success branch as a fact." },
  practice: { task: "Paste the full Unit 8 file (Account, transfer, total and the four theorems) into VS Code. Then break one proof on purpose, for example by deleting <code>omega</code>, and read the unsolved goal in the Infoview.", expected: "With everything intact: only the #print axioms line. With omega deleted: an \"unsolved goals\" error showing the arithmetic left to prove, and #print axioms now lists sorryAx" }
},
{
  id: "u9", n: 9, title: "Inside Lean, and Lean in blockchain today",
  hook: "See how Lean itself is built (from its source code) and where it's really used in Ethereum and Solana work.",
  goals: ["Name the stages a Lean file goes through", "Explain why a small kernel matters for trust", "Name real Ethereum and Solana projects that use Lean and what they do", "Avoid the \"Lean Ethereum\" naming trap"],
  explain: `
<p><b>From Lean's own source code</b> (leanprover/lean4, read for this course):</p>
<ol>
<li><b>Parser</b> (<code>src/Lean/Parser</code>): turns your text into syntax.</li>
<li><b>Elaborator</b> (<code>src/Lean/Elab</code>): fills in hidden details, infers types, and runs tactics. Every tactic you've used has a file in <code>src/Lean/Elab/Tactic</code>, including <code>Omega</code>, <code>Simp.lean</code>, <code>Induction.lean</code> and <code>Decide.lean</code>. The result is a core term (an <code>Expr</code>, which has just 12 kinds of node, such as <code>app</code>, <code>lam</code>, <code>forallE</code> and <code>const</code>).</li>
<li><b>Kernel</b> (<code>src/kernel</code>, written in C++): re-checks every definition and proof. It's about 8,000 lines across 35 files, compared with over 300,000 lines in <code>src/Lean</code>. Tactics can be clever and complicated, and none of that cleverness needs to be trusted, because the small kernel checks the final result.</li>
<li><b>Compiler</b>: turns definitions into fast code. Lean is <i>bootstrapped</i>: it's written in Lean, so the repository keeps pre-built C files (<code>stage0</code>) to compile the first copy of itself.</li>
</ol>
<p><b>Lake</b> (<code>src/lake</code>) is Lean's build tool and package manager, the counterpart of Rust's Cargo.</p>
<p><b>Trust has limits, and it's patched:</b> in 2026 researchers reported kernel soundness bugs that could make Lean accept a false proof (one was given CVE-2026-72844). The fixes shipped in Lean 4.32.2. Keep Lean updated, and be careful with Lake dependencies you don't trust.</p>`,
  worked: { code: `-- Lean's own definitions (from src/Init/Prelude.lean).
-- The types you've used are ordinary inductive types:
inductive Nat where
  | zero : Nat
  | succ (n : Nat) : Nat

inductive List (α : Type u) where
  | nil : List α
  | cons (head : α) (tail : List α) : List α`,
    output: `(Shown for reading only: these are already defined inside Lean,
so pasting them into your own file gives: error: \`Nat\` has already been declared)`,
    notes: ["Nat is \"zero, or the successor of a Nat\". So 3 is succ (succ (succ zero)).", "List is the [] / :: pair you used in Unit 5, under its real names nil and cons.", "Equality itself (<code>Eq</code>, whose one constructor is <code>refl</code>) is defined in the same file. That's where <code>rfl</code> comes from."] },
  bridge: `<p><b>Where Lean is really used (each item is linked under Sources):</b></p>
<ul>
<li><b>EVM semantics:</b> Nethermind built an executable formal model of the EVM and Yul in Lean, following the Yellow Paper and tested against the official Ethereum test suite for the Cancun fork, with an Ethereum Foundation grant (EVMYulLean).</li>
<li><b>Verified zkEVM:</b> the Ethereum Foundation's zkEVM formal verification project, described as a $20M initiative, funds Lean work such as ArkLib (verified arguments of knowledge).</li>
<li><b>Rust → Lean:</b> Aeneas and Hax translate Rust into Lean so it can be proved correct. Runtime Verification reported using them on production cryptographic Rust (Plonky3, RISC Zero) within that project, and Microsoft uses Aeneas for SymCrypt.</li>
<li><b>Solana:</b> the Solana Foundation's Solanalib (experimental) aims to be a shared Lean library of formal models for Solana programs, and qedsvm is a Lean model of the Solana VM that works on the compiled program.</li>
<li><b>Smart-contract languages:</b> Verity, a formally verified smart contract compiler for Ethereum in Lean 4.</li>
</ul>
<p><b>Naming trap:</b> "Lean Ethereum" is Justin Drake's 2025 roadmap vision for Ethereum's next decade (a rename of the "beam chain"). It is <b>not</b> about the Lean language. Don't mix them up in interviews or searches.</p>`,
  faded: { prompt: "Which part of Lean must you trust for a proof to be correct, even when tactics are complicated?", code: `parser → elaborator (tactics) → ____ → compiler`, options: ["kernel", "Lake", "Infoview", "stage0"], answer: 0, why: "The kernel re-checks every proof. It's small (about 8k lines of C++ in src/kernel), which keeps the trusted part manageable." },
  quiz: [
    { id: "u9q1", tag: "kernel", q: "Why does Lean's design keep the kernel small?", options: ["To save disk space", "So the part you must trust for correctness is small enough to scrutinise, while tactics can be big and complex", "Because C++ is slow", "So it can run on phones"], a: 1, why: "Everything is re-checked by the kernel, so bugs in tactics can't produce a false theorem. Only kernel bugs can, which is why the 2026 soundness fixes mattered." },
    { id: "u9q2", tag: "naming", q: "What is \"Lean Ethereum\"?", options: ["A Lean library for Ethereum", "An Ethereum roadmap vision by Justin Drake, unrelated to the Lean language", "Nethermind's EVM model", "A Solana fork"], a: 1, why: "It's a protocol roadmap name, earlier called the beam chain. Nethermind's model is EVMYulLean." },
    { id: "u9q3", tag: "rust-to-lean", q: "What do Aeneas and Hax do?", options: ["Deploy Solana programs", "Translate Rust code into Lean so it can be proved correct", "Compile Lean to Solidity", "Mine blocks"], a: 1, why: "They lift Rust into Lean. Engineers then prove the Lean version meets a specification." },
    { id: "u9q4", tag: "lake", q: "What is Lake's closest equivalent in Rust?", options: ["rustc", "Cargo", "Clippy", "Anchor"], a: 1, why: "Lake builds Lean projects and manages dependencies, like Cargo." },
    { id: "u9q5", tag: "source", q: "In Lean's source, where is the <code>omega</code> tactic implemented?", options: ["src/kernel", "src/Lean/Elab/Tactic", "src/lake", "stage0"], a: 1, why: "Tactics are part of the elaborator, under src/Lean/Elab/Tactic. The kernel only checks the finished proof." }
  ],
  challenge: { id: "u9c1", tag: "soundness", q: "A malicious Lake dependency exploits an old kernel soundness bug to make a false theorem pass. What is the most effective defence from this unit?", options: ["Write more tests", "Use a Lean version with the fix (4.32.2 or later) and avoid untrusted dependencies", "Use sorry", "Switch to Int"], a: 1, why: "The 2026 reports describe malicious metaprograms, for example in a dependency, and list 4.32.2 as fixed." },
  practice: { task: "Open Lean's real source on GitHub (leanprover/lean4) and find <code>src/Init/Prelude.lean</code>. Search the page for <code>inductive Nat</code>. You're reading the same definitions this unit shows.", expected: "You find inductive Nat with constructors zero and succ" }
}
];

const SOURCES = [
  ["Lean 4 source code (read for Unit 9)", "https://github.com/leanprover/lean4"],
  ["Lean bootstrapping doc (stage0)", "https://github.com/leanprover/lean4/blob/master/doc/dev/bootstrap.md"],
  ["Functional Programming in Lean (next step for programming)", "https://lean-lang.org/functional_programming_in_lean/"],
  ["Theorem Proving in Lean 4 (next step for proofs)", "https://lean-lang.org/theorem_proving_in_lean4/"],
  ["Learn Lean: official resource list incl. Natural Number Game", "https://lean-lang.org/learn"],
  ["Nethermind: formal model of EVM and Yul in Lean (Cancun)", "https://www.nethermind.io/blog/a-trustworthy-formal-model-of-evm-yul-in-lean"],
  ["EVMYulLean on Reservoir", "https://reservoir.lean-lang.org/@NethermindEth/evmyul"],
  ["Verified zkEVM (GitHub org, ArkLib)", "https://github.com/Verified-zkEVM"],
  ["EF post-quantum blog: zkEVM formal verification project", "https://pq.ethereum.org/blog/formal-verification-zkevm/"],
  ["Runtime Verification: Rust-to-Lean pipeline (arXiv 2605.30106)", "https://arxiv.org/abs/2605.30106"],
  ["Aeneas (Lean use case)", "https://lean-lang.org/use-cases/aeneas"],
  ["Microsoft: verifying Rust cryptography in SymCrypt", "https://microsoft.com/en-us/research/blog/verifying-rust-cryptography-in-symcrypt-from-standards-to-code"],
  ["Solanalib (Solana Foundation, experimental)", "https://reservoir.lean-lang.org/@solana-foundation/solanalib"],
  ["qedsvm: Lean 4 model of the Solana VM", "https://github.com/QEDGen/qedsvm"],
  ["Verity: verified smart contract compiler in Lean 4", "https://github.com/lfglabs-dev/verity"],
  ["Blanc: minimal EVM language for verification (WETH, solvency)", "https://github.com/skbaek/blanc"],
  ["Lean Ethereum (Justin Drake, EF blog)", "https://blog.ethereum.org/2025/07/31/lean-ethereum"],
  ["Solidity 0.8.0: checked arithmetic by default", "https://soliditylang.org/blog/2020/12/16/solidity-v0.8.0-release-announcement"],
  ["Lean kernel soundness report (oss-security)", "https://seclists.org/oss-sec/2026/q4/379"]
];

const METHOD_SOURCES = [
  ["Dunlosky et al. (2013), Improving Students' Learning With Effective Learning Techniques", "https://doi.org/10.1177/1529100612453266"],
  ["APS summary: practice testing and distributed practice rated highest utility", "https://psychologicalscience.org/?p=82014"],
  ["Renkl & Atkinson (2002), fading worked-out solution steps", "https://escholarship.org/content/qt81b9j9hs/qt81b9j9hs.pdf"],
  ["MIT Open Learning: worked and faded examples", "https://openlearning.mit.edu/mit-faculty/research-based-learning-findings/worked-and-faded-examples"],
  ["Kulik, Kulik & Bangert-Drowns (1990), mastery learning meta-analysis (108 studies)", "https://doi.org/10.3102/00346543060002265"],
  ["Guskey, Lessons of Mastery Learning (Bloom's model: formative test, correctives)", "https://www.ascd.org/el/articles/lessons-of-mastery-learning"]
];
