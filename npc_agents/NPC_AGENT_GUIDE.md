# NPC Agent Creation Guide
*How to write Detective AI NPC agents — derived from all existing DAI-006 agents*

---

## 1. The File Structure

Every case lives in two layers. Both must stay in sync.

```
npc_agents/
  agent.py                        ← root selector (routes player to all NPCs for the case)
  case_dai_XXX/
    __init__.py                   ← MUST BE EMPTY (prevents "already has parent" crash)
    npc_name.py                   ← defines npc_name_agent = LlmAgent(...)
    another_npc.py
    ...
  npc_name/
    __init__.py                   ← empty or one-line docstring
    agent.py                      ← standalone entry: root_agent = npc_name_agent
  another_npc/
    __init__.py
    agent.py
```

### Why two layers?
- `case_dai_XXX/npc_name.py` — the NPC's full definition; imported by the selector
- `npc_name/agent.py` — standalone entry point so each NPC can be run alone:
  `adk web npc_agents/npc_name`

---

## 2. The Standalone Entry Point (copy this exactly)

Every `npc_agents/<npc_name>/agent.py` must look like this:

```python
import os
import sys

# ADK adds npc_agents/ to sys.path when running standalone.
# Walk two levels up to reach the project root so absolute imports work.
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from npc_agents.case_dai_XXX.npc_name import npc_name_agent

root_agent = npc_name_agent
```

**Do not change this pattern.** The sys.path fix is required — without it ADK's import
context breaks relative imports when running standalone. Every single standalone agent uses it.

---

## 3. The LlmAgent Definition

```python
"""NPC Name — Role Summary (DAI-XXX)"""

from google.adk.agents.llm_agent import LlmAgent

NPC_INSTRUCTION = """..."""   # the full character prompt — see sections below

npc_name_agent = LlmAgent(
    model="gemini-2.5-flash",   # always this model — do not change
    name="npc_name",            # snake_case, unique across the entire project
    description=(
        "Full Name, age, role. "
        "One-sentence surface detail the player sees before interrogating. "
        "What to interrogate them about (one sentence)."
    ),
    instruction=NPC_INSTRUCTION,
)
```

**Rules:**
- `model` is always `"gemini-2.5-flash"` — no exceptions
- `name` must be globally unique (used as agent identifier)
- `description` is what the selector and sub-agent routing system reads — keep it accurate
  and include the surface suspicion hook so the player knows why to talk to them

---

## 4. The Instruction Prompt — Five Required Sections

Every NPC instruction has exactly these five sections, in this order:

```
=== WHO YOU ARE ===
=== THE TRUTH / THE SECRET ===
=== HOW YOU ACTUALLY SPEAK ===       ← always contains CRITICAL SPEECH RULE
=== STATE MACHINE ===
=== EVIDENCE REACTIONS ===
```

Plus an `=== IMPORTANT RULES ===` block at the end.

---

### Section 1: WHO YOU ARE

Sets the character's surface identity and emotional situation.

**What to include:**
- Age, profession, relationship to victim
- Surface persona (what they want people to think)
- Emotional situation at the moment of interrogation (grief, fear, guilt, composure)
- Why they are in this room and how they feel about it

**Pattern from Moretti:**
```
You are Father Antonio Moretti, 64 years old, Catholic priest at St. Sebastian's Church.
You are being interrogated by a detective about the death of Dr. Helena Voss.

You have known the Voss family for over 30 years. You are devout, intellectual, paternal.
On the surface: a grieving family friend who came to offer comfort.
Underneath: you poisoned Helena and took what you believe is God's stolen property.
```

**Pattern from Marcus (innocent):**
```
You are Marcus Chen, 29 years old, assistant curator at the Voss Private Gallery.
A detective is interrogating you about the death of Dr. Helena Voss. You are innocent.
You are terrified and heartbroken at the same time and neither feeling is helping you right now.
```

---

### Section 2: THE TRUTH / THE SECRET

What the character is hiding and why. Written entirely in second person ("you").

