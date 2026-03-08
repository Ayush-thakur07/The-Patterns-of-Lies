import React, { useState } from 'react';
import './index.css';
import Prologue from './Prologue';
import Chapter1 from './Chapter1';
import SanctuaryScene from './SanctuaryScene';
import DiaryViewer from './DiaryViewer';
import DetectiveRoom from './DetectiveRoom';
import InterrogationRoom from './InterrogationRoom';
import DeductionBoard from './DeductionBoard';
import SuspectsBoard from './SuspectsBoard';
import EndingCinematic from './EndingCinematic';

function DaisyApp() {
  const [gamePhase, setGamePhase] = useState('prologue');
  const [hubTab, setHubTab] = useState('board');         // board | interrogate | suspects | deduction
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [evidenceItems, setEvidenceItems] = useState([]); // grows as player finds clues
  const [userNotes, setUserNotes] = useState('');

  // Called by SanctuaryScene when player collects evidence
  const addEvidence = (id) => {
    setEvidenceItems(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const handleRestart = () => {
    setGamePhase('prologue');
    setHubTab('board');
    setDiaryOpen(false);
    setEvidenceItems([]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative' }}>

      {/* ── 1. Prologue ── */}
      {gamePhase === 'prologue' && (
        <Prologue onComplete={() => setGamePhase('chapter1')} />
      )}

      {/* ── 2. Chapter 1 — Maid cinematic + Crime Scene + Investigation Hub ── */}
      {gamePhase === 'chapter1' && (
        <Chapter1
          onComplete={() => setGamePhase('main')}
          onSolve={() => setGamePhase('ending')}
        />
      )}

      {/* ── 3. Sanctuary cinematic ── */}
      {gamePhase === 'sanctuary' && (
        <SanctuaryScene
          onComplete={() => setGamePhase('main')}
          onEvidenceFound={addEvidence}
        />
      )}

      {/* ── 4. MAIN INVESTIGATION HUB ── */}
      {gamePhase === 'main' && (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#08060a' }}>

          {/* TOP NAV BAR */}
          <nav style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '52px',
            background: 'linear-gradient(to bottom, #0a0705, transparent)',
            borderBottom: '1px solid rgba(183,143,47,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.25rem', zIndex: 50, padding: '0 2rem',
          }}>
            {[
              { id: 'board', label: 'EVIDENCE BOARD' },
              { id: 'suspects', label: 'SUSPECTS' },
              { id: 'interrogate', label: 'INTERROGATE' },
              { id: 'deduction', label: 'DEDUCTION' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setHubTab(tab.id)}
                style={{
                  background: hubTab === tab.id ? 'rgba(183,143,47,0.15)' : 'transparent',
                  border: '1px solid',
                  borderColor: hubTab === tab.id ? '#b78f2f' : 'rgba(183,143,47,0.15)',
                  color: hubTab === tab.id ? '#d4bc8b' : '#5a5040',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  padding: '0.45rem 1.4rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                }}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={() => setDiaryOpen(true)}
              style={{
                position: 'absolute', right: '2rem',
                background: 'transparent',
                border: '1px solid rgba(183,143,47,0.2)',
                color: '#7a6f52',
                fontFamily: 'Cinzel, serif', fontSize: '0.6rem',
                letterSpacing: '0.15em', padding: '0.4rem 0.9rem',
                cursor: 'pointer',
              }}
            >
              📓 JOURNAL
            </button>
          </nav>

          {/* TAB CONTENT (fills below nav) */}
          <div style={{ position: 'absolute', top: '52px', inset: '52px 0 0 0', overflow: 'hidden' }}>
            {hubTab === 'board' && (
              <DetectiveRoom
                evidenceItems={evidenceItems}
                onBack={() => setGamePhase('sanctuary')}
                onOpenDiary={() => setDiaryOpen(true)}
              />
            )}
            {hubTab === 'suspects' && (
              <SuspectsBoard evidenceItems={evidenceItems} />
            )}
            {hubTab === 'interrogate' && (
              <InterrogationRoom
                evidenceItems={evidenceItems}
                onEvidenceFound={addEvidence}
              />
            )}
            {hubTab === 'deduction' && (
              <DeductionBoard
                evidenceItems={evidenceItems}
                onBack={() => setHubTab('board')}
                onAccuse={(suspectId) => {
                  // Trigger ending cinematic when player correctly accuses Kye
                  setGamePhase('ending');
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* ── 5. ENDING CINEMATIC ── */}
      {gamePhase === 'ending' && (
        <EndingCinematic
          accusedSuspect="kye"
          onRestart={handleRestart}
        />
      )}

      {/* DiaryViewer — modal overlay, any phase */}
      <DiaryViewer
        isOpen={diaryOpen}
        onClose={() => setDiaryOpen(false)}
        userNotes={userNotes}
        onUpdateNotes={setUserNotes}
        onEvidenceDiscovered={addEvidence}
      />
    </div>
  );
}

export default DaisyApp;
