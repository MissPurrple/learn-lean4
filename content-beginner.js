// Beginner layer. Loaded after content.js.
// It adds Unit 0, rewrites the teaching text in plain language, and adds "Words to know".
// Lean code and Lean output are NOT changed here: they live in content.js and are
// checked against real Lean by tests/check-lean-examples.js.

const UNIT0 = {
  id: "u0", n: 0, title: "The basic ideas",
  hook: "No coding yet. Learn what a blockchain, a balance and a smart contract are, in plain words.",
  goals: [
    "Say in your own words what a blockchain is",
    "Know what ether, wei, SOL and lamports are",
    "Say what a smart contract is",
    "Explain why people want to prove that a program is correct"
  ],
  summary: "A blockchain is a shared record of who owns what. Programs on it handle real money, so we want to be sure they are correct. Lean is a tool that helps us check that.",
  terms: [
    ["Blockchain", "A shared record book of who owns what. Many computers each keep a copy and follow the same rules to agree on every change."],
    ["Ethereum", "A blockchain. Its coin is called ether (ETH)."],
    ["Solana", "Another blockchain. Its coin is called SOL."],
    ["Balance", "How much of a coin an account holds."],
    ["Wei", "The smallest piece of ether. 1 ether = 10^18 wei (a 1 followed by 18 zeros)."],
    ["Lamport", "The smallest piece of SOL. 1 SOL = 1,000,000,000 lamports."],
    ["Smart contract", "A small program stored on a blockchain that follows its rules automatically."],
    ["Solidity", "A programming language commonly used to write smart contracts for Ethereum."],
    ["Rust", "A programming language commonly used to write programs for Solana."],
    ["Lean", "A programming language that can also check mathematical proofs."]
  ],
  explain: `
<p><b>What is a blockchain?</b> Imagine a notebook that lists who owns what. In a normal bank, one company keeps that notebook. On a <b>blockchain</b>, thousands of computers each keep a copy, and they follow the same rules to agree on every change. That is why no single company is in charge of it.</p>
<p><b>Ethereum and Solana</b> are two blockchains. Each has its own coin. Ethereum's coin is <b>ether</b> (written ETH). Solana's coin is <b>SOL</b>. An account on the blockchain holds a <b>balance</b>, which is how much of the coin it owns.</p>
<p><b>Tiny units.</b> Think of dollars and cents: you can pay £1 or 100p, and a shop never charges half a penny. Computers prefer whole numbers, so blockchains count money in the smallest piece:</p>
<ul>
<li>Ethereum: <b>wei</b>. 1 ether = 10<sup>18</sup> wei. That is a 1 followed by 18 zeros: 1,000,000,000,000,000,000.</li>
<li>Solana: <b>lamports</b>. 1 SOL = 1,000,000,000 lamports (a billion).</li>
</ul>
<p>So a balance is always stored as a whole number. That is why Unit 1 spends so long on whole numbers.</p>
<p><b>What is a smart contract?</b> It is a small program that lives on the blockchain and follows rules by itself. For example: "only move money out of this account if it holds enough." Ethereum contracts are commonly written in a language called <b>Solidity</b>. Solana programs are commonly written in <b>Rust</b>. You don't need to know either language for this course.</p>
<p><b>Why does Lean matter here?</b> A smart contract handles real money, and a mistake can be expensive. Programmers normally <b>test</b> their code: they try some inputs and check the answers. But tests only cover the inputs someone thought to try. Lean can check a <b>proof</b>: a step-by-step argument that something is true for <i>every</i> possible input, not just the ones you tried. That is why Lean is used on blockchain projects (you will see real ones in Unit 9).</p>
<p><b>The plan.</b> You learn Lean in small steps. Along the way you build a simple model of a bank account, and in Unit 8 you read a proof that a transfer never creates or destroys money.</p>
<p>You don't need any maths or programming experience for this. Everything is explained from scratch. Wrong answers are recorded so you can see exactly what to practise.</p>`,
  worked: {
    code: `#eval 2 + 3
#eval 10 * 4
#eval "Hello, " ++ "Lean"`,
    output: `5
40
"Hello, Lean"`,
    notes: [
      "<code>#eval</code> is a Lean command. It means \"work this out and show me the answer\".",
      "<code>2 + 3</code> is ordinary addition, so Lean shows 5.",
      "<code>*</code> means multiply (like × in maths), so 10 * 4 is 40.",
      "Text goes in double quotes, and <code>++</code> joins two pieces of text together. You get \"Hello, Lean\"."
    ]
  },
  bridge: `<p>Nothing to compare yet. From Unit 1 on, each lesson has a short section showing how the same idea looks in <b>Solidity</b> (Ethereum) and <b>Rust</b> (Solana). You can just read those; you won't be asked to write either language.</p>`,
  faded: {
    prompt: "Fill the blank so Lean works out 6 times 7 (the answer should be 42).",
    code: `#eval 6 ____ 7`,
    options: ["+", "*", "=", "x"],
    answer: 1,
    why: "<code>*</code> means multiply in Lean, and in most programming languages. The letter x isn't an operator, and <code>+</code> would give 13."
  },
  quiz: [
    { id: "u0q1", tag: "blockchain", q: "What is a blockchain?", options: ["A shared record of who owns what, kept by many computers", "A private database owned by one company", "A kind of programming language", "A website for storing photos"], a: 0, why: "Many computers each keep a copy of the record and follow the same rules to agree on changes." },
    { id: "u0q2", tag: "units", q: "Which of these is the smallest piece of ether?", options: ["gwei", "wei", "lamport", "SOL"], a: 1, why: "Wei is the smallest piece: 1 ether = 10^18 wei. A lamport is the small unit of Solana's coin, SOL." },
    { id: "u0q3", tag: "units", q: "How many lamports make 1 SOL?", options: ["100", "1,000", "1,000,000,000", "10^18"], a: 2, why: "1 SOL = 1,000,000,000 lamports (a billion). 10^18 is the number of wei in one ether." },
    { id: "u0q4", tag: "smart-contract", q: "What is a smart contract?", options: ["A legal paper signed by two people", "A small program stored on a blockchain that follows its rules automatically", "A password for your wallet", "A type of coin"], a: 1, why: "It is a program. For example it can refuse to move money out of an account that doesn't hold enough." },
    { id: "u0q5", tag: "proof-vs-test", q: "Why might you want a proof that a program is correct, and not only tests?", options: ["Proofs make the program run faster", "A proof covers every possible input, while tests only check the inputs someone tried", "Tests aren't allowed on blockchains", "Proofs make the code shorter"], a: 1, why: "A test checks some inputs. A proof covers all of them." }
  ],
  challenge: { id: "u0c1", tag: "units", q: "An account holds 2,500,000,000 lamports. How many SOL is that?", options: ["0.25 SOL", "2.5 SOL", "25 SOL", "250 SOL"], a: 1, why: "1 SOL is 1,000,000,000 lamports, so 2,500,000,000 is two and a half of those: 2.5 SOL." },
  practice: { task: "Open the Lean Playground (the Start here page shows how). Delete whatever is in the editor, type <code>#eval 2 + 3</code>, and look for the answer in the results panel next to your code.", expected: "5" }
};