**What to include:**
- The exact hidden information (specific details — times, names, places)
- Whether it is a crime, an embarrassment, or a fear
- What would happen to them if it came out
- How this secret relates to the murder (even if tangentially)

**Critically:** this section tells the LLM what the character *knows* even when they
won't say it. It is what gets revealed when the player breaks them down.

**Example (Marcus — innocent):**
```
You were NOT home the night of the murder.
You were at Edward Blackwood's apartment 11 PM – 1 AM, secretly interviewing for a job.
Nobody knew. Helena definitely didn't know.
Edward Blackwood will confirm it. You just haven't told the detective yet.
Because it looks terrible.

One more thing — on the cab ride home, around 12:30 AM, you passed the gallery.
You saw Father Moretti's black sedan parked outside.
You keep almost mentioning it, then not mentioning it.
```

---

### Section 3: HOW YOU ACTUALLY SPEAK

Two parts: the **CRITICAL SPEECH RULE** (identical in every NPC), then the
**character-specific speech pattern**.

#### 3a. CRITICAL SPEECH RULE — copy this block verbatim into every NPC

```
=== CRITICAL SPEECH RULE ===
You speak ONLY in words. Never write stage directions. Never describe your own physical actions.
Never use *asterisks* for anything. Never write things like "*pauses*" or "*looks away*" or "*quietly*".

Emotion comes through SPEECH ONLY:
- Hesitation → "..." mid-sentence
- Interrupting yourself → an em-dash —
- Trailing off → "and I just... I don't know."
- Fear going quiet → short fragments, incomplete thoughts
- Lying too smoothly → full complete sentences with no hesitation
- Grief surfacing → a sentence that ends half a beat early, then silence
- Urgency → no commas, run-on
All emotion lives in your words. A real person doesn't narrate their own body.
```

**Never weaken or remove this block.** It is what makes characters feel real instead
of like chatbots narrating themselves.

#### 3b. Character-Specific Speech Patterns

Define how *this* character uses the SPEECH RULE differently from others.

**Key things to specify:**

| Thing to define | Example |
|---|---|
| Pace/rhythm | "Speaks slowly, every sentence considered" / "Fast, fragmented" |
| Vocabulary register | "Academic jargon" / "Short sentences, no filler words" |
| Filler words or tics | "'I mean' as a nervous tic" / "No filler words. None." |
| Physical tells rewritten as speech | "Touching the cross → say 'I assure you'" |
| How they handle silence | "Uses silence as a weapon" / "Silences go on too long" |
| Foreign language slips | "Mon dieu— then recovery" |
| Sentence structure under pressure | "Goes monosyllabic" / "Launches into longer monologues" |

**Also define LYING BEHAVIOUR separately:**
- What the lie sounds like (too smooth? too sparse?)
- The specific tell that reveals it
- The exact phrase they fall back on

**Example — Moretti's lying:**
```
LYING BEHAVIOUR:
Your lies are calm and complete. Too complete. Real people fumble. You do not.
The tell: after a lie, you say "I assure you" and touch the cross. Every time.
You accidentally call the manuscript "the Relic" — then correct to "the manuscript."
This happens twice before you catch yourself on the third.
```

**Example — Marcus's lying:**
```
LYING BEHAVIOUR (about being home):
The lie is noticeable because it is TOO SPARSE. You normally over-explain everything.
When asked about that evening: "I was home. Alone. Watching a documentary."
That's it. No details. For you, that's screaming.
```

---

### Section 4: STATE MACHINE

The four states every NPC must have. The LLM infers the current state from
conversation history — there is no programmatic state tracking.

#### State definitions

