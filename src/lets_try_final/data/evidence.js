/**
 * ═══════════════════════════════════════════════════════════
 *  THE MIDNIGHT CURATOR — Evidence Database
 *  All physical, digital, and testimonial evidence for Case #1
 *
 *  Each item has:
 *  - id, name, category, image (Whisk/Canva file path)
 *  - description, significance, linkedSuspects
 *  - status: 'undiscovered' | 'found' | 'analyzed' | 'confirmed'
 *  - revealsTruth: does confronting a suspect with this break them?
 * ═══════════════════════════════════════════════════════════
 */

export const EVIDENCE_CATEGORIES = {
    PHYSICAL: { label: 'Physical Evidence', color: '#8b3a3a', icon: '🔍' },
    DIGITAL: { label: 'Digital Evidence', color: '#2a5a8b', icon: '💻' },
    TESTIMONIAL: { label: 'Witness Testimony', color: '#3a6b3a', icon: '🗣' },
    FORENSIC: { label: 'Forensic Analysis', color: '#6b4a2a', icon: '🧪' },
    DOCUMENT: { label: 'Documents & Records', color: '#5a4a7a', icon: '📄' },
};

export const EVIDENCE = [

    // ─────────────────────────────────────────────────────────
    //  PHYSICAL EVIDENCE
    // ─────────────────────────────────────────────────────────

    {
        id: 'teacup',
        name: 'The Poisoned Teacup',
        category: 'PHYSICAL',
        image: '/evidence/ev_01_teacup.jpg',
        // WHISK: "1940s noir evidence photograph of white porcelain teacup on mahogany
        //  desk. Yellow evidence marker #1 beside cup. Tea residue visible inside.
        //  Sepia tone, heavy grain, aged photograph, forensic evidence style."
        thumbnail: '☕',
        description: 'White porcelain teacup found on Helena\'s desk. Tea residue present. Sent to forensics.',
        significance: 'CRITICAL — Contains aconite alkaloid. Fingerprints of Helena Voss, Marcus Chen, and one smudged unknown print.',
        forensicResult: 'Aconite (wolfsbane) detected in residue. Lethal dose sufficient to cause death within 60–90 minutes.',
        linkedSuspects: ['marcus_chen', 'father_moretti'],
        status: 'found',
        revealsTruth: true,
        // Marcus: his prints are there — explains the 4 PM tea making
        // Moretti: the smudged print is consistent with gloved hand
        suspectReactions: {
            marcus_chen: {
                reaction: 'defensive → cooperative',
                dialogue: 'I made her tea that afternoon — at 4 PM! I always did. The tea was fine when I left. Someone must have... wait. Someone added something after me.',
            },
            father_moretti: {
                reaction: 'calm → defensive',
                dialogue: 'I may have touched the teacup when I was there that evening. Helena offered me tea as well. I... declined.',
            },
        },
    },

    {
        id: 'origami_crane',
        name: 'Origami Crane',
        category: 'PHYSICAL',
        image: '/evidence/ev_02_origami_crane.jpg',
        // WHISK: "1940s noir: delicate white origami crane paper folded precisely,
        //  placed on mahogany desk, evidence marker beside it. Close-up.
        //  Sepia, vintage grain, dramatic lighting."
        thumbnail: '🕊',
        description: 'Delicate origami crane folded from Voss Gallery letterhead. Found beside the teacup.',
        significance: 'Contains handwritten riddle: "Where time stands still but bells still ring, the shepherd tends to wealthier things."',
        forensicResult: 'Handwriting does not match any suspect. Likely disguised. Paper matches gallery stationery.',
        linkedSuspects: ['father_moretti'],
        status: 'found',
        revealsTruth: false, // it\'s a red herring misdirection
        notes: 'RED HERRING — designed to point to bell tower, not Moretti directly.',
        suspectReactions: {
            father_moretti: {
                reaction: 'calm (holds composure)',
                dialogue: 'A riddle... how theatrical. I wouldn\'t know anything about origami, Detective. That\'s more of a Japanese tradition, isn\'t it?',
            },
        },
    },

    {
        id: 'window_latch',
        name: 'Broken Window Latch',
        category: 'PHYSICAL',
        image: '/evidence/ev_03_window_latch.jpg',
        // WHISK: "1940s noir close-up of old brass window latch broken from inside,
        //  black fabric thread caught in metal mechanism, evidence markers nearby.
        //  Sepia toned, noir forensic photograph style, heavy grain."
        thumbnail: '🪟',
        description: 'Gallery window latch found broken. Initially suggested forced entry from outside.',
        significance: 'CRITICAL — Broken from INSIDE, not outside. Black fabric thread caught in latch mechanism.',
        forensicResult: 'Thread is 100% wool, consistent with Catholic cassock fabric. Stage break-in from inside.',
        linkedSuspects: ['father_moretti'],
        status: 'analyzed',
        revealsTruth: true,
        suspectReactions: {
            father_moretti: {
                reaction: 'calm → aggressive',
                dialogue: 'I... I don\'t know what kind of thread that is. There are many black garments in Manhattan, Detective. Are you suggesting a man of God—',
            },
        },
    },

    {
        id: 'black_thread',
        name: 'Black Fabric Thread',
        category: 'PHYSICAL',
        image: '/evidence/ev_04_black_thread.jpg',
        thumbnail: '🧵',
        description: 'Single black thread recovered from window latch mechanism.',
        significance: 'Forensic match to Catholic cassock wool. Narrows suspects to those wearing such garments.',
        forensicResult: 'Wool thread, black dye batch consistent with liturgical garment suppliers. Matches fiber from Father Moretti\'s cassock.',
        linkedSuspects: ['father_moretti'],
        status: 'analyzed',
        revealsTruth: true,
    },

    {
        id: 'shoe_prints',
        name: 'Footprints — Back Entrance',
        category: 'PHYSICAL',
        image: '/evidence/ev_05_shoe_prints.jpg',
        thumbnail: '👞',
        description: 'Rain-soaked footprints on the back entrance steps. Clear sole impression preserved.',
        significance: 'Size 9 men\'s shoe. Expensive Italian leather — consistent with Santoni brand ($800+).',
        forensicResult: 'Santoni Oxford sole pattern confirmed. Father Moretti wears size 9 Santoni shoes — given as gift from the Vatican.',
        linkedSuspects: ['father_moretti'],
        status: 'found',
        revealsTruth: true,
    },

    {
        id: 'manuscript_page',
        name: 'Missing Manuscript Page',
        category: 'PHYSICAL',
        image: '/evidence/ev_06_manuscript.jpg',
        // WHISK: "1940s noir: ornate medieval manuscript page, aged parchment with
        //  illuminated text and map illustration, evidence marker, desk setting.
        //  Sepia tone, heavy grain, noir documentary photograph."
        thumbnail: '📜',
        description: 'A rare 15th-century manuscript page — absent from crime scene. Known to have been on Helena\'s desk before death.',
        significance: 'STOLEN — Shows location of lost church treasure. Father Moretti\'s stated motive. Its absence confirms premeditated theft.',
        forensicResult: 'Gallery records confirm purchase. Insurance value: $4.2 million. No trace of page recovered.',
        linkedSuspects: ['father_moretti', 'dr_raymond_kask'],
        status: 'found',
        revealsTruth: true,
    },

    // ─────────────────────────────────────────────────────────
    //  FORENSIC EVIDENCE
    // ─────────────────────────────────────────────────────────

    {
        id: 'aconite_garden',
        name: 'Aconite Plants — Church Garden',
        category: 'FORENSIC',
        image: '/evidence/ev_07_aconite_garden.jpg',
        // WHISK PROMPT (Scene 06 Combined — use exactly):
        // "1940s film noir evidence photograph of aconite wolfsbane plants growing in
        //  church garden. Distinctive purple hooded poisonous flowers in garden bed,
        //  dark green foliage, evidence markers placed around plants. Overgrown
        //  mysterious garden behind St. Sebastian's Church, stone church wall in
        //  background, weathered stone pathway, old garden pots and tools. Sepia tone,
        //  monochromatic with browns blacks and muted purple, heavy vintage grain,
        //  aged photograph effect, dramatic botanical lighting, high contrast shadows,
        //  sinister mood, vignetting, noir detective evidence style. Close-up then
        //  wider garden view showing church context."
        thumbnail: '🌿',
        description: 'Aconite (Aconitum napellus / wolfsbane) plants discovered growing in St. Sebastian\'s Church garden. Fully mature, in bloom.',
        significance: 'CRITICAL LINK — Cause of death was aconite poisoning. Plants here are mature enough for extraction. Moretti tends this garden personally.',
        forensicResult: 'Alkaloid content matches exact poisoning profile in Helena\'s toxicology report. Fresh extraction marks on several stalks.',
        linkedSuspects: ['father_moretti'],
        status: 'analyzed',
        revealsTruth: true,
        suspectReactions: {
            father_moretti: {
                reaction: 'cooperative → breaks',
                dialogue: 'Those plants have been in our garden for thirty years... I... I only wanted the manuscript returned. It belongs to the Church. She wouldn\'t listen. She wouldn\'t listen to reason, and I... God forgive me.',
            },
        },
    },

    // ─────────────────────────────────────────────────────────
    //  DIGITAL EVIDENCE
    // ─────────────────────────────────────────────────────────

    {
        id: 'security_logs',
        name: 'Security System Override Log',
        category: 'DIGITAL',
        image: '/evidence/ev_08_security_log.jpg',
        thumbnail: '🖥',
        description: 'Digital log from gallery security system. Shows admin override at exactly 00:00:00.',
        significance: 'System disabled using Sophie Lin\'s admin credentials. Timestamp pinpoints the exact moment the killer secured privacy.',
        forensicResult: 'Login originated from inside gallery premises, not remotely. Whoever used it was already in the building at midnight.',
        linkedSuspects: ['sophie_lin', 'father_moretti'],
        status: 'found',
        revealsTruth: true,
    },

    {
        id: 'phone_records',
        name: 'Helena\'s Phone Records',
        category: 'DIGITAL',
        image: '/evidence/ev_09_phone_records.jpg',
        thumbnail: '📱',
        description: 'Helena\'s mobile phone call and message log for March 14th.',
        significance: 'Security alert received at 11:47 PM — she knew the system was compromised. No outgoing calls after 11:52 PM.',
        forensicResult: 'Last received call: 11:41 PM from unknown number (prepaid). Last message sent: "Something is wrong" to husband.',
        linkedSuspects: ['sophie_lin', 'father_moretti'],
        status: 'found',
        revealsTruth: false,
    },

    // ─────────────────────────────────────────────────────────
    //  TESTIMONIAL EVIDENCE
    // ─────────────────────────────────────────────────────────

    {
        id: 'homeless_witness',
        name: 'Homeless Witness Statement',
        category: 'TESTIMONIAL',
        image: '/evidence/ev_10_witness.jpg',
        thumbnail: '👤',
        description: 'Statement from homeless man who sleeps in alley near gallery back entrance.',
        significance: 'Saw a person in dark robes (priest\'s cassock) exit the back entrance around 1:00 AM. Walking quickly, carrying something under arm.',
        forensicResult: 'N/A — witness testimony. Corroborated by wet footprints timeline.',
        linkedSuspects: ['father_moretti'],
        status: 'found',
        revealsTruth: true,
    },

    {
        id: 'gallery_visitor_log',
        name: 'Gallery Visitor Log — Mar 14th',
        category: 'DOCUMENT',
        image: '/evidence/ev_11_visitor_log.jpg',
        thumbnail: '📋',
        description: 'Physical sign-in book kept at gallery reception.',
        significance: 'Father Moretti signed in at 11:28 PM. No sign-out recorded. Marcus Chen: last signed in at 9:15 AM. Isabelle Rousseau: signed in at 7:30 PM, signed out 9:45 PM.',
        linkedSuspects: ['father_moretti', 'isabelle_rousseau'],
        status: 'found',
        revealsTruth: true,
    },

    {
        id: 'back_alley_reconstruction',
        name: 'Back Alley — Crime Reconstruction',
        category: 'FORENSIC',
        image: '/evidence/ev_12_back_alley.jpg',
        // WHISK PROMPT (Scene 11 Combined — use exactly):
        // "1940s film noir crime reconstruction photograph of gallery back alley at
        //  1:00 AM. Dark urban alley behind Voss Private Gallery, brick walls, fire
        //  escape, dumpsters. Silhouette of Father Moretti in black cassock exiting
        //  through metal back door carrying manuscript. Homeless witness figure barely
        //  visible in deep shadows near dumpster. Single security light casting
        //  dramatic shadows. Footprints visible on wet cobblestone pavement.
        //  Atmospheric fog in alley. Sepia tone, monochromatic, heavy vintage grain,
        //  aged photograph, extreme high contrast noir, vignetting, mysterious ominous
        //  mood, painterly. Wide shot down alley showing full exit scene. Time stamp
        //  overlay '1:00 AM'. Noir crime reconstruction aesthetic."
        thumbnail: '🚪',
        description: 'Crime reconstruction image: Father Moretti exiting gallery back entrance at 1:00 AM. Homeless witness visible in shadows near dumpster.',
        significance: 'Places Father Moretti at the back entrance at 1:00 AM — corroborates witness statement and footprint evidence. Disabled security camera confirms premeditation.',
        forensicResult: 'Forensic reconstruction based on: footprint trail, witness eyeline, security door timestamp, and disabled camera log. Consistent with single perpetrator exit.',
        linkedSuspects: ['father_moretti'],
        status: 'analyzed',
        revealsTruth: true,
        suspectReactions: {
            father_moretti: {
                reaction: 'aggressive → breaking',
                dialogue: 'That is... a reconstruction. That proves nothing. A silhouette proves nothing. I want a lawyer, Detective. I want a lawyer right now.',
            },
        },
    },
];

/**
 * Helper — get evidence by ID
 */
export function getEvidenceById(id) {
    return EVIDENCE.find(e => e.id === id) || null;
}

/**
 * Helper — get all evidence linked to a suspect
 */
export function getEvidenceForSuspect(suspectId) {
    return EVIDENCE.filter(e => e.linkedSuspects?.includes(suspectId));
}

/**
 * Helper — get evidence that breaks a specific suspect when confronted
 */
export function getBreakingEvidence(suspectId) {
    return EVIDENCE.filter(e =>
        e.revealsTruth &&
        e.linkedSuspects?.includes(suspectId) &&
        e.suspectReactions?.[suspectId]
    );
}