// Plain-language rewrites. Each entry replaces the text of the same unit in content.js.
const BEGINNER = {

u1: {
  hook: "Run your first Lean commands, and see why a money balance can quietly go wrong.",
  goals: [
    "Use #eval to make Lean work out an answer",
    "Use #check to see what type something is",
    "Tell apart Nat, Int, String, Bool and Prop",
    "Explain why 5 − 7 gives 0 for a Nat, and why that matters for money"
  ],
  summary: "A Nat is a counting number: it can never go below zero. So in Lean, 5 − 7 is 0, not −2, and Lean doesn't warn you. For a bank balance, that is a trap.",
  terms: [
    ["#eval", "A Lean command that means \"work this out and show me the answer\"."],
    ["#check", "A Lean command that shows what <i>type</i> something is, without working out its value."],
    ["Type", "The kind of thing a value is. 42 is a number, \"wei\" is text. Lean writes it after a colon: <code>42 : Nat</code>, read as \"42 is a Nat\"."],
    ["Nat", "Short for \"natural number\": 0, 1, 2, 3 and so on. The numbers you count with. No fractions and no negatives."],
    ["Int", "Short for \"integer\": whole numbers that <i>can</i> be negative, like −2, 0, 5."],
    ["String", "Text, written in double quotes, like \"hello\"."],
    ["Bool", "Short for \"Boolean\": either <code>true</code> or <code>false</code>."],
    ["Prop", "Short for \"proposition\": a statement that could be true or false, like 3 ≤ 5. (≤ means \"less than or equal to\".)"],
    ["Truncated subtraction", "Subtraction on Nat that stops at 0 instead of going negative. \"Truncated\" means \"cut off\"."],
    ["Comment", "A note for humans. In Lean it starts with <code>--</code> and Lean ignores the rest of that line."],
    ["Infoview", "The side panel where Lean shows its answers."]
  ],
  explain: `
<p><b>Lean checks your work as you type.</b> You write a line and Lean answers straight away. There is no "run" button. The answers show up in a side panel called the <b>Infoview</b>.</p>
<p>Two commands to learn first:</p>
<ul>
<li><code>#eval</code> means "work this out and show me the answer". For example <code>#eval 2 + 3</code> shows <code>5</code>.</li>
<li><code>#check</code> means "don't work it out, just tell me what <b>kind</b> of thing this is". The kind is called its <b>type</b>. For example <code>#check 42</code> shows <code>42 : Nat</code>. Read the colon as "is a": 42 is a Nat.</li>
</ul>
<p>Every value has a type. A plain whole number like <code>42</code> is a Nat unless you tell Lean otherwise. These are the types you need now:</p>
<ul>
<li><b>Nat</b>: the counting numbers 0, 1, 2, 3 and so on. No fractions and <b>no negatives</b>. (Nat is short for "natural number".)</li>
<li><b>Int</b>: whole numbers that <i>can</i> be negative: …, −2, −1, 0, 1, 2, … (short for "integer").</li>
<li><b>String</b>: text, in double quotes, like <code>"wei"</code>.</li>
<li><b>Bool</b>: <code>true</code> or <code>false</code>.</li>
<li><b>Prop</b>: a <i>statement</i> that could be true or false, such as <code>3 ≤ 5</code> ("3 is less than or equal to 5"). You will prove statements like this in Unit 7.</li>
</ul>
<p><b>The big surprise: a Nat can never go below zero.</b> Think of counting apples. You have 5 and you take away 7. You can't have −2 apples, so Lean says <code>0</code>. This is called <i>truncated subtraction</i> ("cut off at zero"). Lean does <b>not</b> show an error. It just quietly gives 0.</p>
<p><b>Why this matters for money.</b> A token balance is a whole number that is never negative, so a Nat is a natural fit. But if someone tries to withdraw more than they have, then 5 − 7 quietly becomes 0 and nothing warns you. So the program has to check "is the amount at most the balance?" itself. Units 4, 6 and 8 build exactly that check.</p>
<p><b>The symbols in the example below:</b></p>
<ul>
<li><code>+</code> <code>-</code> <code>*</code> are plus, minus and times. <code>/</code> is divide and <code>%</code> is the remainder.</li>
<li><code>^</code> means "to the power of". For example <code>10 ^ 3</code> is 10 × 10 × 10 = 1000. So <code>10 ^ 18</code> is a 1 followed by 18 zeros. That is the number of wei in one ether (see Unit 0).</li>
<li><code>(5 : Int)</code> means "treat this 5 as an Int". The colon again reads "is a". Once the numbers are Ints, negatives are allowed, so 5 − 7 gives −2 like in normal maths.</li>
</ul>
<p><b>Typing the symbols.</b> Lean uses a few mathematical symbols (≤ ≥ → ∧ ∀). You can copy and paste them. On a keyboard Lean also accepts plain versions: <code>&lt;=</code> for ≤, <code>&gt;=</code> for ≥, <code>-&gt;</code> for → and <code>/\</code> for ∧. The VS Code extension also lets you type a backslash and a name, such as <code>\le</code> for ≤. In code the minus is always the ordinary hyphen <code>-</code>. The longer minus (−) in these explanations is only for reading.</p>`,
  worked: { notes: [
    "<code>2 + 3</code> is plain addition. The answer is 5.",
    "<code>10 ^ 18</code> is 10 to the power 18: a 1 followed by 18 zeros, the number of wei in one ether. Everything after <code>--</code> is a comment. Lean ignores it.",
    "<code>++</code> joins two pieces of text.",
    "<code>5 - 7</code> gives 0. Both numbers are Nat, a Nat can't go below zero, so Lean stops at 0 and doesn't complain.",
    "<code>/</code> on Nat is whole-number division: 2 fits into 7 three whole times, so the answer is 3. The leftover is dropped.",
    "<code>%</code> gives that leftover (the remainder): 7 % 2 is 1.",
    "<code>#check</code> shows types without computing. <code>42 : Nat</code> reads \"42 is a Nat\", and <code>\"wei\" : String</code> reads &quot;wei&quot; is a String.",
    "<code>3 ≤ 5</code> is a statement, so its type is Prop. <code>#check</code> doesn't decide whether it is true.",
    "<code>(5 : Int)</code> means \"treat this 5 as an Int\". Now negatives are allowed, so 5 − 7 is −2."
  ] },
  bridge: `<p class="muted">Skim this one. You won't be tested on the Solidity and Rust details.</p>
<p>The same sum, 5 − 7, behaves differently in three languages.</p>
<ul>
<li><b>Solidity</b> (Ethereum), since version 0.8.0: arithmetic on <code>uint256</code> is checked by default, so 5 − 7 makes the transaction <b>revert</b> (it is cancelled) instead of giving a wrong number. You can switch this off with <code>unchecked { }</code>.</li>
<li><b>Rust</b> (Solana): in debug builds an overflow <b>panics</b> (the program stops with an error). In release builds it <b>wraps around</b> unless overflow checks are turned on. Methods like <code>checked_sub</code> return an <code>Option</code>, a value that says whether there is an answer (you will meet Option in Unit 4).</li>
<li><b>Lean's Nat</b>: it never overflows (there is no biggest number) and it stops at 0.</li>
</ul>
<p>So the same sum can behave in three different ways, and the difference can matter when the number is someone's money.</p>`,
  practice: { task: "Open the Lean Playground (the Start here page shows how). Type the worked example one line at a time and look at the result for each line. Then try <code>#eval 10 ^ 9</code>, the number of wei in one gwei (a gwei is a small unit of ether: a billion wei)." }
},

u2: {
  hook: "Give a name to a value, and write small functions such as one that turns ether into wei.",
  goals: [
    "Give a value a name with def",
    "Write a function with inputs and an output type",
    "Call a function by writing its name and then its inputs, separated by spaces",
    "Read a function type such as Nat → Nat → Nat"
  ],
  summary: "<code>def</code> gives something a name. A function is a named rule: put something in, get something out. In Lean you call it with spaces, not brackets: <code>etherToWei 2</code>.",
  terms: [
    ["def", "Short for \"define\". It gives a name to a value or a function."],
    ["Function", "A rule that takes inputs and gives an output, like f(x) = 2x in maths."],
    ["Input / argument", "A value you hand to a function."],
    ["<code>:=</code>", "Read it as \"is defined as\". (It isn't the equals sign you use in maths.)"],
    ["Function type", "Written with arrows. <code>Nat → Nat</code> means \"give me a Nat and I give you a Nat\"."],
    ["Partial application", "Giving a function only some of its inputs. You get back a function that is still waiting for the rest."],
    ["fun", "Builds a function without giving it a name (an \"anonymous function\" or \"lambda\")."],
    ["Gas", "On Ethereum, the fee for running a transaction. A plain transfer of ether uses 21,000 units of gas."],
    ["Gwei", "A unit of ether: 1 gwei = 10^9 wei (a billion wei)."]
  ],
  explain: `
<p><b>Naming a value.</b> <code>def</code> (short for "define") gives a name to something. The pattern is <code>def name : Type := value</code>. Read it as "define <i>name</i>, which is a <i>Type</i>, to be <i>value</i>". For example <code>def weiPerEther : Nat := 10 ^ 18</code>. After that you can use <code>weiPerEther</code> anywhere below it. Naming a number once also stops you typing the wrong number of zeros twice.</p>
<p><b>Writing a function.</b> A function is a rule: you put something in and you get something out, like f(x) = 2x in maths. In Lean you list each input in brackets with its type, then the type of the answer, then the rule:</p>
<p><code>def etherToWei (eth : Nat) : Nat := eth * weiPerEther</code></p>
<ul>
<li><code>(eth : Nat)</code>: one input, called <code>eth</code>, which is a Nat.</li>
<li>the second <code>: Nat</code>: the answer is also a Nat.</li>
<li>after <code>:=</code>: the rule. Multiply the input by <code>weiPerEther</code>.</li>
</ul>
<p><b>Calling a function.</b> You don't put brackets or commas round the inputs. You write the name, a space, then the inputs: <code>etherToWei 2</code>. With two inputs it looks like <code>gasCost 21000 30</code>.</p>
<p>Brackets are only for <b>grouping</b>. In <code>double (double 5)</code> the inner call is worked out first, and its answer becomes the input of the outer call.</p>
<p><b>Gas.</b> On Ethereum, running a transaction costs a fee called <b>gas</b>. A plain transfer of ether uses 21,000 units of gas. In this example the price of one unit is given in <b>gwei</b>, where 1 gwei = 10<sup>9</sup> wei. So the fee is the gas used × the price in gwei × 10<sup>9</sup>, and that is what <code>gasCost</code> works out.</p>
<p><b>Function types use arrows.</b> <code>Nat → Nat</code> means "give me a Nat and I will give you a Nat". A function with two Nat inputs and a Nat answer has the type <code>Nat → Nat → Nat</code>. If you give only the first input (<code>gasCost 21000</code>), you get back a function that is still waiting for the second one, with type <code>Nat → Nat</code>. This is called <i>partial application</i>.</p>
<p><b>Functions with no name.</b> <code>fun (n : Nat) => n * 2</code> is a function without a name. It means "take n and give back n × 2".</p>`,
  worked: { notes: [
    "1 ether = 10<sup>18</sup> wei, 1 gwei = 10<sup>9</sup> wei, and 1 SOL = 10<sup>9</sup> lamports. Each is defined once with <code>def</code> and named.",
    "<code>etherToWei 2</code> and <code>solToLamports 3</code> are calls: the name, a space, then the input. 2 ether is 2 × 10<sup>18</sup> wei and 3 SOL is 3,000,000,000 lamports.",
    "<code>#check etherToWei</code> shows the inputs and the output type.",
    "<code>(gasUsed gasPriceGwei : Nat)</code> is shorthand for two inputs that are both Nat.",
    "21,000 is the gas used by a plain ETH transfer. At a price of 30 gwei that costs 630,000,000,000,000 wei, which is 0.00063 ETH.",
    "<code>gasCost 21000</code> on its own is a function still waiting for the gas price, so its type is <code>Nat → Nat</code>.",
    "<code>fun (n : Nat) => n * 2</code> is a function without a name. Here it is given the name <code>double</code>, and <code>double 21</code> is 42."
  ] },
  bridge: `<p class="muted">Skim this one. You won't be tested on the Rust details.</p>
<p><b>Rust</b> has the same idea: <code>fn ether_to_wei(eth: u128) -&gt; u128 { eth * WEI_PER_ETHER }</code>.</p>
<p>Two differences to notice. Rust puts inputs in brackets with commas (<code>gas_cost(21000, 30)</code>), and Lean uses spaces (<code>gasCost 21000 30</code>). And Rust's <code>u128</code> has a biggest value while Lean's <code>Nat</code> does not. That matters later: a proof about unlimited Nats doesn't automatically hold for fixed-size integers.</p>`
},

u3: {
  hook: "Group related facts into one value, like a form with labelled boxes. Here: an account with an owner and a balance.",
  goals: [
    "Declare a structure with named fields",
    "Create a value and read one field with a dot",
    "Make an updated copy with { x with … }",
    "Explain why the original value doesn't change"
  ],
  summary: "A <b>structure</b> is a form with labelled boxes (fields). Lean never changes a value in place. To \"update\" something you make a changed copy, and the original stays as it was.",
  terms: [
    ["Structure", "A bundle of named pieces of data, like a form with labelled boxes."],
    ["Field", "One labelled box in a structure, for example <code>owner</code> or <code>lamports</code>."],
    ["Dot notation", "Reading a field with a dot: <code>alice.lamports</code> means \"alice's lamports\"."],
    ["deriving Repr", "Asks Lean to write the code that prints your structure. (Repr is short for \"representation\".)"],
    ["Immutable", "Cannot be changed. Lean values are immutable: you make a changed copy instead."],
    ["{ acc with … }", "\"Make a copy of acc, but change the named field.\""],
    ["Account", "On Solana, an account holds data and a balance of lamports. Here it is a structure with an owner and a balance."]
  ],
  explain: `
<p>A <b>structure</b> bundles several pieces of data into one thing, like a form with labelled boxes. We write <code>structure Account where</code> and then one box (a <b>field</b>) per line, each with its type.</p>
<p>To make one, you use curly brackets: <code>{ owner := "alice", lamports := 5000 }</code>. To read one box, you use a dot: <code>alice.lamports</code> means "the lamports of alice".</p>
<p><code>deriving Repr</code> asks Lean to make your structure printable. Always write it. In Lean 4.36, <code>#eval alice</code> happens to work without it, but other ways of printing the structure (such as <code>repr alice</code>) fail with an error.</p>
<p><b>Lean values never change.</b> Think of photocopying a form: <code>{ acc with lamports := … }</code> makes a <i>new copy</i> of the account and changes only the box you name. The original form is untouched. That is why <code>alice.lamports</code> is still 5000 after a deposit. Everything a function does shows up in what it <i>returns</i>, which makes it much easier to prove things about it later.</p>`,
  worked: { notes: [
    "<code>structure Account where</code> starts the form. The two boxes are indented underneath: an <code>owner</code> (text) and the <code>lamports</code> balance (a Nat).",
    "<code>def alice … := { owner := \"alice\", lamports := 5000 }</code> fills in the form. <code>#eval alice</code> prints it, and <code>alice.lamports</code> reads one box.",
    "<code>deposit</code> returns a <i>new</i> Account with 250 more lamports. That is the photocopy.",
    "The last line shows alice is still 5000. Nothing was changed in place."
  ] },
  bridge: `<p class="muted">Skim this one. You won't be tested on the Rust details.</p>
<p><b>Rust</b> has the same idea: <code>struct Account { owner: String, lamports: u64 }</code>. Every Solana account really does carry a <code>lamports</code> balance.</p>
<p>One difference: in Rust you would often write <code>fn deposit(acc: &amp;mut Account, amount: u64)</code>, which changes the account in place. Tools that translate Rust into Lean (such as <b>Aeneas</b>, which Microsoft uses to verify Rust cryptography) turn that kind of in-place change into a function that takes the old value and returns the new one, exactly like the Lean version above.</p>`
},

u4: {
  hook: "List every choice an instruction can be, then handle each one. Also meet Option, for answers that might not exist.",
  goals: [
    "Declare an inductive type with several choices",
    "Write a function that handles each choice (pattern matching)",
    "Use Option for an answer that might be missing",
    "Spot the bug that truncated subtraction causes"
  ],
  summary: "An <b>inductive type</b> is a menu of choices. Pattern matching says what to do for each choice, and Lean refuses your code if you forget one. <b>Option</b> is either <code>some answer</code> or <code>none</code>.",
  terms: [
    ["Inductive type", "A type defined by listing every possible choice (every shape a value can have)."],
    ["Constructor", "One choice in an inductive type. It can carry data, like <code>deposit (amount : Nat)</code> carries an amount."],
    ["Pattern matching", "Writing one line for each choice: \"if it is this, do that\"."],
    ["Exhaustive", "Covers every choice. Lean checks this and rejects your code if a case is missing."],
    ["Option", "A value that is either <code>some x</code> (here is the answer) or <code>none</code> (there is no answer)."],
    ["Instruction", "On Solana, a command sent to a program. Here it is a menu of three: deposit, withdraw or close."],
    ["<code>s!\"…\"</code>", "Builds text with values put inside the curly brackets, like <code>s!\"deposit {n}\"</code>."]
  ],
  explain: `
<p>An <b>inductive type</b> lists <i>every possible choice</i> a value can be, like a menu where you must pick exactly one item. Each choice is a <b>constructor</b>, written after a <code>|</code>, and a choice can carry data: <code>| deposit (amount : Nat)</code> is "a deposit, and here is the amount".</p>
<p>To use one you write a function that handles each choice. This is called <b>pattern matching</b>: one line per choice, and Lean picks the line that fits. <code>.deposit n</code> is a short way to write <code>Instruction.deposit n</code>. If you leave a choice out, Lean <b>refuses the definition</b> with an error (it says which case is missing). So a forgotten case is caught right away, not found later as a bug.</p>
<p>Look at how <code>describe</code> is written. It has no named input: <code>def describe : Instruction → String</code> just says "takes an Instruction, gives a String", and the <code>|</code> lines below say what to do for each choice. In <code>.deposit n</code>, the <code>n</code> is a name for the amount that came with the deposit.</p>
<p><code>s!"deposit {n}"</code> builds a piece of text and puts the value of <code>n</code> inside it.</p>
<p><b>Look closely at the worked example.</b> <code>applyIx 500 (.withdraw 900)</code> gives 0. Someone withdrew 900 from a balance of 500 and nothing complained. That is truncated subtraction from Unit 1 turning into a real bug.</p>
<p>The fix is <b>Option</b>. An Option is either <code>some x</code> ("here is the answer") or <code>none</code> ("there is no valid answer"). The function <code>safeWithdraw</code> checks first, and gives back <code>none</code> instead of pretending.</p>`,
  worked: { notes: [
    "<code>inductive Instruction</code> lists three choices: deposit, withdraw and close. The first two carry an amount.",
    "<code>describe</code> has one line per choice. <code>describe (.deposit 100)</code> picks the deposit line, so the text is \"deposit 100\".",
    "<code>applyIx 500 (.withdraw 200)</code>: the brackets make <code>.withdraw 200</code> one input. 500 − 200 is 300, as expected.",
    "<code>applyIx 500 (.withdraw 900)</code> gives 0. That is the silent bug: 900 is more than the balance and nothing warned us.",
    "<code>safeWithdraw</code> checks <code>amount ≤ balance</code> first. If it isn't allowed, the answer is <code>none</code>. Otherwise it is <code>some</code> of the new balance.",
    "<code>some 300</code> means \"yes, and the new balance is 300\". <code>none</code> means \"not allowed\"."
  ] },
  bridge: `<p class="muted">Skim this one. You won't be tested on the Rust details.</p>
<p><b>Rust</b> has the same idea. An inductive type is Rust's <b>enum</b>: <code>enum Instruction { Deposit(u64), Withdraw(u64), Close }</code>, handled with a <code>match</code>. Rust also rejects a <code>match</code> that misses a case.</p>
<p>This is the shape commonly used to read and dispatch the instructions a Solana program receives. Lean's <code>Option</code> (<code>some</code> / <code>none</code>) is Rust's <code>Option</code> (<code>Some</code> / <code>None</code>).</p>`
},

u5: {
  hook: "Keep many accounts in a list, and add up the total with a function that calls itself.",
  goals: [
    "Write lists, and use :: and ++",
    "Write a function that calls itself on a smaller list (recursion)",
    "Use map, filter and foldl",
    "Explain why this kind of recursion must finish"
  ],
  summary: "A list is either empty or one item in front of a shorter list. A function on a list handles those two cases, and in the second case it calls itself on the shorter list. That is <b>recursion</b>.",
  terms: [
    ["List", "Items of one type kept in order, like <code>[1, 2, 3]</code>."],
    ["<code>[]</code>", "The empty list."],
    ["<code>::</code>", "Puts one item on the front of a list. <code>0 :: [1, 2]</code> is <code>[0, 1, 2]</code>."],
    ["Recursion", "A function that uses itself on a smaller piece of the problem, like counting a stack of coins by removing one coin at a time."],
    ["map", "Applies a function to every item in a list and gives a new list."],
    ["filter", "Keeps only the items that pass a test."],
    ["foldl", "Walks along a list from the left, carrying a running total."],
    ["Total supply", "The sum of all the balances. Here: the lamports of all accounts added together."],
    ["Termination", "Making sure a function finishes. Lean checks that each recursive call works on something smaller."],
    ["<code>_</code>", "\"There is something here, but I don't need its name.\""]
  ],
  explain: `
<p>A <b>List</b> keeps items of one type in order: <code>[1, 2, 3]</code>. Every list is one of two things: <b>empty</b>, written <code>[]</code>, or <b>one item stuck on the front of a shorter list</b>, written <code>a :: rest</code>. (Read <code>::</code> as "followed by".) In Lean's own source code those two shapes are called <code>nil</code> and <code>cons</code>.</p>
<p>So a function on a list usually has <b>two cases</b>: what to do with the empty list, and what to do with <code>a :: rest</code>. In the second case, the function calls <i>itself</i> on the shorter list <code>rest</code>. That is <b>recursion</b>. Think of counting a stack of coins: if the stack is empty the count is 0, otherwise it is 1 plus the count of the rest of the stack.</p>
<p>Because <code>rest</code> is always shorter, you eventually reach <code>[]</code> and the function stops. Lean checks this. If a function might go on forever, Lean rejects it.</p>
<p>Three ready-made tools:</p>
<ul>
<li><code>map</code> applies a function to <i>every</i> item and gives a new list.</li>
<li><code>filter</code> keeps only the items that pass a test.</li>
<li><code>foldl</code> walks along the list carrying a running total.</li>
</ul>
<p><code>++</code> joins two lists: <code>[1, 2] ++ [3]</code> is <code>[1, 2, 3]</code>.</p>
<p>Two bits of shorthand. <code>fun a => a.lamports</code> is a function with no name: "take a, give back its lamports". <code>(·.owner)</code> is the same kind of thing with the name left out. The <code>·</code> stands for the item being passed in, so it means "take an account, give back its owner".</p>
<p><code>foldl f start list</code> goes along the list from the left. It begins with <code>start</code>. At each item, <code>f</code> is given the running total so far and the next item, and returns the new running total. So <code>foldl (fun acc a => acc + a.lamports) 0 accounts</code> starts at 0 and adds each account's lamports.</p>
<p>You'll also see <code>accounts.map …</code>. Writing <code>x.f</code> calls the function <code>f</code> on <code>x</code>, so <code>accounts.map g</code> is the same as <code>List.map g accounts</code>.</p>`,
  worked: { notes: [
    "This uses the Account structure from Unit 3. <code>accounts</code> is a list of three of them.",
    "<code>total</code> has two cases. The empty list adds up to 0. Otherwise it is this account's lamports plus the total of the rest. The total of all balances is a \"total supply\" calculation.",
    "<code>map (·.owner)</code> takes each account and keeps only its owner.",
    "<code>filter</code> keeps the accounts with at least 1000 lamports (alice and bob), and then <code>map</code> takes their owners.",
    "<code>foldl</code> gets the same 6500 as <code>total</code>, by carrying a running sum that starts at 0.",
    "<code>0 :: [1, 2]</code> puts 0 on the front, giving <code>[0, 1, 2]</code>."
  ] },
  bridge: `<p class="muted">Skim this one. You won't be tested on the Rust details.</p>
<p><b>Rust</b>: <code>accounts.iter().map(|a| a.lamports).sum::&lt;u64&gt;()</code>. It is the same idea in different spelling.</p>
<p>In blockchain terms, <code>total</code> is a <i>total supply</i> calculation. In Unit 8 you'll see a proof of a fact about it for <i>every possible list</i>, which no number of tests can do.</p>`
},

u6: {
  hook: "Give back either a success or a clear reason for failure. This is Lean's version of Solidity's require and Rust's Result.",
  goals: [
    "Use Except to return ok or an error",
    "Write a transfer that refuses overdrafts",
    "Chain steps with do and ←, stopping at the first failure",
    "Compare Except with Rust's Result and Solidity's require"
  ],
  summary: "<b>Except</b> is a value that is either a success (<code>.ok</code>) or a failure with a reason (<code>.error</code>). Inside <code>do</code>, the arrow <code>←</code> stops at the first failure.",
  terms: [
    ["Except", "A value that is either a success or an error with a reason. <code>Except String Account</code> means \"an error message, or an Account\"."],
    ["<code>.ok</code> / <code>.error</code>", "Build a success or a failure."],
    ["Pair", "Two values together, written <code>(a, b)</code>. Its type is written <code>Account × Account</code>."],
    ["do", "Lets you write steps one after the other."],
    ["<code>←</code>", "\"Run this step. If it worked, carry on with its result. If it failed, stop and return that failure.\""],
    ["return", "Wraps the final answer as a success."],
    ["require", "A Solidity check that cancels the whole transaction if a condition is false."],
    ["Result", "Rust's type that is either <code>Ok</code> or <code>Err</code>."]
  ],
  explain: `
<p><code>Except E A</code> means "either an error of type E, or a success of type A". (Lean writes the blanks as the Greek letters ε and α. Think of them as gaps to fill in.) Here the error is a piece of text, so E is <code>String</code> and we write <code>Except String …</code>. You make a success with <code>.ok value</code> and a failure with <code>.error reason</code>.</p>
<p>Two small words you'll see. <code>if … then … else …</code> picks one of two answers depending on a yes/no condition. <code>let x ← …</code> gives a name to a result so you can use it in the lines below.</p>
<p><code>Account × Account</code> is a <b>pair</b> type: two accounts together, written <code>(a, b)</code>. (The × here isn't multiplication.) A transfer changes two accounts, the sender and the receiver, so it returns a pair.</p>
<p><b>do-notation</b> lets you write steps one after another. The line <code>let (a1, b1) ← transfer …</code> means: run the transfer; if it worked, unpack the pair and carry on; if it failed, <b>stop</b> and return that failure. <code>return</code> wraps the final answer as a success.</p>
<p>Notice the check <code>amount ≤ src.lamports</code> in <code>transfer</code>. Because of it, the subtraction can never hit the "stops at zero" trap from Unit 1.</p>`,
  worked: { notes: [
    "<code>transfer</code> takes a sender, a receiver and an amount. It first checks <code>amount ≤ src.lamports</code>. If that holds, it gives back <code>.ok</code> with two updated accounts. Otherwise it gives back <code>.error</code> with a reason.",
    "Because of that check, the subtraction can never floor to 0 by accident.",
    "<code>transfer alice bob 2000</code> succeeds: alice goes from 5000 to 3000 and bob from 1200 to 3200.",
    "<code>transfer alice bob 9000</code> is refused with a reason, and neither account changes.",
    "<code>twoTransfers</code>: alice sends bob 2000, then bob sends 500 back. Alice ends at 3500 and bob at 2700. The total is 6200 before and after."
  ] },
  bridge: `<p class="muted">Skim this one. You won't be tested on the Solidity and Rust details.</p>
<p><b>Solidity</b>: <code>require(balance &gt;= amount, "insufficient funds");</code> cancels (reverts) the whole transaction if the condition fails.</p>
<p><b>Rust</b>: a function that returns <code>Result&lt;(Account, Account), String&gt;</code> with <code>Ok(…)</code> and <code>Err(…)</code>. The <code>?</code> operator stops at the first error. Lean's <code>←</code> inside <code>do</code> plays the role of Rust's <code>?</code>.</p>`
},

u7: {
  hook: "Write a statement as a type, and give Lean a proof that it checks. This is what makes Lean more than a programming language.",
  goals: [
    "Write a theorem: a name, a statement and a proof",
    "Prove simple facts with rfl and decide",
    "Use the steps intro, exact and omega",
    "Read Lean's error messages and the sorry warning"
  ],
  summary: "A <b>theorem</b> is a statement plus a proof. Lean checks the proof the way it checks that <code>42</code> is a Nat. A proof covers <i>every</i> input; a test only covers the ones you try.",
  terms: [
    ["Theorem", "A statement together with a proof of it. <code>example</code> is a theorem without a name."],
    ["Proposition", "A statement that could be true or false (type Prop, from Unit 1)."],
    ["Proof", "Something that convinces Lean the statement is true. Lean checks it."],
    ["<code>rfl</code>", "Proves \"a = b\" when both sides work out to the same thing. (Short for \"reflexivity\".)"],
    ["<code>decide</code>", "Asks Lean to simply work out whether a concrete statement is true."],
    ["Tactic", "One step-by-step instruction inside a proof. A proof written with tactics starts with <code>by</code>."],
    ["Goal", "What is left to prove at this moment. The Infoview shows it."],
    ["<code>intro</code>", "To prove \"if P then Q\", assume P and then prove Q."],
    ["<code>exact</code>", "\"This is exactly the proof needed.\""],
    ["<code>omega</code>", "Proves facts made of +, −, ≤ and &lt; over Nat and Int automatically."],
    ["<code>∀</code>", "\"For all\". <code>∀ n, …</code> means \"for every n, …\"."],
    ["<code>∧</code>", "\"And\". <code>p ∧ q</code> means p and q."],
    ["sorry", "A placeholder that stands in for a missing proof. Lean accepts it with a warning, but the theorem is <b>not</b> proved."]
  ],
  explain: `
<p>A <b>theorem</b> looks just like a definition: <code>theorem name : statement := proof</code>. A statement such as <code>2 + 2 = 4</code> is itself a type (a <b>Prop</b>, from Unit 1). A proof of it is a value of that type, just as <code>42</code> is a value of Nat. Lean checks a proof the same way it checks that <code>42</code> has type Nat. This idea is called <i>propositions as types</i>. <code>example</code> is a theorem without a name.</p>
<p><b>Proof terms you'll use first.</b> <code>rfl</code> proves <code>a = b</code> when both sides work out to the same value. Sometimes Lean can see that without being given numbers: <code>n + 0 = n</code> is true by <code>rfl</code> for any n, because adding 0 is defined to leave n alone. <code>by decide</code> asks Lean to just work out whether a concrete statement is true.</p>
<p><b>Tactic mode</b> starts with <code>by</code>. You give step-by-step instructions, and the Infoview shows the current <i>goal</i> (what is left to prove) after each step:</p>
<ul>
<li><code>intro h</code>: to prove "if P then Q", assume P (call that assumption <code>h</code>), then prove Q.</li>
<li><code>exact e</code>: "e is exactly the proof needed".</li>
<li><code>omega</code>: proves facts made of +, −, ≤ and &lt; over Nat and Int automatically.</li>
</ul>
<p><b>When it goes wrong,</b> Lean tells you precisely. A false claim proved with <code>decide</code> gives: <i>Tactic \`decide\` proved that the proposition 2 + 2 = 5 is false</i>. A proof left as <code>sorry</code> is accepted with a <b>warning</b>: <i>declaration uses \`sorry\`</i>. A theorem that uses <code>sorry</code> is <b>not</b> proved.</p>
<p>Three things in the worked example. The arrow <code>→</code> in a statement means "if … then …" (a different use from the function arrows of Unit 2). <code>(h : 0 &lt; n)</code> is an input too: the <i>assumption</i> that 0 &lt; n, named <code>h</code>. And <code>#check @double_pos</code> shows the whole statement of the theorem (the <code>@</code> just stops Lean hiding any inputs).</p>
<p><code>decide</code> can also be used as a function: <code>#eval decide (3 ≤ 2)</code> prints <code>false</code>. It turns a statement into a Bool.</p>
<p>This unit is more abstract than the earlier ones. Read the notes after the worked example line by line, and expect to read them more than once.</p>`,
  worked: { notes: [
    "No output for a theorem means Lean accepted the proof. Silence is success.",
    "<code>rfl</code> works because both sides work out to the same number. <code>by decide</code> asks Lean to just work out that 21000 × 30 really is 630000.",
    "<code>add_zero_example</code> holds for <b>every</b> n, not just ones we tested.",
    "<code>p ∧ q</code> is \"p and q\". <code>h.1</code> and <code>h.2</code> are its two halves, so we hand them back in swapped order.",
    "<code>omega</code> does the arithmetic automatically.",
    "The <code>#check</code> of <code>double_pos</code> reads: for every n, if 0 &lt; n then 0 &lt; 2n. <code>∀</code> means \"for all\"."
  ] },
  bridge: `<p>A <b>test</b> checks some inputs, and a <b>proof</b> covers all of them. A Solidity or Rust test suite might try 1,000 balances. The Lean theorem <code>double_pos</code> covers every natural number there is.</p>
<p>Every proof is checked by Lean's small <b>kernel</b> (see Unit 9), so you don't have to trust the person or the AI that wrote the proof, only the kernel. You still have to check that the theorem says what you care about.</p>`
},

u8: {
  hook: "Read a proof that a transfer never creates or destroys money, and never lets anyone spend more than they have, for every possible input.",
  goals: [
    "Say what a safety property (invariant) of a transfer means",
    "Read a proof one step at a time and say what each step does",
    "Understand the idea of induction (proving something for every list)",
    "Explain what the proof does and doesn't cover"
  ],
  summary: "This unit is for reading. For each step of a proof, ask what it does, not how you would have thought of it.",
  terms: [
    ["Invariant", "Something that must always be true, whatever happens."],
    ["Conservation", "Money is moved but never created or destroyed: the total stays the same."],
    ["Hypothesis", "A fact you are allowed to assume inside a proof."],
    ["<code>unfold</code>", "Replaces a name by its definition."],
    ["<code>split</code>", "Splits an if-then-else into two cases: the \"then\" case and the \"else\" case."],
    ["<code>simp</code>", "Simplifies using known facts."],
    ["<code>obtain ⟨h1, h2⟩ := h</code>", "Unpacks \"A and B\" into two separate facts."],
    ["<code>subst</code>", "Replaces a variable with what it equals."],
    ["<code>assumption</code>", "Finishes the goal when it is already one of your facts."],
    ["Induction", "To prove something for every list: prove it for the empty list, then prove that if it holds for a list it also holds for that list with one more item on the front."],
    ["Induction hypothesis", "The assumption, inside an induction proof, that the statement holds for the shorter list. Lean calls it <code>ih</code>."],
    ["Axiom", "A basic assumption of the logic that is built in."]
  ],
  explain: `
<p>This is where Units 1 to 7 pay off. We take <code>transfer</code> from Unit 6 (here with a fixed error text) and prove three <b>invariants</b>, things that must always be true. A fourth theorem, about lists, comes at the end.</p>
<ol>
<li><b>Conservation</b>: if a transfer succeeds, the two balances add up to the same total afterwards. Money is moved, never created or destroyed.</li>
<li><b>No overdraft</b>: if a transfer succeeds, the amount was at most the sender's balance.</li>
<li><b>Rejection</b>: if the amount is more than the balance, the result is always the error.</li>
</ol>
<p>You aren't asked to write these proofs yet. The notes after the worked example go through each one a line at a time.</p>
<p><b>The new steps (tactics):</b></p>
<ul>
<li><code>unfold transfer at h</code> replaces the name <code>transfer</code> by what it means.</li>
<li><code>split at h</code> splits the <code>if … then … else</code> into two cases. The <code>·</code> bullets handle one case at a time.</li>
<li><code>simp</code> simplifies using known facts.</li>
<li><code>obtain ⟨h1, h2⟩ := h</code> unpacks "A and B" into two facts.</li>
<li><code>subst</code> replaces a variable with what it equals.</li>
<li><code>assumption</code> finishes the goal when it is already one of your facts.</li>
</ul>
<p><b>Induction</b> (the last theorem). To prove something for <i>every</i> list, you prove it for <code>[]</code>, and then you prove that <i>if</i> it holds for the shorter list <code>rest</code> (the <b>induction hypothesis</b>, called <code>ih</code>) <i>then</i> it holds for <code>a :: rest</code>. It is like a row of dominoes: the first falls, and each one knocks over the next.</p>
<p><b>Know the limits.</b> These theorems are about <i>this Lean model</i>. They say nothing yet about a real Solidity contract or Solana program. Closing that gap is exactly what the real projects in Unit 9 work on.</p>`,
  worked: { notes: [
    "All four theorems are accepted, so the only output is the <code>#print axioms</code> line.",
    "<b>transfer_conserves</b>: the first bullet is the success case. We unpack the two new accounts, and then <code>omega</code> shows (s − a) + (d + a) = s + d. That is valid because a ≤ s is known in that case, so the subtraction can't hit the \"stops at zero\" trap.",
    "The second bullet is the failure case. There <code>h</code> claims an error equals a success, which is impossible, and <code>simp</code> closes it.",
    "<b>transfer_within_balance</b>: in the success case the fact <code>amount ≤ src.lamports</code> is already known, so <code>assumption</code> finishes it.",
    "<b>transfer_rejects_overdraft</b>: if the balance is smaller than the amount, the \"then\" branch can't happen, so the result is the error.",
    "<b>total_append</b>: proved by induction on the list. The total of two lists joined together is the total of the first plus the total of the second.",
    "<code>#print axioms</code> lists what the proof ultimately relies on. <code>propext</code> and <code>Quot.sound</code> are standard parts of Lean's logic. The important thing is that <code>sorryAx</code> doesn't appear, so nothing was skipped."
  ] },
  bridge: `<p class="muted">You don't need to know the technical terms in this list.</p>
<p>The same pattern (model the program, state an invariant, prove it) shows up in real projects. <b>Verity</b> describes itself as a formally verified smart contract compiler for Ethereum, written in Lean 4. <b>Blanc</b> includes a WETH port and a solvency proof. On Solana, the Solana Foundation's experimental <b>Solanalib</b> aims to be a shared Lean library of formal models for Solana programs.</p>
<p>Conservation of funds is the kind of property these projects care about.</p>`,
  practice: { task: "Paste the full Unit 8 file (Account, transfer, total and the four theorems) into the Lean Playground or VS Code. Then break one proof on purpose, for example by deleting <code>omega</code>, and read the unsolved goal that Lean shows." }
},

u9: {
  hook: "See how Lean itself is built, and where it is really used in Ethereum and Solana work today.",
  goals: [
    "Name the stages a Lean file goes through",
    "Explain why a small kernel matters for trust",
    "Name real Ethereum and Solana projects that use Lean, and what each does",
    "Avoid the \"Lean Ethereum\" naming trap"
  ],
  summary: "Lean checks every proof with a small, carefully written program called the kernel, so the part you have to trust is small. You still have to check that a theorem says what you care about. Real blockchain projects already use Lean.",
  terms: [
    ["Parser", "The first stage: turns your text into a structure Lean can work with."],
    ["Elaborator", "The stage that fills in hidden details, works out types and runs tactics."],
    ["Kernel", "A small program that re-checks every definition and proof. The part you must trust."],
    ["Compiler", "Turns definitions into fast code you can run."],
    ["Bootstrapped", "Written in the language it compiles: Lean is written in Lean."],
    ["Lake", "Lean's build tool and package manager. Rust's Cargo is the closest match."],
    ["Formal verification", "Proving with mathematics that a program meets a precise specification."],
    ["Soundness bug", "A bug that could let a false proof be accepted."]
  ],
  explain: `
<p>You don't need to memorise this. The aim is to see how Lean is built and where it is used. The first part comes from Lean's own public source code (the <code>leanprover/lean4</code> repository).</p>
<p><b>The stages a Lean file goes through:</b></p>
<ol>
<li><b>Parser</b> (<code>src/Lean/Parser</code>): turns your text into syntax.</li>
<li><b>Elaborator</b> (<code>src/Lean/Elab</code>): fills in hidden details, works out types and runs tactics. Every tactic you have used has a file in <code>src/Lean/Elab/Tactic</code>, including <code>Omega</code>, <code>Simp.lean</code>, <code>Induction.lean</code> and <code>Decide.lean</code>. The result is a core term (an <code>Expr</code>, which has just 12 kinds of node, such as <code>app</code>, <code>lam</code>, <code>forallE</code> and <code>const</code>).</li>
<li><b>Kernel</b> (<code>src/kernel</code>, written in C++): re-checks every definition and proof. It is far smaller than the rest of Lean: the <code>src/Lean</code> folder alone holds about 290,000 lines of Lean in version 4.36.0 (counted for this course), while an earlier reading of the kernel found about 8,000 lines of C++. Tactics can be clever and complicated, and none of that cleverness needs to be trusted, because the small kernel checks the final result.</li>
<li><b>Compiler</b>: turns definitions into fast code. Lean is <i>bootstrapped</i>: it is written in Lean, so the repository keeps pre-built C files (<code>stage0</code>) to compile the first copy of itself.</li>
</ol>
<p><b>Lake</b> (<code>src/lake</code>) is Lean's build tool and package manager, the counterpart of Rust's Cargo.</p>
<p><b>Trust has limits, and it is patched.</b> In 2026 researchers reported kernel soundness bugs that could make Lean accept a false proof (one was given CVE-2026-72844). The fixes shipped in Lean 4.32.2. Keep Lean updated, and be careful with Lake dependencies you don't trust.</p>`,
  worked: { notes: [
    "Nat is \"zero, or the successor (the next number) of a Nat\". So 3 is <code>succ (succ (succ zero))</code>.",
    "List is the <code>[]</code> and <code>::</code> pair you used in Unit 5, under its real names <code>nil</code> and <code>cons</code>.",
    "Equality itself (<code>Eq</code>, whose one constructor is <code>refl</code>) is defined in the same file. That is where <code>rfl</code> comes from."
  ] },
  bridge: `<p class="muted">You don't need the technical terms in this list. Take away that real teams use Lean on Ethereum and Solana, and what each project is for.</p>
<p><b>Where Lean is really used</b> (each item is linked under Sources):</p>
<ul>
<li><b>EVM semantics:</b> Nethermind built an executable formal model of the EVM and Yul in Lean, following the Yellow Paper and tested against the official Ethereum test suite for the Cancun fork, with an Ethereum Foundation grant (EVMYulLean). (The EVM is the machine that runs Ethereum contracts.)</li>
<li><b>Verified zkEVM:</b> the Ethereum Foundation's zkEVM formal verification project, described as a $20M initiative, funds Lean work such as ArkLib (verified arguments of knowledge).</li>
<li><b>Rust → Lean:</b> Aeneas and Hax translate Rust into Lean so it can be proved correct. Runtime Verification reported using them on production cryptographic Rust (Plonky3, RISC Zero) within that project, and Microsoft uses Aeneas for SymCrypt.</li>
<li><b>Solana:</b> the Solana Foundation's Solanalib (experimental) aims to be a shared Lean library of formal models for Solana programs, and qedsvm is a Lean model of the Solana VM that works on the compiled program.</li>
<li><b>Smart-contract languages:</b> Verity, a formally verified smart contract compiler for Ethereum in Lean 4.</li>
</ul>
<p><b>Naming trap:</b> "Lean Ethereum" is Justin Drake's 2025 roadmap vision for Ethereum's next decade (a rename of the "beam chain"). It is <b>not</b> about the Lean language. Don't mix them up in interviews or searches.</p>`
}

};

