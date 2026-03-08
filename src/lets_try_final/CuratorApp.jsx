import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CinematicIntro from './components/CinematicIntro'
import Dashboard from './components/Dashboard'
import InterrogationRoom from './components/InterrogationRoom'
import EvidenceBoard from './components/EvidenceBoard'
import CrimeMap from './components/CrimeMap'
import SecurityFootageViewer from './components/SecurityFootageViewer'
import DeductionBoard from './components/DeductionBoard'
import SuspectsBoard from './components/SuspectsBoard'
import DetectiveNotebook, { NotebookButton, CASE_FACTS, discoverFacts as discoverFactsFromText } from './components/DetectiveNotebook'
import soundEngine from './utils/SoundEngine'
import './index.css'

/*
  SCREEN FLOW:
  'intro'          → Cinematic opening sequence
  'dashboard'      → Detective command center
  'crime-map'      → 3D crime scene map + forensic reports
  'evidence-board' → Evidence board with red strings
  'suspect-database' → Classified suspect dossiers
  'interrogation'  → Interrogation room for selected suspect
  'security-footage' → CCTV viewer
  'deduction'      → Final accusation / deduction board
*/

/* ═══════════════════════════════════════════════════════
   CURRENT OBJECTIVE — tracks what the player should do
═══════════════════════════════════════════════════════ */
const OBJECTIVES = {
  'dashboard': { text: 'Review case files and choose your next move', hint: 'Select a suspect to interrogate or examine evidence' },
  'interrogation': { text: 'Extract the truth from the suspect', hint: 'Present evidence when their story contradicts the facts' },
  'suspect-database': { text: 'Review classified suspect dossiers', hint: 'Analyze threat levels and known intel' },
  'evidence-board': { text: 'Connect the evidence and find contradictions', hint: 'Red strings link suspects to key evidence' },
  'crime-map': { text: 'Survey the crime scene and surrounding locations', hint: 'Look for forensic markers and witness positions' },
  'security-footage': { text: 'Review surveillance footage for anomalies', hint: 'Flagged feeds contain critical evidence' },
  'deduction': { text: 'Make your final accusation', hint: 'Choose carefully — you only get one shot' },
}

