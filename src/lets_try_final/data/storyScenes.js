/**
 * ═══════════════════════════════════════════════════════════
 *  THE MIDNIGHT CURATOR — Cinematic Scenes + Suspect Data
 * ═══════════════════════════════════════════════════════════
 *
 *  HOW TO ADD YOUR WHISK / CANVA IMAGES:
 *  Save images to: /public/scenes/
 *  Name them exactly as the `image` field below.
 *
 *  CINEMATIC SHOT ORDER:
 *  s1_01  Car front      — Manhattan rain
 *  s1_02  Car side       — rainy streets
 *  s1_03  Car interior   — Helena · husband · driver
 *  s1_04  Helena phone   — security alert popup
 *  s1_05  FLASHBACK      — Marcus promotion refused
 *  s1_06  Gallery arrive — car pulls up, rain
 *  s1_07  Mystery eyes   — Helena enters, watched in shadows
 *  s1_08  Crime scene    — 3:47 AM noir discovery
 *  s2_01  Gallery noir   — street level 1940s exterior
 *  s3_00  Marcus tease   — interrogation room intro → CTA
 * ═══════════════════════════════════════════════════════════
 */

export const STORY_SCENES = [

    // ─────────────────────────────────────────────────────────
    //  SCENE 1 — THE LAST NIGHT
    // ─────────────────────────────────────────────────────────

    {
        id: 'opening_title',
        image: '/images/midnight_curator_opening.png',
        kenburns: 'kenburns-in',
        overlay: 'overlay-noir',
        duration: 7500,
        rain: false,
        isFlashback: false,
        phoneAlert: false,
        audio: null,
        narration: 'Deep in the heart of the Manhattan art district, a legacy was about to be shattered. This is the story of the Midnight Curator.',
        caption: {
            eyebrow: 'A Case Study in Greed',
            title: 'The Midnight Curator',
            titleClass: 'gold',
            body: 'Voss Private Gallery\n03:00 AM',
            clue: null, cta: null,
        },
    },
    {
        id: 's1_01',
        image: '/scenes/s1_01_car_front.jpg',
        placeholderLabel: '🚗 Mercedes front — Manhattan night rain',
        kenburns: 'kenburns-in',
        overlay: 'overlay-cold',
        duration: 6500,
        rain: true,
        isFlashback: false,
        phoneAlert: false,
        // ── NARRATION ── save as: public/audio/s1_01.mp3
        // ElevenLabs: Voice "Liam" | Stability 55% | Similarity 80% | Style 25%
        audio: '/audio/s1_01.mp3',
        narration: 'March fourteenth. Manhattan. The rain fell the way bad news always does — without warning. Without mercy.',
        caption: {
            eyebrow: 'Manhattan  ·  March 14th  ·  11:22 PM',
            title: null,
            body: 'Rain tonight.\nThe city breathes in grey.',
            clue: null, cta: null,
        },
    },

    {
        id: 's1_02',
        image: '/scenes/s1_02_car_side.jpg',
        placeholderLabel: '🚗 Mercedes side — rainy Manhattan streetlights',
        kenburns: 'kenburns-pan-left',
        overlay: 'overlay-noir',
        duration: 6000,
        rain: true,
        isFlashback: false,
        phoneAlert: false,
        // ── NARRATION ── save as: public/audio/s1_02.mp3
        audio: '/audio/s1_02.mp3',
        narration: 'Doctor Helena Voss. Returning to the gallery she built from nothing. She does not know it is the last time.',
        caption: {
            eyebrow: null,
            title: null,
            body: 'Dr. Helena Voss.\nReturning to the gallery she built.\nShe doesn\'t know it\'s the last time.',
            clue: null, cta: null,
        },
    },

    {
        id: 's1_03',
        image: '/scenes/s1_03_car_interior.jpg',
        placeholderLabel: '🪟 Car interior — Helena · husband · driver',
        kenburns: 'kenburns-in',
        overlay: 'overlay-noir',
        duration: 6500,
        rain: false,
        isFlashback: false,
        phoneAlert: false,
        // ── NARRATION ── save as: public/audio/s1_03.mp3
        audio: '/audio/s1_03.mp3',
        narration: 'Three people in the car. They ride in silence. Nobody needs to speak. Nobody ever does.',
        caption: {
            eyebrow: null,
            title: null,
            body: 'Three people in the car.\nThey ride in silence.\nNobody needs to speak.',
            clue: null, cta: null,
        },
    },

    {
        id: 's1_04',
        image: '/scenes/s1_04_helena_phone.jpg',
        placeholderLabel: '📱 Helena close-up — looking at phone with concern',
        kenburns: 'kenburns-pan-right',
        overlay: 'overlay-cold',
        duration: 8000,
        rain: false,
        isFlashback: false,
        phoneAlert: true,
        phoneAlertDelay: 2200,
        // ── NARRATION ── save as: public/audio/s1_04.mp3
        audio: '/audio/s1_04.mp3',
        narration: 'Eleven forty-seven. Her phone lights up. Gallery security — offline. She should have turned the car around.',
        caption: {
            eyebrow: null, title: null, body: null, clue: null, cta: null,
        },
    },

    {
        id: 's1_05',
        image: '/scenes/s1_05_marcus_flashback.jpg',
        placeholderLabel: '⚡ FLASHBACK — Helena refuses Marcus promotion',
        kenburns: 'kenburns-pan-left',
        overlay: 'overlay-sepia',
        duration: 7000,
        rain: false,
        isFlashback: true,
        phoneAlert: false,
        // ── NARRATION ── save as: public/audio/s1_05.mp3
        audio: '/audio/s1_05.mp3',
        narration: 'Three weeks earlier. Marcus Chen had given her three years. She gave him four words in return. The answer is no.',
        caption: {
            eyebrow: 'Three Weeks Earlier',
            title: null,
            body: '"You\'ve given us nothing worth promoting, Marcus.\nThe answer is no."',
            clue: null, cta: null,
        },
    },

    {
        id: 's1_06',
        image: '/scenes/s1_06_gallery_arrive.jpg',
        placeholderLabel: '🏛 Gallery exterior — car arrives in rain',
        kenburns: 'kenburns-out',
        overlay: 'overlay-cold',
        duration: 6000,
        rain: true,
        isFlashback: false,
        phoneAlert: false,
        // ── NARRATION ── save as: public/audio/s1_06.mp3
        audio: '/audio/s1_06.mp3',
        narration: 'She steps out into the rain. East 72nd Street. The gallery she built — her life\'s work. Somewhere inside, a killer is already waiting.',
        caption: {
            eyebrow: 'Voss Private Gallery  ·  Manhattan',
            title: null,
            body: 'She steps out into the rain.\nSomewhere inside — a killer is already waiting.',
            clue: null, cta: null,
        },
    },

    // ── SHOT 7: Helena enters gallery, mysterious eyes watch ─
    // WHISK PROMPT:
    // "Cinematic noir: elegant silver-haired woman in navy blazer walking through
    //  grand private art gallery entrance at night. Marble floors, tall walls with
    //  illuminated oil paintings, warm amber gallery lighting. She walks forward
    //  unaware. Far in the deep shadows behind her, a sinister figure barely
    //  visible — ONLY their glowing eyes visible gleaming from the darkness,
    //  hidden behind a column. Extreme tension. Cold blue exterior light vs warm
    //  amber interior. Ultra cinematic, dark noir, 4K quality."
    {
        id: 's1_07',
        image: '/scenes/s1_07_mysterious_eyes.jpg',
        placeholderLabel: '👁 Helena enters gallery — mysterious eyes in shadows behind her',
        kenburns: 'kenburns-in',
        overlay: 'overlay-noir',
        duration: 7500,
        rain: false,
        isFlashback: false,
        phoneAlert: false,
        // ── NARRATION ── save as: public/audio/s1_07.mp3
        audio: '/audio/s1_07.mp3',
        narration: 'She walks through her kingdom of art. Unaware. Someone is watching from the shadows. Has been watching for months.',
        caption: {
            eyebrow: null,
            title: null,
            body: 'She walks through her kingdom of art.\nUnaware that someone is watching.\nHas been watching for months.',
            clue: null, cta: null,
        },
    },

    // ── SHOT 8: Crime scene — 3:47 AM noir discovery ─────────
    // WHISK PROMPT: Use your Scene 01 Combined prompt exactly.
    {
        id: 's1_08',
        image: '/scenes/s1_08_crime_scene.jpg',
        placeholderLabel: '🕯 3:47 AM — Helena slumped at desk, origami crane, noir style',
        kenburns: 'kenburns-pan-right',
        overlay: 'overlay-sepia',
        duration: 8000,
        rain: false,
        isFlashback: true,
        phoneAlert: false,
        // ── NARRATION ── save as: public/audio/s1_08.mp3
        audio: '/audio/s1_08.mp3',
        narration: 'Three forty-seven in the morning. The cleaning crew found her at her desk. Slumped. Still. Beside her — a teacup, cold. And a white origami crane.',
        caption: {
            eyebrow: '3:47 AM — The Morning After',
            title: null,
            body: 'Found by the cleaning crew.\nSlumped over her desk.\nBeside her — a cold teacup.\nAnd an origami crane.',
            clue: 'EVIDENCE: Aconite poisoning detected in teacup residue',
            cta: null,
        },
    },

    // ─────────────────────────────────────────────────────────
    //  SCENE 2 — GALLERY EXTERIOR NOIR
    // ─────────────────────────────────────────────────────────

    // WHISK PROMPT: Use your Scene 02 Combined prompt exactly.
    {
        id: 's2_01',
        image: '/scenes/s2_01_gallery_exterior_noir.jpg',
        placeholderLabel: '🌃 Gallery exterior — 1940s noir street level, wet pavement',
        kenburns: 'kenburns-in',
        overlay: 'overlay-cold',
        duration: 6500,
        rain: false,
        isFlashback: false,
        phoneAlert: false,
        // ── NARRATION ── save as: public/audio/s2_01.mp3
        audio: '/audio/s2_01.mp3',
        narration: 'Case file, number one. The Midnight Curator. A gallery. A stolen manuscript. An origami crane left like a signature. And five people who all had reason to want her dead.',
        caption: {
            eyebrow: 'Case File  #001',
            title: null,
            body: 'A gallery. A stolen manuscript.\nAn origami crane. And five suspects.',
            clue: null, cta: null,
        },
    },

    // ─────────────────────────────────────────────────────────
    //  SCENE 3 — MEET THE SUSPECTS (Marcus tease → CTA)
    // ─────────────────────────────────────────────────────────

    // WHISK PROMPT: Use your Scene 03 Combined prompt exactly.
    {
        id: 's3_marcus',
        image: '/scenes/s3_01_marcus_interrogation.jpg',
        placeholderLabel: '🪑 Marcus Chen — interrogation room — anxious, defensive',
        kenburns: 'kenburns-pan-left',
        overlay: 'overlay-sepia',
        duration: null,
        rain: false,
        isFlashback: true,
        phoneAlert: false,
        // ── NARRATION ── save as: public/audio/s3_marcus.mp3
        audio: '/audio/s3_marcus.mp3',
        narration: 'Five suspects. One truth. Your job — find it. The investigation begins now.',
        caption: {
            eyebrow: 'Suspect #1  ·  Marcus Chen',
            title: 'The Ambitious Protégé',
            titleClass: 'gold',
            body: 'Age 29. Assistant Curator.\nHis fingerprints are on the teacup.\nAnd he has no alibi.',
            clue: 'MOTIVE: Promotion denied. Arguments witnessed by staff.',
            cta: null,
        },
    },
];

