import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DaisyApp from './DaisyApp';
import CuratorApp from './lets_try_final/CuratorApp';
import './index.css';

function MainLauncher() {
    const [selectedGame, setSelectedGame] = useState(null);
    const [hoveredGame, setHoveredGame] = useState(null);

    if (selectedGame === 'daisy') return <DaisyApp />;
    if (selectedGame === 'curator') return <CuratorApp />;


    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Base Background */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: "url('/images/back2.jpeg')",
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 1,
            }} />


            {/* Left/Right Clickable Areas */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 30 }}>
                {/* Left Half - Midnight Curator */}
                <div
                    onClick={() => setSelectedGame('curator')}
                    style={{ flex: 1, cursor: 'pointer' }}
                    title="Play The Midnight Curator"
                />

                {/* Right Half - Daisy & Fibonacci */}
                <div
                    onClick={() => setSelectedGame('daisy')}
                    style={{ flex: 1, cursor: 'pointer' }}
                    title="Play Daisy & Fibonacci"
                />
            </div>
        </div>
    );
}

export default MainLauncher;
