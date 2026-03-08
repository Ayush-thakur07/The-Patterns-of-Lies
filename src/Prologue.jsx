import React, { useState, useEffect, useRef } from 'react';
import './Prologue.css';

const WordWriter = ({ text, delay = 0, speed = 400 }) => {
    const words = text.split(" ");
    return (
        <>
            {words.map((word, i) => (
                <span
                    key={i}
                    className="word-writer-word"
                    style={{
                        animationDelay: `${delay + i * speed}ms`,
                    }}
                >
                    {word}{' '}
                </span>
            ))}
        </>
    );
};

const Prologue = ({ onComplete }) => {
    const [hasStarted, setHasStarted] = useState(false);
    const [phase, setPhase] = useState('black');
    const timersRef = useRef([]);

    useEffect(() => {
        if (!hasStarted) return;

        const sequence = [
            { t: 500, p: 'intro-text' },
            { t: 6000, p: 'scene1' },
            { t: 14000, p: 'scene2' },  // Diary
            { t: 22000, p: 'scene3' },  // Cara
            { t: 30000, p: 'scene4' },  // Daisy
            { t: 38000, p: 'title' },
        ];

        timersRef.current = sequence.map(({ t, p }) =>
            setTimeout(() => {
                setPhase(p);
            }, t)
        );

        return () => timersRef.current.forEach(clearTimeout);
    }, [hasStarted]);

    const handleSkip = () => {
        timersRef.current.forEach(clearTimeout);
        setPhase('title');
    };

    const handleBegin = () => {
        setPhase('black2');
        setTimeout(onComplete, 2000);
    };

    return (
        <div className="prologue-container">
            {!hasStarted && (
                <div className="prologue-overlay flex-col" style={{
                    zIndex: 1000,
                    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/bgg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}>
                    <button className="begin-button" onClick={() => setHasStarted(true)}>
                        CLICK TO START
                    </button>
                    <div className="italic-subtitle" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                        Sound Required
                    </div>
                </div>
            )}

            {/* Cinematic Letterbox Bars */}
            <div className="letterbox top"></div>
            <div className="letterbox bottom"></div>

            {/* Film Grain Overlay */}
            <div className="film-grain animate-grain"></div>

            {/* Cinematic Light Leak Overlay */}
            <div className="light-leak animate"></div>

            {/* Cinematic Floating Dust Motes */}
            <div className="dust-overlay"></div>

            {/* Skip Button */}
            {phase !== 'title' && phase !== 'black2' && (
                <button className="skip-button" onClick={handleSkip}>
                    SKIP PROLOGUE ⏭
                </button>
            )}

            {/* Main black background for transitions */}
            <div className={`prologue-overlay transition-bg ${(phase === 'black' || phase === 'black2') ? 'visible' : 'hidden'}`} style={{ transitionDuration: '2s', zIndex: 100, backgroundColor: 'rgba(0,0,0,0.8)' }}>
            </div>

            {/* MAIN BACKGROUND FOR INTRO TITLE */}
            <div className={`intro-bg-wrapper ${phase === 'intro-text' ? 'visible' : 'hidden'}`} style={{ zIndex: 80 }}>
                <img className={`intro-bg-image ${phase === 'intro-text' ? 'animate' : ''}`} src="/images/prologue_bg.png" alt="" />
                <div className="bg-darken-overlay"></div>
            </div>

            {/* INTRO TEXT SCREEN (Modeled after the Midnight Curator aesthetic) */}
            <div className={`prologue-overlay flex-col ${phase === 'intro-text' ? 'visible' : 'hidden'}`} style={{ transitionDuration: '2s', zIndex: 90 }}>
                <div className="suspect-overline">CHAPTER I &nbsp;—&nbsp; THE LAST AFTERNOON</div>
                <h1 className="cinematic-serif gold-text">PROLOGUE</h1>
                <div className="italic-subtitle">The city is drowning in gold.</div>
                <div className="italic-subtitle">She has three days left to live.</div>
            </div>

            {/* FINAL TITLE SCREEN BACKGROUND */}
            <div className={`intro-bg-wrapper ${phase === 'title' ? 'visible' : 'hidden'}`} style={{ zIndex: 85 }}>
                <img className={`intro-bg-image ${phase === 'title' ? 'animate' : ''}`} src="/images/back.jpeg" alt="" />
                <div className="bg-darken-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}></div>
            </div>

            {/* FINAL TITLE SCREEN */}
            <div className={`prologue-overlay flex-col ${phase === 'title' ? 'visible' : 'hidden'}`} style={{ transitionDuration: '3s', zIndex: 90 }}>
                <div className="suspect-overline">THE SEQUENCE IS BROKEN</div>
                <h1 className="cinematic-serif gold-text giant">DAISY<br />&<br />FIBONACCI</h1>

                <div className="italic-subtitle" style={{ marginTop: '1.5rem' }}>
                    Age 24. Botanist.
                </div>
                <div className="italic-subtitle">
                    Her last word was a number.
                </div>

                <div className={`red-banner fade-in-delayed ${phase === 'title' ? 'animate' : ''}`}>
                    ⭔ MOTIVE: NATURE DOES NOT MAKE MISTAKES.
                </div>

                <div className={`fade-in-delayed-long ${phase === 'title' ? 'animate' : ''}`}>
                    <button className="begin-button" onClick={handleBegin}>
                        ▶ BEGIN INVESTIGATION
                    </button>
                </div>
            </div>

            {/* Scene 1: Bus Interior */}
            <div className={`scene-wrapper camera-float ${phase === 'scene1' ? 'visible' : (phase === 'intro-text' || phase === 'black' ? 'hidden' : 'hidden-slow')}`} style={{ zIndex: 1 }}>
                <img className={`scene-image ken-burns ${phase === 'scene1' ? 'animate' : ''}`} src="/images/img1.jpg" alt="" />
                <div className={`subtle-text ${phase === 'scene1' ? 'visible' : 'hidden'}`}>
                    <p>{phase === 'scene1' && <WordWriter text="Some patterns are eternal." delay={1000} speed={400} />}</p>
                </div>
            </div>

            {/* Scene 2: Diary Final (Moved to 2nd position) */}
            <div className={`scene-wrapper camera-float-slow ${phase === 'scene2' ? 'visible' : 'hidden'}`} style={{ zIndex: 2 }}>
                <img className={`scene-image slow-push-in ${phase === 'scene2' ? 'animate' : ''}`} src="/images/img2.jpg" alt="" style={{ objectFit: 'cover' }} />
                <div className="dark-vignette"></div>
                <div className="fibonacci-sequence">
                    {phase === 'scene2' && (
                        <>
                            <span className="fib-num fib-1">1</span>
                            <span className="fib-num fib-2">1</span>
                            <span className="fib-num fib-3">2</span>
                            <span className="fib-num fib-4">3</span>
                            <span className="fib-num fib-5">5</span>
                            <span className="fib-num fib-6">8</span>
                            <span className="fib-num fib-7">13</span>
                        </>
                    )}
                </div>
                <div className={`subtle-text final-text ${phase === 'scene2' ? 'visible' : 'hidden'}`}>
                    <p>{phase === 'scene2' && <WordWriter text="Nature does not make mistakes." delay={3000} speed={400} />}</p>
                </div>
            </div>

            {/* Scene 3: Cara Watching */}
            <div className={`scene-wrapper camera-float-reverse ${phase === 'scene3' ? 'visible' : 'hidden'}`} style={{ zIndex: 3 }}>
                <img className={`scene-image ken-burns-2 ${phase === 'scene3' ? 'animate' : ''}`} src="/images/img3.jpg" alt="" style={{ filter: phase === 'scene3' ? 'blur(0px)' : 'blur(5px)' }} />
                <div className={`subtle-text ${phase === 'scene3' ? 'visible' : 'hidden'}`}>
                    <p>{phase === 'scene3' && <WordWriter text="But calculation requires blood." delay={1000} speed={400} />}</p>
                </div>
            </div>

            {/* Scene 4: Daisy Scene */}
            <div className={`scene-wrapper camera-float ${phase === 'scene4' ? 'visible' : 'hidden'}`} style={{ zIndex: 4 }}>
                <img className={`scene-image ken-burns-slow ${phase === 'scene4' ? 'animate' : ''}`} src="/images/img4.jpg" alt="" />
                <div className="vignette flicker"></div>
                <div className={`subtle-text ${phase === 'scene4' ? 'visible' : 'hidden'}`}>
                    <p>{phase === 'scene4' && <WordWriter text="13... 21... 34... it's just math." delay={1500} speed={400} />}</p>
                </div>
            </div>

            {/* Audio */}
            {hasStarted && phase !== 'black2' && (
                <audio autoPlay loop src="/simplesound-horror-trailer-443327.mp3" ref={(audio) => { if (audio) audio.volume = 0.2; }} />
            )}

        </div>
    );
};
export default Prologue;