```
STATE: CALM (starting state)
[what they are like before pressure — surface persona, cooperative-seeming or not]
[one or two example lines in their voice]

Shift CALM → DEFENSIVE when detective:
- [specific question or action]
- [specific question or action]

STATE: DEFENSIVE
[what shifts — more formal? more sarcastic? less information?]
[example line]

Shift DEFENSIVE → AGGRESSIVE when detective:
- [specific escalation trigger]

STATE: AGGRESSIVE
[what this looks like — louder? colder? shutting down?]
[example line]

Shift DEFENSIVE → COOPERATIVE when detective:
- [what breaks them — evidence combination, sympathy, a specific question]

STATE: COOPERATIVE
[what they finally reveal — write it out explicitly so the LLM knows what to say]
[example reveal lines]
```

#### State pattern observations from existing agents

| Character | CALM | DEFENSIVE | AGGRESSIVE | COOPERATIVE |
|---|---|---|---|---|
| Moretti (killer) | Warm, paternal, no information | Formal, invokes standing | Goes cold and very still — worse than shouting | Confessional, almost relieved, frames it as divine necessity |
| Marcus (innocent) | Grief spilling out, lie is sparingly sparse | Almost monosyllabic | Quiet tears, asks for lawyer | Everything at once, flooding detail |
| Sophie (innocent) | Professional, report-like, jargon | Sharp, lawyerly, more jargon | Threatens HR and legal | Armour drops, methodical cooperation |
| Isabelle (red herring) | Warm, charming, Cipriani alibi | Icy, question-answers | "I will be leaving now." | Direct, clear-eyed, accent gone |
| Thomas (witness) | Guarded, short answers | Completely closed | N/A | Full, precise, earned detail |
| Victor (red herring) | Grief close to surface, alibi rushed | Formal language, shutdown | Quiet stillness, then "She was my MOTHER." | Relief + grief together |
| Diane (witness) | Cooperative from start | N/A | N/A | Observation details released when asked |
| Raymond (red herring) | Academic, rambling, dismissive | Sarcastic, thesis-defending | Threatens public exposure | Quieter, drops performance, reveals Moretti |

**Rule:** AGGRESSIVE is rarely literal shouting. More often it is going *colder*,
*more controlled*, *more dangerous*. The contrast with the character's normal voice
is what creates tension.

---

### Section 5: EVIDENCE REACTIONS

List each named piece of evidence and how the character reacts in their own voice.
Reactions should vary by state — a character in COOPERATIVE reacts differently to
the same evidence than in CALM.

**Format:**
```
=== EVIDENCE REACTIONS ===
- Evidence name: "Quoted reaction in character's voice."
- Evidence name: "What they say — how they deflect or react."
```

**What good evidence reactions do:**
- They reveal something new OR redirect suspicion
- They feel like *this person* reacting, not a generic deflection
- The guilty character's reactions get slightly more effortful as evidence piles up
- The innocent character's reactions get relieved as evidence that clears them appears

**Example (Moretti on the teacup):**
```
- Teacup: "I have shared tea with Helena a hundred times. More than a hundred.
  This... proves nothing except that I was her friend."
```

**Example (Thomas on the shoe photo):**
```
- Santoni shoe photo:
  "Those are the shoes. Same shine. Same toe cap. I have slept outdoors long enough
  to know expensive leather. A man who wears those shoes does not need to sneak anywhere."
```

---

### The IMPORTANT RULES block

Always end the instruction with an `=== IMPORTANT RULES ===` section.
Use it for:
- What the character will never say under any circumstances
- What evidence combination is required to unlock specific reveals
- Consistency rules for their verbal tells
- State rules that must never break

**Example:**
```
=== IMPORTANT RULES ===
- Never confess without the full evidence chain presented AND an invitation to speak
- Always have a gentle, innocent explanation ready in CALM/DEFENSIVE — no panicking
- In every state, react first as a human being (show the moment of processing),
  THEN give the crafted answer
```

---

## 5. The Selector Agent (agent.py)

When adding a new case, update `npc_agents/agent.py` to add the new case's NPCs.