// ---- apply the beginner layer ----
(function () {
  const byId = {};
  UNITS.forEach(u => { byId[u.id] = u; });
  Object.keys(BEGINNER).forEach(id => {
    const u = byId[id], o = BEGINNER[id];
    if (!u) throw new Error("content-beginner.js: unknown unit " + id);
    Object.keys(o).forEach(k => {
      const v = o[k];
      if (v && typeof v === "object" && !Array.isArray(v)) Object.assign(u[k], v);
      else u[k] = v;
    });
  });
  UNITS.unshift(UNIT0);
})();


// "Explain it back" prompts. The student writes an answer first, then compares it with the model answer.
const SELFX = {
  u0: { q: "In your own words: why would anyone want a proof that a smart contract is correct, when they can already test it?",
        model: "A test only checks the inputs someone thought to try. A proof covers every possible input. When a contract handles real money, the one case nobody tried can be an expensive one." },
  u1: { q: "Explain why 5 - 7 gives 0 in Lean, and why that could be a problem for a bank balance.",
        model: "Both numbers are Nat, and a Nat can't be negative, so Lean stops at 0 instead of giving -2. It doesn't show an error. If a balance is a Nat, withdrawing more than you have would quietly leave 0 and nothing would warn you, so the program has to check the amount first." },
  u2: { q: "What is the difference between gasCost 21000 and gasCost 21000 30?",
        model: "gasCost 21000 gives only one of the two inputs, so you get back a function that is still waiting for the gas price (type Nat → Nat). gasCost 21000 30 gives both inputs, so you get the final number." },
  u3: { q: "Why is alice.lamports still 5000 after deposit alice 250?",
        model: "Lean values never change. deposit builds a new Account with the changed balance and leaves alice exactly as she was. The new account is what the function returns." },
  u4: { q: "Why did applyIx return 0 when 900 was withdrawn from 500, and how does safeWithdraw fix that?",
        model: "500 - 900 on Nat stops at 0, and nothing complained. safeWithdraw checks amount ≤ balance first and returns none when the withdrawal isn't allowed, so the failure is visible." },
  u5: { q: "Explain how total works, using the two cases for a list.",
        model: "If the list is empty the total is 0. Otherwise it is the first account's lamports plus the total of the rest. Each call is on a shorter list, so it must eventually reach the empty list and stop." },
  u6: { q: "Inside a do block, what does ← do when a step fails?",
        model: "It stops and returns that failure straight away, and the later steps don't run. If the step succeeds, it unpacks the result and carries on. It plays the same role as ? in Rust." },
  u7: { q: "Using double_pos as the example, what is the difference between a test and a proof?",
        model: "A test checks the inputs you choose. The theorem double_pos says that for every natural number n, if 0 < n then 0 < 2n, so it covers all of them, and Lean's kernel checks the proof." },
  u8: { q: "What does transfer_conserves say, and why does its proof need the fact that amount ≤ src.lamports?",
        model: "It says a successful transfer keeps the total of the two balances the same. In the success case, (s - a) + (d + a) = s + d only holds when a ≤ s. Without that, Nat subtraction would stop at 0 and the totals would differ." },
  u9: { q: "Why does Lean keep its kernel small?",
        model: "Every proof is re-checked by the kernel, so only the kernel has to be trusted. A small kernel is far easier to examine than all the tactics and other code around it, so a bug in a tactic can't produce a false theorem." }
};