/* ═══════════════════════════════════════════════════════════
   SUSPECT DATA — used by the Interrogation Room game UI
   Image paths reference the noir interrogation room images.
═══════════════════════════════════════════════════════════ */
export const SUSPECTS = [
    {
        id: 'marcus_chen',
        name: 'Marcus Chen',
        age: 29,
        role: 'Assistant Curator',
        image: '/scenes/s3_01_marcus_interrogation.jpg',
        // WHISK → Scene 03 Combined prompt (anxious Asian male, blue shirt, metal table)
        initialState: 'calm',
        motive: 'Promotion denied. Heated arguments witnessed by gallery staff.',
        alibi: 'Claims home alone watching a documentary on Renaissance art.',
        hiddenTruth: 'Was meeting with Blackwood Gallery owner 11 PM – 1 AM.',
        keyEvidence: 'Fingerprints on teacup — made tea for Helena at 4 PM.',
        isKiller: false,
    },
    {
        id: 'father_moretti',
        name: 'Father Antonio Moretti',
        age: 64,
        role: 'Priest — St. Sebastian\'s Church',
        image: '/scenes/s3_02_moretti_interrogation.jpg',
        // WHISK → Scene 04 Combined prompt (black cassock, rosary, kind weathered face)
        initialState: 'calm',
        motive: 'Manuscript belonged to his church, stolen in 1847. Divine duty to retrieve it.',
        alibi: 'Claims at church praying all evening.',
        hiddenTruth: 'THE KILLER. Visited Helena 11:30 PM, poisoned tea, stole manuscript, disabled security using Sophie\'s code.',
        keyEvidence: 'Black cassock thread on window latch. Size 9 Italian leather shoes match footprints. Aconite in church garden.',
        isKiller: true,
    },
    {
        id: 'isabelle_rousseau',
        name: 'Isabelle Rousseau',
        age: 38,
        role: 'International Art Dealer',
        image: '/scenes/s3_03_isabelle_interrogation.jpg',
        // WHISK → "1940s noir interrogation: elegant French woman 38, sharp business suit,
        //  blonde hair, calculating blue eyes, composed but guarded expression. Metal table,
        //  single overhead lamp, two-way mirror, sepia grain texture."
        initialState: 'calm',
        motive: 'Business rivalry — Helena blocked her auction deal and discovered forged provenance documents.',
        alibi: 'Claims at dinner with a client at Le Bernardin.',
        hiddenTruth: 'Has forged provenance documents Helena had recently discovered.',
        keyEvidence: 'Phone records show call to Helena at 10:45 PM.',
        isKiller: false,
    },
    {
        id: 'dr_raymond_kask',
        name: 'Dr. Raymond Kask',
        age: 55,
        role: 'Manuscript Expert — Columbia University',
        image: '/scenes/s3_04_kask_interrogation.jpg',
        // WHISK → "1940s noir interrogation: academic man 55, glasses, rumpled tweed jacket,
        //  receding salt-and-pepper hair, defensive superior expression. Metal table, overhead
        //  lamp, sepia grain, aged photograph quality."
        initialState: 'calm',
        motive: 'Helena refused to share manuscript discovery credit. Had a separate private buyer.',
        alibi: 'Claims working late at Columbia University lab.',
        hiddenTruth: 'University badge swiped out at 11:05 PM — alibi is false.',
        keyEvidence: 'Security badge timestamp contradicts alibi.',
        isKiller: false,
    },
    {
        id: 'sophie_lin',
        name: 'Sophie Lin',
        age: 26,
        role: 'Gallery Security Systems Manager',
        image: '/scenes/s3_05_sophie_interrogation.jpg',
        // WHISK → "1940s noir interrogation: young Chinese-American woman 26, smart casual
        //  clothing, short dark hair, frightened but defiant expression, clutching note.
        //  Metal table, overhead lamp, two-way mirror, sepia grain, noir aesthetic."
        initialState: 'calm',
        motive: 'Security disabled using HER stolen credentials.',
        alibi: 'Home all night — phone GPS confirms location.',
        hiddenTruth: 'Her credentials were stolen. She knows who had access but is afraid to say.',
        keyEvidence: 'Admin override at exactly 00:00:00 using her login.',
        isKiller: false,
    },
];