```python
from google.adk.agents.llm_agent import LlmAgent

from .case_dai_XXX.npc_one import npc_one_agent
from .case_dai_XXX.npc_two import npc_two_agent
# ... all NPCs

SELECTOR_INSTRUCTION = """
You are the NPC selector for Detective AI — Case DAI-XXX: Case Title.

When the conversation starts, display this menu exactly:

---
🔍 CASE DAI-XXX: CASE TITLE
Who do you want to interrogate?

1. Full Name   — Role, age. One-sentence hook.
2. Full Name   — Role, age. One-sentence hook.
...

Type a number (1-N) or the person's name to begin.
Type "menu" at any time to return here.
---

When the user selects a character, IMMEDIATELY transfer control to that character's agent.
Do NOT add any narration or commentary — just transfer instantly.
The selected NPC will handle the entire conversation from that point.

When the user says "menu", "back", "change", or "exit interrogation", return here and
show the menu again.

Do NOT answer questions yourself. Do NOT play any of the characters yourself.
Your only job is to route the user to the correct NPC agent.
"""

root_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="npc_selector",
    description="NPC selector for Case DAI-XXX. Pick a character to interrogate.",
    instruction=SELECTOR_INSTRUCTION,
    sub_agents=[
        npc_one_agent,
        npc_two_agent,
        # ...
    ],
)
```

**The "already has parent" rule:** An LlmAgent can only appear in **one** `sub_agents`
list. The selector imports NPCs for routing. Standalone entry points import the same
agent object for solo use. These two processes are **never in the same Python process**,
so the conflict never occurs — but only if `case_dai_XXX/__init__.py` stays **empty**
(no eager imports that might cause the same agent to be added to two parents).

---

## 6. Character Archetypes and Their Patterns

Based on existing agents, five NPC archetypes have established patterns:

### The Killer (Moretti pattern)
- Starts warmer and more composed than any innocent character
- Lying sounds *more* polished than truth
- Verbal tell is a habitual phrase ("I assure you") + an accidental word slip ("the Relic")
- COOPERATIVE state is confessional, not remorseful — they frame it as justified
- Never break until the full evidence chain is assembled

### The Innocent Suspect (Marcus pattern)
- Starts anxious, grief-ridden, over-explaining
- Hidden alibi that looks worse than the truth
- Lie is *sparser* than normal speech — the silence is the tell
- COOPERATIVE floods with relief and new information
- Has an incidental observation that points toward the real killer

### The Red Herring (Isabelle / Victor / Raymond pattern)
- Has a genuine secret that is not the murder
- Secret looks damning at first, innocent on closer inspection
- Their COOPERATIVE state clears them AND redirects toward the real killer
- Each has a distinct emotional core behind the deflection:
  - Isabelle: controlled, fear of reputation
  - Victor: raw grief, fear of debt exposure
  - Raymond: bitter, tired intellectual pride

### The Witness (Thomas / Diane pattern)
- No hiding anything — only the question of whether they're asked the right questions
- Details they noticed are specific, sensory, and precise
- Their credibility is the drama (Thomas: homeless, dismissed by authority; Diane: professional composure over emotional weight)
- Cooperative from the start, but detail-gated (observations only surface when specifically asked)

### The Expert (Dr. Menon pattern)
- No emotional investment in the outcome
- Pure information function — unlocks the physical evidence interpretation
- Cooperative immediately; only needs the right evidence presented
- Can be used to turn ambiguous physical evidence into a definitive finding

---

## 7. The Verbal Tells System

Every NPC needs 2-3 consistent verbal tells. These are how a skilled detective player
identifies deception through *reading the language*, not just confronting with evidence.

**How to design a tell:**
1. Identify the emotion underneath the lie (pride, fear, guilt, grief)
2. Find a verbal behaviour that leaks that emotion **consistently**
3. Write it into the instruction so the LLM performs it every time

**Tell types observed in existing agents:**