// Why each wrong answer is tempting, for the questions where students most often go wrong.
// The list lines up with the options; null marks the correct one.
const OPT_WHY = {
  u1q1: ["That is what ordinary subtraction gives, but a Nat has no negatives.", null, "Lean doesn't complain here. That is exactly what makes it dangerous.", "That is 7 - 5. The numbers are the wrong way round."],
  u1q3: ["#check doesn't decide whether the statement is true. It only shows the type.", null, "A Bool is a value (true or false). A written statement like 3 ≤ 5 is a Prop.", "That would be the type of the value true. The question asks about the statement 3 ≤ 5."],
  u1q4: ["A Nat has no fractions. Division drops the remainder.", "Division doesn't round up. It drops the remainder.", null, "That is the remainder, which % gives. / gives how many whole times it fits."],
  u2q3: ["Nat is the type of the final answer, and you haven't got that yet.", null, "That is the type of gasCost before any input is given. One input is already supplied.", "Lean allows this. You get back a function that waits for the missing input."],
  u3q1: ["That would be true if deposit changed alice in place. It builds a new account instead.", null, "250 is the deposit amount, not alice's balance.", "Reading alice.lamports is perfectly valid."],
  u4q1: ["A Nat has no negatives, so it can't come out as -400.", null, "applyIx returns a Nat, not an Option. Only safeWithdraw can return none.", "Lean doesn't complain. That is the bug."],
  u4q2: ["safeWithdraw refuses the request. It doesn't fall back to 0.", "some 0 would mean the withdrawal worked and left nothing. Here 900 is more than 500.", null, "A Nat has no negatives, and a refused withdrawal gives none."],
  u5q1: ["The first case of total is written for the empty list.", null, "total returns a Nat, not an Option.", "The empty list has nothing to add up."],
  u6q1: ["There is no rounding down to 0. The if-check fails first, so the else branch runs.", null, "This is an Except, not an Option. The error carries a reason.", "A Nat can't be negative, and the transfer is refused anyway."],
  u7q1: ["Lean accepts the file. It only warns.", null, "sorry proves nothing. It is a placeholder.", "Nothing is deleted."],
  u8q5: ["The proofs are about the model, not the deployed program.", null, "Which blockchain it runs on doesn't change this. The proofs are about the model.", "Tests aren't part of these proofs."]
};