/* ═══════════════════════════════════════════════════════════
   LOCATIONS — Investigable places shown in the game UI
   Used on the Evidence Board and alibi investigation screens
═══════════════════════════════════════════════════════════ */
export const LOCATIONS = [

    {
        id: 'voss_gallery_office',
        name: 'Voss Private Gallery — Office',
        subtitle: 'Crime Scene',
        image: '/scenes/s1_08_crime_scene.jpg',
        // (reuses crime scene shot from cinematic)
        tag: 'PRIMARY CRIME SCENE',
        tagColor: '#8b1a1a',
        description: 'Where Dr. Helena Voss was found dead at 3:47 AM. Mahogany desk, open medieval manuscript, teacup, origami crane.',
        clues: [
            'Teacup with aconite residue',
            'Origami crane from gallery letterhead',
            'Security disabled at exactly midnight',
            'Window latch broken from inside',
            'Black thread caught on window mechanism',
            'Size 9 Italian leather shoe footprints',
        ],
        linkedSuspects: ['father_moretti', 'marcus_chen', 'sophie_lin'],
    },

    {
        id: 'st_sebastians_church',
        name: 'St. Sebastian\'s Church',
        subtitle: 'Father Moretti\'s Alibi Location',
        image: '/scenes/s5_01_church_exterior.jpg',
        // WHISK PROMPT (Scene 05 Combined):
        // "1940s film noir photograph of St. Sebastian's Catholic Church exterior.
        //  Gothic stone facade with pointed arch entrance, tall bell tower with cross,
        //  stained glass windows, traditional crucifix above main doors, stone steps.
        //  Church garden area visible on side. Overcast dramatic sky. Urban setting.
        //  Sepia tone, monochromatic browns and blacks, heavy vintage grain, aged
        //  photograph effect, high contrast shadows on stone facade, ominous mood,
        //  vignetting, painterly Gothic quality. Low angle camera emphasizing imposing
        //  religious architecture. Dark clouds adding sinister undertones."
        tag: 'ALIBI LOCATION — MORETTI',
        tagColor: '#3a3060',
        description: 'Father Moretti claims he was here all evening. The church garden contains aconite (wolfsbane) plants. A homeless witness saw a priest leaving after 1 AM.',
        clues: [
            'Aconite plants in church garden (wolfsbane — cause of death)',
            'Homeless witness: saw priest leave at 1 AM',
            'Church records show Moretti had a key to the gallery (old family friend)',
            'Moretti knew Sophie Lin had admin credentials',
            'No CCTV inside church to confirm alibi',
        ],
        linkedSuspects: ['father_moretti'],
        isKeyLocation: true, // contains the murder weapon source
    },

    {
        id: 'gallery_exterior',
        name: 'Voss Private Gallery — Exterior',
        subtitle: 'Manhattan Art District',
        image: '/scenes/s2_01_gallery_exterior_noir.jpg',
        tag: 'SCENE OF CRIME',
        tagColor: '#5a3010',
        description: 'The gallery building. Art deco facade. Security cameras were disabled at midnight. Back entrance shows signs of careful exit.',
        clues: [
            'Security camera footage: blank from midnight to 1:15 AM',
            'Back entrance door: unlocked from inside at 1:00 AM',
            'Wet shoe prints on back steps (rain, size 9)',
            'Gallery log: Moretti signed visitor book at 11:28 PM',
        ],
        linkedSuspects: ['father_moretti', 'sophie_lin'],
    },

    {
        id: 'blackwood_gallery',
        name: 'Blackwood Gallery',
        subtitle: 'Marcus Chen\'s Secret Meeting Location',
        image: '/scenes/s6_01_blackwood_gallery.jpg',
        // WHISK PROMPT:
        // "1940s noir: modern art gallery interior at night, sleek contemporary space
        //  with track lighting, white walls, abstract art. Two men in business attire
        //  having discreet conversation. Sepia toned, vintage grain, noir atmosphere."
        tag: 'ALIBI VERIFICATION — MARCUS',
        tagColor: '#1a4a2a',
        description: 'Marcus was secretly interviewing for a job here. His alibi checks out — but the meeting was embarrassing, so he lied about being home.',
        clues: [
            'Security footage: Marcus arrives 11:05 PM, leaves 1:12 AM',
            'Gallery owner confirms the meeting',
            'Marcus signed NDA — explains why he lied',
        ],
        linkedSuspects: ['marcus_chen'],
    },
];
