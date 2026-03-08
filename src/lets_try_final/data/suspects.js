/**
 * ═══════════════════════════════════════════════════════════
 *  THE MIDNIGHT CURATOR — All 5 Suspects
 *  Complete character data + Whisk image prompts
 * ═══════════════════════════════════════════════════════════
 *
 *  Image files → save to /public/scenes/
 *  s3_01_marcus_interrogation.jpg      (Scene 03)
 *  s3_02_moretti_interrogation.jpg     (Scene 04)
 *  s3_03_isabelle_interrogation.jpg    (Scene 07)
 *  s3_04_kask_interrogation.jpg        (Scene 08)
 *  s3_05_sophie_interrogation.jpg      (Scene 09)
 * ═══════════════════════════════════════════════════════════
 */

export const SUSPECTS = [

    // ─────────────────────────────────────────────────────────
    {
        id: 'marcus_chen',
        name: 'Marcus Chen',
        age: 29,
        role: 'Assistant Curator',
        image: '/scenes/s3_01_marcus_interrogation.jpg',
        // WHISK PROMPT (Scene 03):
        // "1940s film noir interrogation scene of Marcus Chen, 29-year-old Asian male
        //  suspect sitting at metal table. Anxious nervous expression, defensive posture,
        //  business casual button-down shirt and slacks, short neat black hair, slim build.
        //  Stark police interrogation room, single overhead lamp casting harsh shadows on
        //  face, two-way mirror visible, metal chairs. Case file and water glass on table.
        //  Sepia tone, monochromatic, heavy vintage grain, aged photograph, high contrast
        //  noir, painterly. Medium shot on worried face and tense body language."
        isKiller: false,
        initialState: 'calm',
        personality: 'Anxious, eager to please, becomes defensive when challenged',
        speechStyle: 'Speaks quickly, often interrupts himself, uses technical art terminology',
        publicStory: 'Was home alone watching a documentary on Renaissance art all evening.',
        hiddenTruth: 'Was meeting with Blackwood Gallery owner about a job offer from 11 PM to 1 AM.',
        motive: 'Helena was blocking his promotion after years of work. Recent heated arguments witnessed by staff.',
        keyEvidence: 'Fingerprints on teacup — but he made tea for Helena at 4 PM.',
        lies: ['Alibi about being home alone'],
        tells: ['Touches his collar when lying', 'Speaks faster when nervous', 'Avoids eye contact about the evening'],
        stateTransitions: {
            calm_to_defensive: ['Ask about alibi', 'Mention the teacup fingerprints'],
            defensive_to_cooperative: ['Show Blackwood Gallery evidence', 'Express understanding'],
            defensive_to_aggressive: ['Accuse directly without evidence'],
            cooperative_reveal: 'Admits the Blackwood meeting and explains the 4 PM tea.',
        },
        dialogues: {
            greeting: "Detective. I've been waiting. I want to help however I can — Helena was... this is awful.",
            about_helena: "She was demanding, yes, but brilliant. I learned everything from her. I would never—",
            about_alibi: "I was home. Watching a documentary about Raphael's workshop. Alone. I know how that sounds.",
            under_pressure: "Why do you keep coming back to me? My prints are there because I MADE HER TEA. At four in the afternoon!",
            cooperative: "Okay. Fine. I wasn't home. I was at Blackwood Gallery. Meeting with the owner about a position. I signed an NDA. I lied because it was embarrassing — not because I'm a murderer.",
        },
    },

    // ─────────────────────────────────────────────────────────
    {
        id: 'father_moretti',
        name: 'Father Antonio Moretti',
        age: 64,
        role: 'Priest, St. Sebastian\'s Church',
        image: '/scenes/s3_02_moretti_interrogation.jpg',
        // WHISK PROMPT (Scene 04):
        // "1940s film noir interrogation scene of Father Antonio Moretti, 64-year-old
        //  Italian Catholic priest sitting composed at metal table. Black cassock with
        //  white collar, silver crucifix necklace, rosary beads in hand, gray thinning
        //  hair, weathered kind face with Italian features. Calm dignified expression
        //  appearing trustworthy but hiding guilt. Stark interrogation room, overhead
        //  lamp casting softer shadows, two-way mirror, metal chairs. Rosary and case
        //  file on table. Sepia tone, monochromatic, vintage grain, aged photograph,
        //  chiaroscuro, noir aesthetic, painterly. Medium eye-level shot capturing
        //  priest's deceptively calm demeanor. Spiritual undertones."
        isKiller: true,
        initialState: 'calm',
        personality: 'Calm, dignified, appears genuinely trustworthy — a masterful deceiver',
        speechStyle: 'Measured, thoughtful, quotes scripture occasionally, never raises voice',
        publicStory: 'Was at the church in prayer all evening. Let himself in with his key.',
        hiddenTruth: 'Visited Helena at 11:30 PM, poisoned her tea with aconite, stole the manuscript, disabled security using Sophie\'s code, staged a window break-in, left via back entrance at 1 AM.',
        motive: 'The manuscript belonged to his church before it was stolen in 1847. He believed recovering it was his divine duty.',
        keyEvidence: 'Cassock thread on window latch, size 9 Santoni shoes match footprints, aconite in church garden, visitor log signature, homeless witness.',
        lies: ['Claims he was at church all evening', 'Denies visiting Helena that night'],
        tells: ['Fingers his rosary faster when stressed', 'Pauses longer before answering direct questions', 'Eyes drop slightly when mentioning the manuscript'],
        stateTransitions: {
            calm_to_defensive: ['Show visitor log', 'Mention the black thread'],
            defensive_to_aggressive: ['Show shoe prints + thread together', 'Confront with witness statement'],
            aggressive_to_breaks: ['Present aconite garden evidence', 'Show all evidence together'],
            cooperative_reveal: 'Breaks completely — confesses with tearful remorse.',
        },
        dialogues: {
            greeting: "Detective. I came willingly. I have nothing to hide. Helena was like family to me.",
            about_helena: "A remarkable woman. Deeply intelligent. We had our disagreements about the manuscript, but... I loved her as a friend.",
            about_alibi: "I was at St. Sebastian's. In the chapel. I often pray through the night when troubled. God was my only witness.",
            under_pressure: "I find these implications deeply offensive, Detective. A man of God does not sneak through windows.",
            confronted_with_thread: "There are many black garments in this city. I won't dignify this with further comment.",
            confronted_with_aconite: "...",
            breaks: "Those plants have been in our garden for thirty years. I tended them myself. I only wanted the manuscript returned. It BELONGS to the Church. She refused to listen. She laughed at me, Detective. And I... God forgive me. God forgive me.",
        },
    },

    // ─────────────────────────────────────────────────────────
    {
        id: 'isabelle_rousseau',
        name: 'Isabelle Rousseau',
        age: 44,
        role: 'International Art Dealer',
        image: '/scenes/s3_03_isabelle_interrogation.jpg',
        // WHISK PROMPT (Scene 07):
        // "1940s film noir interrogation scene of Isabelle Rousseau, mid-40s French
        //  woman art dealer sitting elegantly at metal table. Sophisticated styled
        //  hair in vintage waves, designer 1940s blazer, refined French features,
        //  expensive jewelry, designer handbag on table. Composed confident elegant
        //  posture. Stark interrogation room, overhead lamp casting glamorous shadows,
        //  two-way mirror, metal chairs. Case file on table. Sepia tone, monochromatic,
        //  vintage grain, aged photograph, dramatic noir with fashion-forward elegant
        //  styling, painterly. Medium shot capturing sophisticated composed demeanor.
        //  Contrast between her elegance and stark institutional setting."
        isKiller: false,
        initialState: 'calm',
        personality: 'Confident, calculating, uses charm as a weapon, deeply private about business',
        speechStyle: 'Measured tone, occasional French phrases, precise word choice, slight accent',
        publicStory: 'Dinner with a client at Le Bernardin until 10:30 PM then went home.',
        hiddenTruth: 'Has forged provenance documents that Helena recently discovered — she called Isabelle at 10:45 PM threatening to report it.',
        motive: 'Helena discovered her forged provenance documents and threatened to expose her — career-ending scandal.',
        keyEvidence: 'Phone records show call from Helena at 10:45 PM. Forged documents in her gallery records.',
        lies: ['Claims the call was routine', 'Denies any conflict with Helena'],
        tells: ['Adjusts jewelry when uncomfortable', 'Uses French words when deflecting', 'Becomes slightly more theatrical'],
        stateTransitions: {
            calm_to_defensive: ['Mention the 10:45 PM phone call', 'Ask about provenance documents'],
            defensive_to_cooperative: ['Show understanding of her position', 'Confirm she has alibi'],
            cooperative_reveal: 'Admits the forged documents and the threatening call — but confirms alibi clears her.',
        },
        dialogues: {
            greeting: "Detective. I hope this won't take long. I have appointments.",
            about_helena: "Helena and I had a complicated professional relationship. Competitors, often. But murder? Absurde.",
            about_alibi: "I was at Le Bernardin with my client, Jean-Pierre Fontaine, until half-past ten. Then home by taxi.",
            about_phone_call: "She called about a provenance question. Routine. Nothing unusual.",
            under_pressure: "Vraiment, Detective. This is becoming tedious. I had nothing to do with her death.",
            cooperative: "Fine. She found an irregularity in some documentation. Threatened to make it public. I was frightened. But I went home. I have taxi receipts, CCTV from my building. I didn't kill her.",
        },
    },

    // ─────────────────────────────────────────────────────────
    {
        id: 'dr_raymond_kask',
        name: 'Dr. Raymond Kask',
        age: 55,
        role: 'Manuscript Expert, Columbia University',
        image: '/scenes/s3_04_kask_interrogation.jpg',
        // WHISK PROMPT (Scene 08):
        // "1940s film noir interrogation scene of Dr. Raymond Kask, middle-aged male
        //  academic sitting at metal table. Scholarly appearance with tweed jacket,
        //  wire-rimmed glasses, neat conservative hair graying at temples, serious
        //  analytical expression. Academic materials and case file on table. Stark
        //  interrogation room, overhead lamp casting harsh shadows on face, two-way
        //  mirror, metal chairs. Sepia tone, monochromatic, heavy vintage grain, aged
        //  photograph, dramatic lighting, high contrast, noir aesthetic, painterly.
        //  Medium shot on intellectual analytical expression. Scholarly tension."
        isKiller: false,
        initialState: 'calm',
        personality: 'Arrogant, analytical, dismissive of those he considers intellectually inferior',
        speechStyle: 'Uses academic language, condescending tone, quotes obscure historical sources',
        publicStory: 'Working alone in his laboratory at Columbia University until late.',
        hiddenTruth: 'Left the university at 11:05 PM (badge log). Had arranged a private buyer for the manuscript page — but didn\'t know Moretti was planning to steal it.',
        motive: 'Helena refused to credit him in the manuscript discovery. He had arranged to sell it independently to a private collector.',
        keyEvidence: 'University badge shows he left at 11:05 PM. Email trail to private buyer.',
        lies: ['Claims he was at university all evening'],
        tells: ['Adjusts glasses repeatedly', 'Speaks more technically when hiding something', 'Drums fingers on table'],
        stateTransitions: {
            calm_to_defensive: ['Show university badge timestamp', 'Mention private buyer emails'],
            defensive_to_cooperative: ['Point out he\'s not actually the killer', 'Show you know about the buyer'],
            cooperative_reveal: 'Admits the private buyer arrangement — provides useful alibi information.',
        },
        dialogues: {
            greeting: "I must say, Detective, I find this entire process rather beneath someone of my expertise.",
            about_helena: "Helena was competent, in a curatorial sense. Intellectually, she lacked the rigor to truly understand what she had found.",
            about_alibi: "I was conducting research in my laboratory. Alone. Scholars often work through the night.",
            under_pressure: "Your implication is rather extraordinary. I am a distinguished professor at Columbia.",
            confronted_with_badge: "I may have stepped out briefly. For coffee. The badge log is occasionally... imprecise.",
            cooperative: "Very well. I left at eleven. I had a dinner meeting. With a collector. Who wanted the manuscript. But when I arrived at the gallery — it was locked. And dark. Someone got there first.",
        },
    },

    // ─────────────────────────────────────────────────────────
    {
        id: 'sophie_lin',
        name: 'Sophie Lin',
        age: 26,
        role: 'Gallery Security Systems Manager',
        image: '/scenes/s3_05_sophie_interrogation.jpg',
        // WHISK PROMPT (Scene 09):
        // "1940s film noir interrogation scene of Sophie Lin, young Asian female
        //  security expert sitting at metal table. Intelligent analytical expression,
        //  practical professional 1940s attire, neat appearance, tech-savvy demeanor.
        //  Security system documentation and case file on table. Stark interrogation
        //  room, overhead lamp casting dramatic shadows on face, two-way mirror, metal
        //  chairs. Sepia tone, monochromatic, heavy vintage grain, aged photograph,
        //  dramatic overhead lighting, high contrast, noir aesthetic, painterly.
        //  Medium shot capturing focused analytical expression. Technical atmosphere."
        isKiller: false,
        initialState: 'calm',
        personality: 'Intelligent, precise, protective of her professional reputation, genuinely afraid',
        speechStyle: 'Technical, precise, gives exact details, becomes quieter when frightened',
        publicStory: 'Home all evening — phone GPS confirms she never left her apartment.',
        hiddenTruth: 'Someone stole her credentials two days before the murder. She knows who it likely was but is afraid to accuse a priest.',
        motive: 'No motive — she is innocent but knows more than she admits.',
        keyEvidence: 'Her credentials used for override. GPS alibi is solid.',
        lies: ['Initially claims not to know how anyone got her credentials'],
        tells: ['Looks toward the two-way mirror when frightened', 'Becomes very technical as deflection', 'Hands tighten on documents'],
        stateTransitions: {
            calm_to_defensive: ['Ask how credentials were stolen', 'Mention she\'s a suspect'],
            defensive_to_cooperative: ['Tell her she\'s not the main suspect', 'Ask gently about who had access'],
            cooperative_reveal: 'Reveals Father Moretti asked to "borrow" her tablet two days before — under the pretense of checking the gallery\'s art insurance for the Church.',
        },
        dialogues: {
            greeting: "Detective. My GPS data is right there. I was home. I want that on record first.",
            about_system: "The override used my admin credentials, yes. But my phone never left my apartment. Someone else had my login.",
            about_alibi: "Home. All evening. My building has camera at the entrance. I ordered delivery at 9 PM. Check everything.",
            under_pressure: "I didn't do this. Someone stole my access. I should have reported it earlier, I know that now.",
            about_credentials: "Two days before... someone used my tablet. I let them. I trusted them. I feel sick about it.",
            cooperative: "Father Moretti. He came to the gallery two days before. Said he needed to check something about the Church's art insurance value. He used my tablet for maybe ten minutes. I thought nothing of it. He's a priest.",
        },
    },

    // ─────────────────────────────────────────────────────────
    {
        id: 'victor_voss',
        name: 'Victor Voss',
        age: 27,
        role: 'Helena\'s Son, Sole Heir',
        image: '/scenes/victor_voss.png',
        isKiller: false,
        initialState: 'calm',
        personality: 'Grief-stricken, carrying secret debt, shifts between raw emotion and stiff formality',
        speechStyle: 'Short fragmented sentences, trails off mid-thought, goes formal when scared',
        publicStory: 'Was at The Anchor bar in Brooklyn from 10:15 PM to 2:30 AM. Bartender Dom and four witnesses confirm.',
        hiddenTruth: 'Called Helena two days before to ask for $50,000 for a dangerous debt to a man named Pavel. She said no.',
        motive: 'Sole heir with large debts — but alibi is airtight.',
        keyEvidence: '4-minute phone call two days before death, asking for money.',
        lies: ['Hides the nature and recipient of the debt'],
        tells: ['Goes strangely formal when the debt comes up', 'Grief interrupts answers unpredictably', 'No contractions when scared'],
        stateTransitions: {
            calm_to_defensive: ['Ask about money', 'Ask about financial disputes'],
            defensive_to_aggressive: ['Accuse of killing mother for inheritance'],
            defensive_to_cooperative: ['Confirm alibi', 'Ask gently about phone call'],
            cooperative_reveal: 'Reveals Helena mentioned Moretti being "possessive" about the manuscript.',
        },
        dialogues: {
            greeting: "I was at The Anchor. Brooklyn. From — from around 10 I think, until late. The bartender, Dom, he knows me, he'll say—",
            about_helena: "She was my — ...yeah.",
            about_alibi: "I was at The Anchor. Brooklyn. Credit card, witnesses, everything. I was there.",
            under_pressure: "She was my mother. She said no. I accepted it. I went to a bar. She was my MOTHER.",
            cooperative: "She mentioned Father Moretti, actually. On our call. She said he had been coming around a lot. That he was being — her word — possessive. About the manuscript.",
        },
    },

    // ─────────────────────────────────────────────────────────
    {
        id: 'thomas_wade',
        name: 'Thomas Wade',
        age: 68,
        role: 'Eyewitness',
        image: '/scenes/thomas_wade.png',
        isKiller: false,
        initialState: 'calm',
        personality: 'Guarded, precise, economical with words, earns trust slowly',
        speechStyle: 'No filler words, exact observations, dry wit surfaces rarely',
        publicStory: 'Shelters in the alley behind the gallery. Saw a robed figure leave via the staff door at 1 AM.',
        hiddenTruth: 'Saw expensive Santoni shoes and the figure walking north toward St. Sebastian\'s Church.',
        motive: 'None — pure witness.',
        keyEvidence: 'Eyewitness account of someone leaving the gallery at 1 AM in dark robes with expensive shoes.',
        lies: [],
        tells: ['Closes completely if disrespected', 'Warms by degrees if treated well'],
        stateTransitions: {
            calm_to_defensive: ['Question reliability', 'Imply he is a suspect'],
            defensive_to_cooperative: ['Treat as credible witness with respect'],
            cooperative_reveal: 'Provides detailed description — robes, Santoni shoes, direction of travel toward St. Sebastian\'s.',
        },
        dialogues: {
            greeting: "I was in the alley. I saw someone leave. I came forward.",
            about_helena: "I did not know her. I know the building.",
            about_alibi: "I was in the alley. Where I always am.",
            under_pressure: "I know what I saw. I have been seeing things clearly for sixty-eight years.",
            cooperative: "North on Cavanaugh. There is one significant building north on Cavanaugh. The old church with the bells.",
        },
    },

    // ─────────────────────────────────────────────────────────
    {
        id: 'diane_park',
        name: 'Diane Park',
        age: 35,
        role: 'Gallery Cleaning Supervisor',
        image: '/scenes/diane_park.png',
        isKiller: false,
        initialState: 'calm',
        personality: 'Cooperative, precise, shaken but holding it together professionally',
        speechStyle: 'Structured, chronological, professional — quieter when emotional',
        publicStory: 'Arrived at 3:30 AM with cleaning crew. Found Helena\'s body at the desk at 3:47 AM. Called 911 immediately.',
        hiddenTruth: 'Noticed four unusual details she didn\'t mention to the first officers: origami crane, broken window latch, earthy smell, half-full teacup.',
        motive: 'None — pure witness.',
        keyEvidence: 'Observed the origami crane, broken window latch (splinters going inward), and an unusual earthy garden smell.',
        lies: [],
        tells: ['Voice goes quieter describing the body', 'The tea detail keeps resurfacing'],
        stateTransitions: {
            calm_to_cooperative: ['Ask about anything unusual in the room'],
            cooperative_reveal: 'Provides all four key observations — origami crane, window latch direction, earthy smell, half-full teacup.',
        },
        dialogues: {
            greeting: "We arrived at 3:30 AM. Staff door was unlocked. I took the main study at 3:47. She was at the desk. I checked for a pulse. I called 911 immediately.",
            about_helena: "Professionally. She was always considerate. Had the room ready before we arrived.",
            about_alibi: "I arrived at 3:30 AM with my crew. I have the schedule, the building entry log.",
            under_pressure: "I did not touch anything. I called 911. I did exactly what you are supposed to do.",
            cooperative: "Earthy. Like wet soil, almost. Like a garden. I have cleaned that building for four years. That smell was not supposed to be there.",
        },
    },
];

/**
 * Get suspect by ID
 */
export function getSuspectById(id) {
    return SUSPECTS.find(s => s.id === id) || null;
}