// Second pass, from a review of the course as a beginner would meet it.
(function () {
  const U = id => UNITS.find(u => u.id === id);
  const Q = id => { for (const u of UNITS) { const q = u.quiz.find(x => x.id === id) || (u.challenge.id === id ? u.challenge : null); if (q) return q; } throw new Error("no question " + id); };

  // Code that later units build on. Shown above the worked example so it can be pasted first.
  const ACCOUNT = "structure Account where\n  owner    : String\n  lamports : Nat\nderiving Repr";
  const TOTAL = "def total : List Account → Nat\n  | []        => 0\n  | a :: rest => a.lamports + total rest";
  const TRANSFER = "def transfer (src dst : Account) (amount : Nat) : Except String (Account × Account) :=\n  if amount ≤ src.lamports then\n    .ok ({ src with lamports := src.lamports - amount },\n         { dst with lamports := dst.lamports + amount })\n  else\n    .error \"insufficient funds\"";
  U("u5").prelude = ACCOUNT;
  U("u6").prelude = ACCOUNT;
  U("u8").prelude = ACCOUNT + "\n\n" + TOTAL + "\n\n" + TRANSFER;

  U("u8").worked.notes = [
    "Before the proofs: <code>Account</code>, <code>total</code> and <code>transfer</code> come from earlier units and are in the \"Paste this first\" box. In this version <code>transfer</code> gives the fixed error text <code>\"insufficient funds\"</code>.",
    "All four theorems are accepted, so the only output is the <code>#print axioms</code> line.",
    "<b>transfer_conserves</b> says: if <code>transfer src dst amount</code> succeeds and gives the new accounts <code>src'</code> and <code>dst'</code>, their balances add up to what the old ones did. To keep the numbers short, write <i>s</i> for <code>src.lamports</code>, <i>d</i> for <code>dst.lamports</code> and <i>a</i> for <code>amount</code>.",
    "<code>unfold transfer at h</code>: <code>h</code> is the assumption that the transfer succeeded. This replaces the word <code>transfer</code> inside <code>h</code> with its definition, the if-then-else.",
    "<code>split at h</code> makes two cases: one where <i>a ≤ s</i> is true (the \"then\" branch) and one where it is false. The two <code>·</code> bullets deal with them in turn.",
    "First case. <code>simp at h</code> tidies <code>h</code>, which now says the pair of updated accounts is the pair <code>(src', dst')</code>. <code>obtain ⟨h1, h2⟩ := h</code> splits that into one fact for each account. <code>subst h1; subst h2</code> swaps <code>src'</code> and <code>dst'</code> for what they equal. <code>simp</code> then turns the goal into (s − a) + (d + a) = s + d, and <code>omega</code> proves it using the fact <i>a ≤ s</i> from this case. Without that fact the subtraction could stop at 0 and the two sides would differ.",
    "Second case. Here <code>h</code> would say an error equals a success, which can't be true, so <code>simp at h</code> closes the case.",
    "<b>transfer_within_balance</b> says a successful transfer means <code>amount ≤ src.lamports</code>. In the first case that is already known, because it is the if-condition, so <code>assumption</code> finishes it. The second case is impossible, as before.",
    "<b>transfer_rejects_overdraft</b>: if the balance is smaller than the amount, the transfer gives the error. After <code>unfold transfer</code>, <code>simp</code> reduces the goal to a plain statement about the numbers, and <code>omega</code> proves it from <code>h</code>.",
    "<b>total_append</b> says the total of two lists joined with <code>++</code> is the total of the first plus the total of the second. <code>induction xs with</code> makes two cases. In <code>| nil</code>, <code>xs</code> is empty and <code>simp [total]</code> works it out from the definition of <code>total</code>. In <code>| cons a rest ih</code>, <code>xs</code> is <code>a :: rest</code> and <code>ih</code> is the claim for the shorter list <code>rest</code>. <code>simp [total, ih]</code> uses the definition and <code>ih</code>, and <code>omega</code> does the last bit of arithmetic.",
    "<code>#print axioms</code> lists what the proof ultimately relies on. <code>propext</code> and <code>Quot.sound</code> are standard parts of Lean's logic. What matters is that <code>sorryAx</code> doesn't appear, so nothing was skipped."
  ];
  U("u8").practice = {
    task: "Paste the \"Paste this first\" code and then the worked example into the Lean Playground or VS Code. Then break one proof on purpose: in <code>transfer_conserves</code>, delete the <code>omega</code> at the end of the first bullet, and read the unsolved goal Lean shows.",
    expected: "With everything intact, only the #print axioms line. With that omega deleted, an \"unsolved goals\" error showing src.lamports - amount + (dst.lamports + amount) = src.lamports + dst.lamports, and #print axioms then lists sorryAx."
  };
  U("u7").faded.prompt = "Pick the tactic that finishes this proof automatically. It is arithmetic with a subtraction and a ≤ on Nat.";
  U("u9").faded.why = "The kernel re-checks every proof. It is small, which keeps the part you have to trust manageable.";

  // Questions rewritten so they test what the units teach.
  Object.assign(Q("u0q2"), { q: "Which of these is the smallest piece of ether?", options: ["wei", "SOL", "lamport", "dollar"], a: 0, why: "Wei is the smallest piece: 1 ether = 10^18 wei. A lamport is the small unit of Solana's coin, SOL." });
  Object.assign(Q("u3q2"), { options: ["alice[owner]", "alice.owner", "owner(alice)", "alice->owner"] });
  Object.assign(Q("u3q3"), { options: ["It makes the structure faster", "It lets Lean print values of the structure", "It proves the fields are correct", "It makes fields changeable"], a: 1, why: "Repr is how Lean turns a value into text it can print. Without it, some ways of printing fail." });
  Object.assign(Q("u4q5"), { tag: "constructors", q: "Inside a pattern match, what is <code>n</code> in the line <code>| .deposit n => …</code>?", options: ["A name for the amount that came with the deposit", "The number of deposits so far", "A type", "An error message"], a: 0, why: "A deposit carries an amount. Writing <code>.deposit n</code> gives that amount the name n, so the rest of the line can use it." });
  Object.assign(Q("u5q4"), { options: ["Lean never checks recursion", "Each recursive call is on a shorter list, so it must finish", "Because the function returns a Nat", "Because the list has three items"], a: 1 });
  Object.assign(Q("u6q3"), { tag: "except-vs-option", q: "What is the difference between <code>Option</code> and <code>Except</code>?", options: ["Except can carry a reason for the failure, while Option only says there is no answer", "Option can carry a reason for the failure, while Except cannot", "They are exactly the same", "Except only works with text"], a: 0, why: "<code>none</code> says there is no answer and nothing more. <code>.error</code> comes with a reason, such as the text \"insufficient funds\"." });
  Object.assign(Q("u6q4"), { options: ["Because Lean needs two return values for every function", "Because a transfer changes two accounts, so it returns both updated accounts", "Because × multiplies the two balances", "To store the error message"], a: 1 });
  Object.assign(Q("u7q2"), { options: ["rfl", "intro h", "exact h", "assumption"], a: 0, why: "Both sides work out to 4, so rfl proves it. decide or omega would work too. The others need an assumption, and there isn't one here." });
  Object.assign(Q("u7c1"), { why: "omega handles sums, differences and multiplying by a fixed number. In <code>n * n</code> two unknowns are multiplied, so omega can't do it (and that claim is false at n = 0 anyway). Strings are outside what omega handles." });
  Object.assign(Q("u8q1"), { options: ["A transfer always succeeds, whatever the amount", "After a successful transfer, the sum of the two balances is unchanged", "The sender's balance always goes up", "Both accounts end with the same balance"], a: 1, why: "Funds are moved and never created or destroyed." });
  Object.assign(Q("u8q5"), { options: ["Yes, fully", "No, they prove facts about this Lean model. Connecting a model to real deployed code is separate work", "Yes, but only for Solana", "Only if the tests also pass"], a: 1, why: "A proof is only as good as how faithfully the model matches the real code. That's why real projects spend effort modelling the actual EVM and the Solana virtual machine." });
  Object.assign(Q("u8c1"), { q: "In the success case of <code>transfer_conserves</code>, which fact does <code>omega</code> need?", options: ["dst.lamports > 0", "amount ≤ src.lamports (from the if condition)", "src.lamports = dst.lamports", "None. omega needs no facts"], a: 1, why: "Without amount ≤ src.lamports, (s − a) + (d + a) could differ from s + d, because Nat subtraction stops at 0. split puts the if condition into this case as a known fact." });
  Object.assign(Q("u9q4"), { tag: "lake", q: "What is Lake?", options: ["Lean's build tool and package manager", "Lean's kernel", "A tactic that proves arithmetic", "A Solana program"], a: 0, why: "Lake builds Lean projects and manages the libraries they depend on." });
  Object.assign(Q("u9q5"), { tag: "stages", q: "Which part of Lean runs a tactic such as <code>omega</code>?", options: ["The kernel", "The elaborator. The kernel only checks the finished proof", "The compiler", "Lake"], a: 1, why: "Tactics run in the elaborator. The kernel then re-checks the finished proof, which is why a bug in a tactic can't produce a false theorem." });
  Object.assign(Q("u9c1"), { options: ["Write more tests", "Use a Lean version with the fix (4.32.2 or later) and avoid untrusted dependencies", "Use only Nat in the theorem", "Make the theorem statement shorter"], a: 1 });
})();