/* ═══════════════════════════════════════════════════════
   SCREEN TRANSITION — cinematic wipe between scenes
═══════════════════════════════════════════════════════ */
const screenVariants = {
  initial: { opacity: 0, scale: 1.03, filter: 'brightness(0)' },
  animate: { opacity: 1, scale: 1, filter: 'brightness(1)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.97, filter: 'brightness(0)', transition: { duration: 0.4, ease: 'easeIn' } },
}

/* ═══════════════════════════════════════════════════════
   GAME HUD — always-visible overlay
═══════════════════════════════════════════════════════ */
function GameHUD({ screen, objective, onPause }) {
  if (screen === 'intro') return null;
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 500, fontFamily: "'Special Elite', monospace" }}>
      {/* Top-left: Current objective */}
      <motion.div
        key={screen}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{ position: 'absolute', top: 16, left: 20 }}
      >
        <div style={{ fontSize: '0.38rem', letterSpacing: '0.4em', color: 'rgba(201,168,76,0.35)', marginBottom: 3 }}>
          CURRENT OBJECTIVE
        </div>
        <div style={{ fontSize: '0.65rem', color: 'rgba(201,168,76,0.7)', letterSpacing: '0.08em', maxWidth: 320 }}>
          {objective?.text}
        </div>
        <div style={{ fontSize: '0.42rem', color: 'rgba(245,234,214,0.2)', marginTop: 3, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>
          {objective?.hint}
        </div>
      </motion.div>

      {/* Top-right: Pause hint */}
      <div style={{
        position: 'absolute', top: 16, right: 20,
        display: 'flex', alignItems: 'center', gap: 6,
        pointerEvents: 'auto',
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPause}
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4, padding: '4px 10px',
            display: 'flex', alignItems: 'center', gap: 5,
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
        >
          <span className="keybind">ESC</span>
          <span style={{ fontSize: '0.4rem', letterSpacing: '0.2em', color: 'rgba(245,234,214,0.3)' }}>MENU</span>
        </motion.button>
      </div>

      {/* Bottom-center: Location label */}
      <motion.div
        key={`loc-${screen}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{
          position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          fontSize: '0.38rem', letterSpacing: '0.5em',
          color: 'rgba(201,168,76,0.2)',
          textTransform: 'uppercase',
        }}
      >
        {screen === 'dashboard' && '█ PRECINCT — CASE COMMAND'}
        {screen === 'interrogation' && '█ INTERROGATION ROOM B'}
        {screen === 'evidence-board' && '█ EVIDENCE LOCKUP'}
        {screen === 'suspect-database' && '█ CLASSIFIED DATABASE'}
        {screen === 'crime-map' && '█ CRIME SCENE — MANHATTAN'}
        {screen === 'security-footage' && '█ SURVEILLANCE CENTER'}
        {screen === 'deduction' && '█ FINAL DELIBERATION'}
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   PAUSE MENU — ESC overlay
═══════════════════════════════════════════════════════ */
function PauseMenu({ onResume, onDashboard }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1.5rem',
        fontFamily: "'Special Elite', monospace",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: '2rem', fontWeight: 700,
          color: '#d4bc8b', textShadow: '0 0 30px rgba(201,168,76,0.3)',
          marginBottom: 4,
        }}>
          PAUSED
        </div>
        <div style={{ fontSize: '0.5rem', letterSpacing: '0.5em', color: 'rgba(201,168,76,0.3)' }}>
          THE MIDNIGHT CURATOR — CASE #DAI-006
        </div>
      </motion.div>

      {[
        { label: 'RESUME INVESTIGATION', key: 'ESC', onClick: onResume },
        { label: 'RETURN TO DASHBOARD', key: 'D', onClick: onDashboard },
      ].map((item, i) => (
        <motion.button
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          whileHover={{ scale: 1.03, borderColor: 'rgba(201,168,76,0.5)', background: 'rgba(201,168,76,0.08)' }}
          whileTap={{ scale: 0.97 }}
          onClick={item.onClick}
          style={{
            width: 320, padding: '14px 20px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'all 0.3s',
          }}
        >
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(245,234,214,0.7)' }}>
            {item.label}
          </span>
          <span className="keybind">{item.key}</span>
        </motion.button>
      ))}

      <div style={{ marginTop: '2rem', fontSize: '0.38rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.1)' }}>
        v1.0.0 — BUILT WITH GEMINI AI
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════
   LOADING SCREEN — between area transitions
═══════════════════════════════════════════════════════ */
function LoadingScreen({ targetScreen }) {
  const labels = {
    'dashboard': 'ENTERING PRECINCT...',
    'suspect-database': 'ACCESSING CLASSIFIED RECORDS...',
    'interrogation': 'PREPARING INTERROGATION...',
    'evidence-board': 'OPENING EVIDENCE LOCKUP...',
    'crime-map': 'LOADING CRIME SCENE...',
    'security-footage': 'CONNECTING TO SURVEILLANCE...',
    'deduction': 'ENTERING DELIBERATION...',
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 8000,
        background: '#020201',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <div style={{
        fontFamily: "'Special Elite', monospace",
        fontSize: '0.5rem', letterSpacing: '0.5em',
        color: 'rgba(201,168,76,0.5)',
      }}>
        {labels[targetScreen] || 'LOADING...'}
      </div>
      {/* Loading bar */}
      <div style={{ width: 200, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #d4bc8b, rgba(201,168,76,0.5))',
            boxShadow: '0 0 10px rgba(201,168,76,0.4)',
          }}
        />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN APP — Game Shell
═══════════════════════════════════════════════════════ */
function CuratorApp() {
  const [screen, setScreen] = useState('intro')
  const [activeSuspect, setActiveSuspect] = useState('marcus_chen')
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadTarget, setLoadTarget] = useState('')
  const [discoveredFacts, setDiscoveredFacts] = useState(['cause_of_death']) // Start with only the initial finding
  const [discoveredEvidence, setDiscoveredEvidence] = useState(['teacup', 'origami_crane'])
  const [userNotes, setUserNotes] = useState('')
  const [isNotebookOpen, setIsNotebookOpen] = useState(false)

  // Auto-discover facts from personal notes
  useEffect(() => {
    if (!userNotes) return;
    const newFactIds = discoverFactsFromText(userNotes, discoveredFacts);
    if (newFactIds.length > 0) {
      newFactIds.forEach(fid => addDiscoveredFact(fid));
    }
  }, [userNotes, discoveredFacts]);

  const addDiscoveredFact = useCallback((factId) => {
    setDiscoveredFacts(prev => {
      if (prev.includes(factId)) return prev
      soundEngine.playDiscovery()
      return [...prev, factId]
    })
  }, [])

  const addDiscoveredEvidence = useCallback((evidenceId) => {
    setDiscoveredEvidence(prev => {
      if (prev.includes(evidenceId)) return prev
      soundEngine.playEvidenceSlam()
      return [...prev, evidenceId]
    })
  }, [])

  const incrementQuestions = () => setTotalQuestions(q => q + 1)

  // Transition with loading screen
  const transitionTo = useCallback((targetScreen) => {
    if (targetScreen === screen) return
    soundEngine.init()
    soundEngine.resume()
    soundEngine.playSelect()
    setLoadTarget(targetScreen)
    setLoading(true)
    setTimeout(() => {
      setScreen(targetScreen)
      setLoading(false)
      window.scrollTo(0, 0) // Explicitly reset any browser-level scroll
    }, 600)
  }, [screen])

  const goInterrogate = useCallback((suspectId) => {
    setActiveSuspect(suspectId)
    transitionTo('interrogation')
  }, [transitionTo])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (screen === 'intro') return
        setPaused(p => !p)
      }
      if (paused && e.key.toLowerCase() === 'd') {
        setPaused(false)
        transitionTo('dashboard')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [screen, paused, transitionTo])

  // Reset scroll on screen change (secondary safety)
  useEffect(() => {
    window.scrollTo(0, 0)
    document.body.scrollTop = 0
  }, [screen])

  const objective = OBJECTIVES[screen]
  const contradictionCount = CASE_FACTS.filter(f => discoveredFacts.includes(f.id) && f.isContradiction).length

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      {/* ── Game HUD ── */}
      <GameHUD screen={screen} objective={objective} onPause={() => setPaused(true)} />

      {/* ── Notebook Toggle & View ── */}
      {screen !== 'intro' && (
        <NotebookButton
          discoveredCount={discoveredFacts.length}
          contradictionCount={contradictionCount}
          onClick={() => {
            soundEngine.init();
            soundEngine.playSelect();
            setIsNotebookOpen(!isNotebookOpen);
          }}
        />
      )}
      <AnimatePresence>
        {isNotebookOpen && (
          <DetectiveNotebook
            discoveredFacts={discoveredFacts}
            userNotes={userNotes}
            onUpdateNotes={setUserNotes}
            onClose={() => setIsNotebookOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Pause Menu ── */}
      <AnimatePresence>
        {paused && (
          <PauseMenu
            onResume={() => setPaused(false)}
            onDashboard={() => { setPaused(false); transitionTo('dashboard') }}
          />
        )}
      </AnimatePresence>

      {/* ── Loading screen ── */}
      <AnimatePresence>
        {loading && <LoadingScreen targetScreen={loadTarget} />}
      </AnimatePresence>

      {/* ── Screen content with transitions ── */}
      <AnimatePresence mode="wait">
        {screen === 'intro' && (
          <motion.div key="intro" {...screenVariants} style={{ position: 'absolute', inset: 0 }}>
            <CinematicIntro onComplete={() => transitionTo('dashboard')} />
          </motion.div>
        )}

        {screen === 'dashboard' && (
          <motion.div key="dashboard" {...screenVariants} style={{ position: 'absolute', inset: 0 }}>
            <Dashboard
              discoveredFacts={discoveredFacts}
              discoveredEvidence={discoveredEvidence}
              onNavigate={(screenId) => transitionTo(screenId)}
              onInterrogate={goInterrogate}
            />
          </motion.div>
        )}

        {screen === 'suspect-database' && (
          <motion.div key="suspect-database" {...screenVariants} style={{ position: 'absolute', inset: 0 }}>
            <SuspectsBoard
              onBack={() => transitionTo('dashboard')}
              onInterrogate={goInterrogate}
            />
          </motion.div>
        )}

        {screen === 'interrogation' && (
          <motion.div key="interrogation" {...screenVariants} style={{ position: 'absolute', inset: 0 }}>
            <InterrogationRoom
              suspectId={activeSuspect}
              onBack={() => transitionTo('dashboard')}
              onQuestionAsked={incrementQuestions}
              onFactDiscovered={addDiscoveredFact}
              onEvidenceDiscovered={addDiscoveredEvidence}
              discoveredFacts={discoveredFacts}
              discoveredEvidence={discoveredEvidence}
              userNotes={userNotes}
              onUpdateNotes={setUserNotes}
            />
          </motion.div>
        )}

        {screen === 'deduction' && (
          <motion.div key="deduction" {...screenVariants} style={{ position: 'absolute', inset: 0 }}>
            <DeductionBoard
              totalQuestions={totalQuestions}
              discoveredFacts={discoveredFacts}
              discoveredEvidence={discoveredEvidence}
              onBack={() => transitionTo('dashboard')}
            />
          </motion.div>
        )}

        {screen === 'evidence-board' && (
          <motion.div key="evidence-board" {...screenVariants} style={{ position: 'absolute', inset: 0 }}>
            <EvidenceBoard
              discoveredFacts={discoveredFacts}
              discoveredEvidence={discoveredEvidence}
              onInterrogate={goInterrogate}
              onBack={() => transitionTo('dashboard')}
            />
          </motion.div>
        )}

        {screen === 'crime-map' && (
          <motion.div key="crime-map" {...screenVariants} style={{ position: 'absolute', inset: 0 }}>
            <CrimeMap
              onBack={() => transitionTo('dashboard')}
              onEvidenceDiscovered={addDiscoveredEvidence}
              discoveredEvidence={discoveredEvidence}
            />
          </motion.div>
        )}

        {screen === 'security-footage' && (
          <motion.div key="security-footage" {...screenVariants} style={{ position: 'absolute', inset: 0 }}>
            <SecurityFootageViewer
              onBack={() => transitionTo('dashboard')}
              onEvidenceDiscovered={addDiscoveredEvidence}
              discoveredEvidence={discoveredEvidence}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CuratorApp
