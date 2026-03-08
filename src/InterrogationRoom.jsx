import React, { useState, useEffect, useRef, useCallback } from 'react';
import './InterrogationRoom.css';
import { createSession, sendMessage } from './agentService';

/* ═══════════════════════════════════════════════════════════
   SCRIPTED FALLBACK DIALOGUE
   Derived directly from the Python ADK agent state machines.
   Activates automatically when the agent server is offline.
═══════════════════════════════════════════════════════════ */
const FALLBACK = {
    dsouza: {
        greeting: "What is this interrogation? I am a grieving husband. I have rights, Detective.",
        generic: "I don't see the relevance of that question.",
        keywords: {
            wife: "Eliza was everything to me. Her heart condition was always a concern for us.",
            eliza: "Do not say her name so casually. You did not know her.",
            tobacco: "I smoke occasionally, yes. Perique — it is The Stellar's own blend. Eliza's father's company. It is hardly a crime to smoke the family tobacco.",
            murder: "I will not sit here and be accused in my own home.",
            diary: "That diary is private property. I demand you return it immediately.",
            vent: "I sometimes close the vents in the dome when I relax there. I have done it for years. It is hardly sinister.",
            eliot: "My father-in-law is unwell. He has been — he is not always present. Please be gentle with him.",
        }
    },
    mary: {
        greeting: "I already told the constable everything, Detective. Please... I am still shaken.",
        generic: "I don't know what exactly you mean.",
        keywords: {
            body: "I went to bring fresh water for the dahlias. She was just... lying there, so peaceful.",
            vent: "I have the maintenance keys, yes, but I barely go down there. I haven't touched those vents in months.",
            speaker: "I have never seen that machine in my life. I clean — I do not touch equipment.",
            diary: "Miss Eliza kept her affairs very private. I respected that always.",
        }
    },
    kye: {
        greeting: "She had been going through something for weeks. I was worried about her. I went to sleep early — I had a session to finish. I woke up to the call.",
        generic: "I'm not sure I follow what you're implying.",
        keywords: {
            speaker: "I have no idea how those got into the ventilation system. I certainly did not put anything in there.",
            vent: "I wouldn't know about the sanctuary's circulation systems. That's estate maintenance.",
            infrasound: "Infrasound is a well-documented acoustic phenomenon. If you're suggesting that explains something, you would need an acoustic engineer, not a detective.",
            install: "I was not involved in any installation at the sanctuary. I was worried about her, Detective, not installing equipment.",
            account: "The production account has multiple users. Vince handles sourcing. I don't track every line item.",
            vince: "Vince sources equipment for various projects. I give him specifications. That is the nature of the working relationship.",
            recording: "I don't know what that is.",
            counting: "She was counting. At the end. I could... — never mind.",
            help: "...No. I didn't call.",
            fear: "Fear has texture. A raw response you cannot manufacture with actors. She was — I was worried about her.",
            diary: "She was documenting something. That was how she was built. She documented everything. It doesn't surprise me.",
            fiancee: "She had been struggling for weeks. The last time I saw her she seemed — I was worried about her.",
            lawyer: "I would like to speak with my lawyer before this continues.",
            audio: "It was... perfect audio. The genuine article. You can't manufacture that kind of fear. I needed a genuine response. Not an actor. Not a simulation. I did not mean for the other things to happen.",
        }
    },
    carl: {
        greeting: "I was home. She was — she was fine when I saw her. I don't know what happened.",
        generic: "Why are you asking me that.",
        keywords: {
            door: "That's — I go in there all the time. The sanctuary. I have a code.",
            lock: "I locked up. Routine security. I didn't know she was still inside.",
            keypad: "I went to check. That's all. I went to check.",
            night: "I went to check. She wasn't — I left.",
            diamond: "Where did you — how did you — ",
            shuk: "Shuk was — he was a good bird. She loved that bird.",
            cage: "I don't know what you found. I don't know what you're talking about.",
            fine: "She was fine. She was fine when I left. I didn't know any of this was — she was fine.",
            sister: "She was my sister. I would never — she was — I would never.",
            help: "I couldn't — I didn't — I know. I know.",
            kye: "I didn't know about Kye. I didn't know about any speakers. I locked a door. That's what I did.",
            vents: "I didn't know about the vents. I didn't know about my dad. I locked a door. Everything else — I wasn't there for that.",
            ferro: "I don't know what you're talking about. Flat. Final.",
        }
    },
    waltz: {
        greeting: "She had been documenting the petal counts for fifteen days. Thirteen, twenty-one, thirty-four — the Fibonacci sequence appears in those specific numbers because nature optimises for the golden angle. Every daisy knows this. Eliza understood this. I'm sorry. You asked something. What did you ask?",
        generic: "An interesting question. The connection may not be immediately obvious, but — if I may — let me come at it from first principles.",
        keywords: {
            tea: "I brought her chamomile. An herbal preparation. She enjoyed it. We drank it together during our sessions. It was — a ritual, of sorts. Part of the work.",
            preparation: "A traditional recipe. From 17th-century botanical literature. I have studied these preparations for thirty years. Nothing harmful on their own.",
            tobacco: "Perique tobacco has well-documented neuro-stimulant properties. Small quantities. Microdoses. Nothing harmful — on their own.",
            smoke: "Perique tobacco has well-documented neuro-stimulant properties. Small quantities. Microdoses. Nothing harmful — on their own.",
            hallucination: "She was not hallucinating. She was perceiving. There is a difference. She had the sight. Fibonacci is the language used to build the physical world. Eliza could read it natively. I was merely... unlocking that capacity.",
            notebook: "Yes. That is my recipe. Chamomile base. Dried Perique leaf extract. I used it myself, for years. I thought — the traditional literature says it opens the prophetic mind. I did not know — I did not test for cardiovascular interaction.",
            frequency: "The golden angle is 137.5 degrees — do you know this? Each petal positions itself to maximise light capture. Every sunflower. Every daisy. Now you are telling me the petals were wrong because of a frequency in a vent. Vibration. Physical vibration of the cell division. Not a message. A wound.",
            poison: "Poison. You are calling a 17th-century botanical preparation a poison. That is — I will not — ",
            infrasound: "I did not know about the sound. I did not know about the speakers. I did not know about the sealed vents. My crime — if that is the word — is not conspiracy. I was — I was trying to give her sight. I made her a target and I thought I was giving her wings.",
            diary: "Yes — she gave me a copy of these passages. 'I can see sound.' 'The numbers are wrong.' I thought she was translating the divine signal into language. She was documenting trauma. I thought the same words meant something different.",
            daisy: "18, 20, 32. I documented those myself. I thought the garden was responding to her. Coherence disrupted by something larger. Not — not by mechanical vibration. Not by a speaker in a vent.",
            last: "The afternoon of her death. Three o'clock. We had our weekly session. I brought her tea, as I always did. I had no idea she would enter the sanctuary two hours later.",
        }
    },
    kara: {
        greeting: "We were so close. I've been — I honestly can't believe she's gone. She called me the week before and she seemed — well, she was a little stressed. About the flowers. About her research. You know how she was. Very focused.",
        generic: "Of course I was there for her. We did everything together.",
        keywords: {
            crazy: "I didn't mean — I was worried about her. Of course I was worried. I just meant she seemed stressed. I didn't mean it like — like she was actually unwell.",
            hallucination: "She called me. Three weeks ago. She said she was seeing things — hearing things. I told her to rest. I thought she was anxious. I didn't report it. No.",
            report: "I thought — I don't know. I thought it would be fine. I thought she was being dramatic.",
            flowers: "She kept talking about the flowers being wrong. I told her it was probably just a bad season. I didn't — she was right, wasn't she. The flowers were actually wrong.",
            diary: "This is — she's doing measurements. She's logging dates. She's — this isn't crazy. This is her working. I told the police she was a little crazy.",
            carl: "Karl is — Carl. He's — we've known each other a long time. The family. I know the family.",
            karl: "Karl said — Carl. I'm sorry. Old habit.",
            jealous: "That's insane. I loved her. I have known her since we were sixteen years old.",
            last: "We took the bus home together. She got off at her stop around 4:45. I waved goodbye. That was it.",
            sound: "She said she could 'see sound' once. I told her she needed sleep. Of course I thought she just needed to rest.",
        }
    },
    // ── WITNESSES ──
    vince_okafor: {
        greeting: "I came in voluntarily because... I have been thinking about some things since I heard Eliza D'Souza died. I sourced equipment for Kye six weeks ago. Four compact subwoofer units. Maximum output at 19 Hz, sealed enclosure. I logged them through his production company account.",
        generic: "That is outside what I was brought in for. My knowledge is the equipment and what Kye asked me.",
        keywords: {
            speaker: "Unusual spec. You do not usually need maximum output at 19 Hz for anything above ground level. I thought it was for a specific studio setup. He was working on something unusual.",
            frequency: "19 Hz is below the human hearing threshold. You do not hear it — you feel it. Pressure in the chest. Disorientation. At high enough SPL it starts to interfere with cardiac rhythm. That is documented.",
            cardiac: "He asked me once — casually, the way he asks technical questions — whether sustained infrasound at maximum output in an enclosed space could cause cardiac effects. I said yes. In theory. At very high amplitudes in a sealed environment. He said 'good to know' and wrote something down. I thought it was for the script notes. I thought it was for the script notes.",
            kye: "I delivered the units to Kye at his van outside The Stellar offices — not a studio. He said he had a meeting there and would take them to the studio after. I did not ask. I should have asked.",
            log: "I have the equipment log on my laptop. The purchase order has the serial numbers, the frequency spec. Take it. I want you to take it.",
            calibration: "I compiled a frequency response curve for the units myself. At maximum in a small sealed space — I wrote in the document that extended exposure above 100 dB at this frequency warrants physiological monitoring. I wrote that. It is in the document.",
            deliver: "He was parked near The Stellar offices. He said he had a meeting and would take them to the studio after. I did not think about the location. I should have thought about the location.",
        }
    },
    rina_soares: {
        greeting: "I arrived at ten o'clock. My routine is the birds first — I always do the birds first. The dome glass was fogged on the inside, heavier than usual. I noted it. I opened the keypad. I found Eliza on the floor, surrounded by daisies. She had arranged them in a spiral pattern. Her ruler was beside her. Shuk was in his cage. The door was open. I called emergency services. I did not move anything.",
        generic: "I am not certain about that. I can only tell you what I observed directly.",
        keywords: {
            fog: "I have been in that dome a hundred times. It fogs when the vents are closed — Mr. D'Souza does it sometimes when he smokes in there. I have never seen it fogged the next morning. The vents are usually opened again before night.",
            vent: "Kye — he was crouching near the external grille on the east side of the dome. Three weeks ago, perhaps a little more. He had a tool bag. I assumed he was dealing with the bird ingress problem. I did not ask. I should have mentioned it sooner.",
            shuk: "Actually — I have something. I recorded Shuk four days ago. He was doing a voice imitation. I sent it to the family chat. I can play it — do you want me to play it? That is Eliza. She is counting. Thirteen, twenty-one, thirty-four. And that sound at the end — that is the door keypad. Someone entered a code. After she stopped counting.",
            daisy: "She arranged them herself. I could see the pot marks where she had moved each one. She was precise about it. Her ruler was right there beside her. Small yellow one, plastic.",
            keypad: "I noticed the access counter showed two when I arrived. Not one — two. I mentioned it to the first officer who arrived.",
            cage: "The cage felt heavier than usual when I moved it. I mentioned that to one of the first officers.",
            smoke: "Mr. D'Souza closes the vents when he smokes in the dome. Has done for years. Since the first Mrs. D'Souza passed. It keeps the smell inside longer. I have never needed to tell him it was dangerous before. I did not know it could be.",
            ruler: "She always carried it. Small yellow one, plastic. She used it to measure the pot spacing.",
        }
    },
    eliot_dsouza: {
        greeting: "Eliza was in the sanctuary most mornings. She had her clipboards — she was always measuring something. I used to tease her about it. Miriam said she got it from me. Miriam was right, mostly.",
        generic: "I believe — I think — I'm not entirely certain about that. Today is not the clearest of days.",
        keywords: {
            vent: "I close the vents when I smoke in the dome. Yes. I always do that. The smoke stays longer. Miriam liked it. She would sit in there with me and we would — I don't remember if that was recently or.",
            smoke: "The Stellar's original Perique blend. I always use that one. My father started the company with that formula. Miriam loved the smell.",
            eliza: "She measured things. Came to the sanctuary every week. We have been feeding the birds together on Sundays since she was six years old. Since she was six.",
            miriam: "Miriam died four years ago. Pancreatic cancer, very fast. The sanctuary was hers as much as mine. She loved the birds. She said they knew when it was going to rain and she was usually right.",
            code: "Yes. Yes, that is my code. I close the vents sometimes when I smoke. That is — I believe I did do that yesterday evening. I remember the pipe.",
            inside: "I didn't know she was in there. I would never — I didn't know. I was sitting with Miriam. I close those vents to feel less alone.",
            shuk: "Shuk was a good bird. He imitated Eliza's voice perfectly. She thought it was funny. She would give him phrases to learn. I wonder what was the last thing he learned.",
            alone: "I close those vents to feel less alone. That is — I'm sorry. I'm so sorry.",
            sorry: "I didn't know she was in there. I thought I was just... keeping her a little longer. My wife. I'm so sorry. I'm so sorry.",
        }
    },
    dr_menon: {
        greeting: "You said there was new physical evidence relevant to the mechanism. Show me what you have.",
        generic: "The data supports — walk me through what you have and I will tell you what it changes.",
        keywords: {
            cardiac: "Standard presentation for a 24-year-old with no prior cardiac history. Uncommon but not impossible. I noted the blood oxygen saturation was slightly low. I had no mechanism to explain it further at the time.",
            oxygen: "The low blood oxygen now has a mechanism. Sealed ventilation in a glass dome. Combustion byproducts from the pipe smoke accelerating oxygen depletion. This is not a sign of cardiac failure — it was evidence of hypoxia I had no context to interpret.",
            tobacco: "Nornicotine and anabasine from Perique tobacco. Not on the standard panel — I would not test for those without cause. These alkaloids lower the arrhythmia threshold substantially under physiological stress.",
            alkaloid: "A supplemental alkaloid screen will tell us definitively. Based on fifteen days of consumption I would expect them to be present in the bloodstream.",
            infrasound: "19 Hz at maximum output creates thoracic resonance — the chest cavity becomes a resonance chamber. At high amplitude in a sealed environment, sustained exposure produces arrhythmic pressure on the heart. This is documented. Combined with the alkaloid sensitization — the threshold drops further.",
            speaker: "The low blood oxygen reading I noted is now consistent with a hypoxic environment, not cardiac failure as primary cause. This changes the pathophysiology entirely.",
            mechanism: "Perique alkaloid sensitization — fifteen days — lowering the cardiac arrhythmia threshold. Sustained infrasound at maximum amplitude inducing thoracic resonance. Sealed environment with depleting oxygen. Each factor alone: insufficient for death in a healthy young adult. Combined, in sequence, in a sealed glass dome: the mechanism is clear. This is not natural death. I will amend the certificate.",
            murder: "I can tell you the mechanism. Murder or manslaughter is your designation. What I can tell you is that at least one of the contributing factors was deliberately introduced by someone who knew, or should have known, the effect.",
            amend: "I signed the finding in good faith. The standard panel found nothing. The new evidence changes the mechanism. I will amend.",
            eliza: "A 24-year-old botanist, alone in a glass dome, counting petals she knew were wrong, with no idea what was happening to her body. The amended report will reflect all of this.",
        }
    }
};