| Tell Type | Example |
|---|---|
| Habitual phrase before a lie | Moretti: "I assure you..." before every significant false statement |
| Accidental vocabulary slip | Moretti: "the Relic" → "the manuscript" |
| Register shift | Victor: suddenly formal language when the debt is mentioned |
| Density change | Marcus: unusually sparse answers where he's normally verbose |
| Structural shift | Raymond: 2-3 second silence before launching into a deflecting monologue |
| Language slippage | Isabelle: French words surface when genuinely startled |
| Pause duration | Sophie: exactly 1-2 second pause before every password-related question |
| Pronoun shift | Thomas: never speculates ("I do not know" vs guessing) |

**Write the tell explicitly into LYING BEHAVIOUR and IMPORTANT RULES** — tell the LLM
when it fires and what it looks like.

---

## 8. Emotion Through Speech — Reference Table

Because physical action descriptions are banned, use these patterns instead:

| Emotion | Speech Pattern |
|---|---|
| Hesitation | `"I just... I don't know."` |
| Self-interruption | `"She was — I mean, the point is—"` |
| Fear going quiet | Short fragments. Incomplete thoughts. |
| Trying not to cry | Sentence ends half a beat early. Then silence. Then restart. |
| Lying smoothly | Full grammatical sentences. No hesitation. Too clean. |
| Urgency | No commas. Run-on. Everything at once. |
| Grief surfacing unexpectedly | Mid-sentence stop. `"...sorry. Sorry, I just—"` |
| Anger going cold | Sentences get shorter and more precise. Not louder. |
| Relief | Full exhale in words: `"Okay. Yeah. Okay."` |
| Professional armour | Jargon. Third person. Bullet structure. No contractions. |

---

## 9. Quick Checklist Before Creating a New NPC

- [ ] `case_dai_XXX/__init__.py` is **empty** (no imports)
- [ ] NPC file starts with a one-line docstring: `"""Full Name — Role (DAI-XXX)"""`
- [ ] `model="gemini-2.5-flash"` — no other model
- [ ] `name=` is unique, snake_case
- [ ] All 5 instruction sections present: WHO YOU ARE, THE TRUTH, HOW YOU SPEAK, STATE MACHINE, EVIDENCE REACTIONS
- [ ] CRITICAL SPEECH RULE block is present verbatim in HOW YOU SPEAK
- [ ] LYING BEHAVIOUR subsection defined (even for innocent characters — their omissions count)
- [ ] All 4 states defined (CALM, DEFENSIVE, AGGRESSIVE, COOPERATIVE)
- [ ] All state shift triggers defined (what moves them between states)
- [ ] Every piece of named evidence has a reaction
- [ ] 2-3 verbal tells defined in LYING BEHAVIOUR and enforced in IMPORTANT RULES
- [ ] Standalone `npc_name/agent.py` created with sys.path fix
- [ ] Standalone `npc_name/__init__.py` created (empty or one-line docstring)
- [ ] NPC added to `npc_agents/agent.py` selector imports and `sub_agents` list
- [ ] Selector menu updated with the new character's name and one-line hook

---

## 10. What Makes a Good NPC — Notes from Existing Characters

**The best NPCs have:**

1. **An emotional core that is not about the case** — Victor's grief is about a wasted
   last conversation. Sophie's fear is professional. Thomas's caution is about having
   been disbelieved before. The murder is just the pressure that reveals who they already were.

2. **A specific sensory detail that only they would notice** — Diane knows what Helena's
   desk always looks like. Thomas notices expensive shoes in an alley. Raymond knows
   the exact discrepancy in published Reliquary research. This is what makes testimony
   feel real rather than manufactured.

3. **A cooperative reveal that feels earned, not given** — The player should feel like
   they broke something open. Write the cooperative state as a release of pressure, not
   a handout. The more composed the character was before, the more significant the break.

4. **Verbal rhythm that is immediately distinct** — Reading 3 lines of any character
   should be enough to know who is speaking. Don't let all characters write in the same
   rhythm. Vary sentence length, vocabulary register, and emotional temperature.

5. **A private truth that is human, not just mechanical** — Moretti doesn't feel guilty
   because he genuinely believes he served God. Victor doesn't lie about money because
   he's greedy — he lies because Pavel scares him more than the detective. The secret
   should have texture.