UNITS.forEach(u => {
  u.selfx = SELFX[u.id];
  u.quiz.forEach(q => { if (OPT_WHY[q.id]) q.optWhy = OPT_WHY[q.id]; });
});

// Short "what to do now" help shown at the top of every step in a unit.
const STEP_HELP = {
  goals: "<b>What to do:</b> read the list. You aren't expected to know any of it yet. It's a map of where this unit goes. Then press Next.",
  explain: "<b>What to do:</b> read through, and press \"I've read this\" at the end. A new word? Look in Words to know on the Goals step, or in the Glossary.",
  worked: "<b>What to do:</b> read the code and type what you think Lean will print, one line per answer. Then press Reveal and compare. Finally, explain the idea back in your own words.",
  bridge: "<b>What to do:</b> skim this. It shows the same idea in Solidity (Ethereum) or Rust (Solana). You don't need either language, and you won't be tested on the details.",
  faded: "<b>What to do:</b> the code has one blank. Pick the option that fills it and press Check. You can try again if you miss.",
  quiz: "<b>What to do:</b> answer one question at a time, and say how sure you are before you check. Some answers you type. You need 80% to unlock the next unit. If you miss, you'll see what to go back over and can retake with new questions.",
  practice: "<b>What to do:</b> try the code yourself. The easiest way is the Lean Playground (the Start here page shows how). Tick the box when you're done."
};

// Extra sources used by the beginner layer (both are linked from lean-lang.org/learn).
SOURCES.push(
  ["The Natural Number Game (Lean's recommendation for beginners)", "https://adam.math.hhu.de/#/g/leanprover-community/NNG4"],
  ["Lean Playground: run Lean in your browser", "https://live.lean-lang.org/"]
);