const getFallbackResponse = (suspectId, query) => {
    const data = FALLBACK[suspectId];
    if (!data) return "I have nothing further to say.";
    const q = query.toLowerCase();
    for (const [kw, resp] of Object.entries(data.keywords)) {
        if (q.includes(kw)) return resp;
    }
    return data.generic;
};

/* ═══════════════════════════════════════════════════════════
   NPC DEFINITIONS
   agentId must exactly match name= in the Python agent files
═══════════════════════════════════════════════════════════ */
const NPCS = {
    dsouza: { id: 'dsouza', agentId: 'dsouza', name: "Arthur D'Souza", role: 'Estate Owner / Husband', photo: '/images/dsouza.png', tag: 'SUSPECT' },
    mary: { id: 'mary', agentId: 'mary', name: 'Mary', role: 'Head Maid', photo: '/images/maid.png', tag: 'SUSPECT' },
    kye: { id: 'kye', agentId: 'kye_harlan', name: 'Kye Harlan', role: "Eliza's Fiancé / Composer", photo: '/images/kye.png', tag: 'SUSPECT' },
    carl: { id: 'carl', agentId: 'carl_dsouza', name: 'Carl D’Souza', role: "Eliza's Brother / Smuggler", photo: '/images/carl.png', tag: 'SUSPECT' },
    waltz: { id: 'waltz', agentId: 'professor_aldous_waltz', name: 'Prof. Waltz', role: 'Botanist / Academic', photo: '/images/waltz.png', tag: 'SUSPECT' },
    kara: { id: 'kara', agentId: 'kara_voss', name: 'Kara Voss', role: "Eliza's Best Friend", photo: '/images/kara.png', tag: 'WITNESS' },
    vince_okafor: { id: 'vince_okafor', agentId: 'vince_okafor', name: 'Vince Okafor', role: 'Sound Engineer', photo: '/images/vince.png', tag: 'WITNESS' },
    rina_soares: { id: 'rina_soares', agentId: 'rina_soares', name: 'Rina Soares', role: 'Family Housekeeper', photo: '/images/rina.png', tag: 'WITNESS' },
    eliot_dsouza: { id: 'eliot_dsouza', agentId: 'eliot_dsouza', name: "Eliot D'Souza", role: "Eliza's Father / The Stellar", photo: '/images/eliot.png', tag: 'WITNESS' },
    dr_menon: { id: 'dr_menon', agentId: 'dr_priya_menon', name: 'Dr. Priya Menon', role: 'Medical Examiner', photo: '/images/menon.png', tag: 'WITNESS' },
};

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
const InterrogationRoom = ({ evidenceItems, onEvidenceFound }) => {
    const [selectedId, setSelectedId] = useState('dsouza');
    const [sessions, setSessions] = useState({});
    const [agentStatus, setAgentStatus] = useState({});
    const [chatHistories, setChatHistories] = useState(
        Object.fromEntries(Object.keys(NPCS).map(id => [id, []]))
    );
    const [userInput, setUserInput] = useState('');
    const [suspicionLevels, setSuspicionLevels] = useState(
        Object.fromEntries(Object.keys(NPCS).map(id => [id, 1]))
    );
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    const current = NPCS[selectedId];
    const chatHistory = chatHistories[selectedId];
    const suspicion = suspicionLevels[selectedId];
    const status = agentStatus[selectedId] || 'connecting';

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current)
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chatHistory, isTyping]);

    // Initialize agent session on NPC selection
    const initSession = useCallback(async (npcId) => {
        if (sessions[npcId] !== undefined) return;
        setSessions(prev => ({ ...prev, [npcId]: null }));

        const agentId = NPCS[npcId].agentId;
        const sessionId = await createSession(agentId);
        setSessions(prev => ({ ...prev, [npcId]: sessionId }));

        const connected = sessionId !== null;
        setAgentStatus(prev => ({ ...prev, [npcId]: connected ? 'connected' : 'fallback' }));

        appendChat(npcId, 'suspect', FALLBACK[npcId]?.greeting ?? "I am ready to speak.");
    }, [sessions]);

    useEffect(() => { initSession(selectedId); }, [selectedId]);

    // Send detective's question
    const handleSend = async () => {
        if (!userInput.trim() || isTyping) return;
        const query = userInput.trim();
        setUserInput('');
        appendChat(selectedId, 'detective', query);
        setIsTyping(true);

        let response = null;
        const sessionId = sessions[selectedId];
        if (sessionId) {
            response = await sendMessage(current.agentId, sessionId, query);
        }
        if (!response) {
            await new Promise(r => setTimeout(r, 900));
            response = getFallbackResponse(selectedId, query);
        }

        appendChat(selectedId, 'suspect', response);
        setIsTyping(false);

        // ── EVIDENCE UNLOCK LOGIC ──────────────────────────────────
        // Certain NPC + keyword combinations unlock new evidence items
        const q = query.toLowerCase();
        const unlockMap = [
            // Vince: asking about the speaker/equipment unlocks the infrasound emitter card
            { npc: 'vince_okafor', keywords: ['speaker', 'subwoofer', 'equipment', 'log', 'calibration'], evidence: 'speaker' },
            // Waltz: his tea/notebook confession unlocks the tobacco evidence
            { npc: 'waltz', keywords: ['tea', 'notebook', 'tobacco', 'preparation', 'chamomile'], evidence: 'tobacco' },
            // Rina: asking about Shuk / the recording unlocks the SD card
            { npc: 'rina_soares', keywords: ['shuk', 'recording', 'phone', 'counting'], evidence: 'sdcard' },
            // Kye: breaking him on audio unlocks the SD card recording
            { npc: 'kye', keywords: ['audio', 'recording', 'counting', 'help'], evidence: 'sdcard' },
            // Waltz / Dr Menon: asking about the diary unlocks it
            { npc: 'waltz', keywords: ['diary'], evidence: 'diary' },
        ];
        unlockMap.forEach(({ npc, keywords, evidence }) => {
            if (selectedId === npc && keywords.some(k => q.includes(k))) {
                onEvidenceFound?.(evidence);
            }
        });

        // Raise suspicion on sharp keywords
        const triggers = ['murder', 'kill', 'vent', 'tobacco', 'speaker', 'diary', 'frequency', 'cardiac', 'lie', 'calibration'];
        if (triggers.some(w => query.toLowerCase().includes(w))) {
            setSuspicionLevels(prev => ({ ...prev, [selectedId]: Math.min(prev[selectedId] + 1, 5) }));
        }
    };

    // Present evidence
    const presentEvidence = async (ev) => {
        const labels = {
            tobacco: 'Perique Tobacco Residue',
            speaker: 'Military-Grade Infrasound Emitter',
            diary: "Eliza's Locked Diary",
            autopsy: 'Autopsy Report',
            sdcard: 'Micro SD Recording'
        };
        const label = labels[ev] || ev;
        const prompt = `[Detective places evidence on the table]: "${label}" — explain this.`;
        appendChat(selectedId, 'detective', `📁 PRESENTING EVIDENCE: ${label}`);
        setIsTyping(true);

        let response = null;
        const sessionId = sessions[selectedId];
        if (sessionId) {
            response = await sendMessage(current.agentId, sessionId, prompt);
        }
        if (!response) {
            await new Promise(r => setTimeout(r, 1200));
            response = getFallbackResponse(selectedId, ev);
        }

        appendChat(selectedId, 'suspect', response);
        setIsTyping(false);
        setSuspicionLevels(prev => ({ ...prev, [selectedId]: Math.min(prev[selectedId] + 1, 5) }));
    };

    const appendChat = (npcId, role, text) => {
        setChatHistories(prev => ({ ...prev, [npcId]: [...prev[npcId], { role, text }] }));
    };

    const statusColor = { connected: '#2ecc71', fallback: '#e67e22', connecting: '#7f8c8d' };
    const isSuspect = current.tag === 'SUSPECT';

    return (
        <div className="ir-container">
            <div className="ir-vignette" />
            <div className="ir-grain" />

            <div className="ir-layout">
                {/* ── LEFT: DOSSIER ── */}
                <div className="ir-left-panel">
                    <div className="ir-card-header">
                        {current.tag === 'WITNESS' ? 'WITNESS FILE' : 'SUSPECT DOSSIER'}
                    </div>
                    <div className="ir-suspect-card">
                        <div className="ir-photo-wrap">
                            <img src={current.photo} alt={current.name} className="ir-photo" />
                            <div className="ir-tape"></div>
                        </div>
                        <div className="ir-suspect-info">
                            <div className="ir-name">{current.name}</div>
                            <div className="ir-role">{current.role}</div>

                            <div className="ir-agent-status" style={{ borderColor: statusColor[status] }}>
                                <span className="ir-status-dot" style={{ background: statusColor[status] }}></span>
                                {status === 'connected' ? 'AI AGENT LIVE' : status === 'fallback' ? 'SCRIPTED MODE' : 'CONNECTING...'}
                            </div>

                            {isSuspect && (
                                <div className="ir-suspicion-section">
                                    <span className="ir-label">SUSPICION LEVEL</span>
                                    <div className="ir-meter">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`ir-meter-block ${i < suspicion ? 'filled' : ''}`}></div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="ir-notes-area">
                        <div className="ir-notes-title">CASE NOTES</div>
                        <div className="ir-notes-content">
                            {selectedId === 'dsouza' && evidenceItems.includes('tobacco') && (
                                <div className="ir-note-tag">🚬 Tobacco Residue matches brand</div>
                            )}
                            {selectedId === 'dsouza' && evidenceItems.includes('diary') && (
                                <div className="ir-note-tag">📓 Conflicts over Eliza's estate</div>
                            )}
                            {selectedId === 'mary' && evidenceItems.includes('speaker') && (
                                <div className="ir-note-tag">🔊 Had access to ventilation shafts</div>
                            )}
                            {selectedId === 'kye' && (
                                <div className="ir-note-tag">💍 Eliza's fiancé — last to see her</div>
                            )}
                            {selectedId === 'kye' && evidenceItems.includes('speaker') && (
                                <div className="ir-note-tag">🔧 Equipment traced to his production account</div>
                            )}
                            {selectedId === 'vince_okafor' && (
                                <div className="ir-note-tag">📦 Sourced 19Hz subwoofer units for Kye</div>
                            )}
                            {selectedId === 'vince_okafor' && (
                                <div className="ir-note-tag">📄 Has equipment log & calibration doc</div>
                            )}
                            {selectedId === 'rina_soares' && (
                                <div className="ir-note-tag">🔍 Found Eliza & Shuk at 10:00 AM</div>
                            )}
                            {selectedId === 'rina_soares' && (
                                <div className="ir-note-tag">📱 Has phone recording of Shuk mimicking Eliza</div>
                            )}
                            <div className="ir-note-tag">🏷 {current.tag}</div>
                        </div>
                    </div>
                </div>

                {/* ── CENTER: CHAT ── */}
                <div className="ir-center-panel">
                    <div className="ir-chat-header">
                        {current.tag === 'WITNESS' ? 'WITNESS INTERVIEW' : 'INTERROGATION'}: {current.name.toUpperCase()}
                    </div>
                    <div className="ir-chat-window" ref={scrollRef}>
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`ir-bubble-wrapper ${msg.role}`}>
                                <div className="ir-bubble">
                                    <span className="ir-speaker">
                                        {msg.role === 'suspect' ? current.name : 'DETECTIVE'}:
                                    </span>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="ir-bubble-wrapper suspect typing">
                                <div className="ir-bubble"><span className="ir-dots">...</span></div>
                            </div>
                        )}
                    </div>
                    <div className="ir-input-area">
                        <input
                            type="text"
                            placeholder={`Ask ${current.name.split(' ')[0]} a question...`}
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            disabled={isTyping}
                        />
                        <button className="ir-send-btn" onClick={handleSend} disabled={isTyping}>
                            {isTyping ? '...' : current.tag === 'WITNESS' ? 'ASK' : 'QUESTION'}
                        </button>
                    </div>
                </div>

                {/* ── RIGHT: EVIDENCE + NPC SELECTOR ── */}
                <div className="ir-right-panel">
                    <div className="ir-evidence-header">PRESENT EVIDENCE</div>
                    <div className="ir-evidence-grid">
                        {evidenceItems.length === 0 && <div className="ir-empty">No evidence collected...</div>}
                        {evidenceItems.map((item, i) => (
                            <div key={i} className="ir-evidence-card" onClick={() => presentEvidence(item)}>
                                <div className="ir-ev-icon">
                                    {item === 'speaker' ? '🔊' : item === 'diary' ? '📓' : item === 'tobacco' ? '🚬' : item === 'autopsy' ? '📋' : item === 'sdcard' ? '💾' : '🔍'}
                                </div>
                                <div className="ir-ev-name">
                                    {item === 'speaker' ? 'EMITTER' : item === 'diary' ? 'DIARY' : item === 'tobacco' ? 'TOBACCO' : item === 'autopsy' ? 'AUTOPSY' : item === 'sdcard' ? 'SD CARD' : item.toUpperCase()}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="ir-suspect-selector">
                        <div className="ir-label" style={{ marginBottom: '0.5rem' }}>SWITCH TARGET</div>
                        <div className="ir-selector-btns">
                            {Object.values(NPCS).map(s => (
                                <button
                                    key={s.id}
                                    className={`${selectedId === s.id ? 'active' : ''} ${s.tag === 'WITNESS' ? 'witness-btn' : ''}`}
                                    onClick={() => setSelectedId(s.id)}
                                    title={`${s.name} — ${s.role}`}
                                >
                                    {s.name.split(' ')[0].toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterrogationRoom;
