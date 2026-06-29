'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import ChatBubble from './ChatBubble';
import styles from './BobaCall.module.css';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

async function getMicState() {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' });
    return result.state; // 'granted' | 'denied' | 'prompt'
  } catch {
    return 'unknown';
  }
}

export default function BobaCall() {
  const vapiRef = useRef(null);
  const chatEndRef = useRef(null);

  const [callStatus, setCallStatus] = useState('idle'); // idle | connecting | active | ending
  const [messages, setMessages] = useState([]);
  const [partial, setPartial] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const [micBlocked, setMicBlocked] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!VAPI_PUBLIC_KEY) return;

    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      setCallStatus('active');
      setError(null);
    });

    vapi.on('call-end', () => {
      setCallStatus('idle');
      setIsSpeaking(false);
      setPartial(null);
    });

    vapi.on('speech-start', () => setIsSpeaking(true));
    vapi.on('speech-end', () => setIsSpeaking(false));

    vapi.on('message', (msg) => {
      if (msg.type !== 'transcript') return;
      if (msg.transcriptType === 'partial') {
        setPartial({ role: msg.role, text: msg.transcript });
      } else {
        setPartial(null);
        if (msg.transcript.trim()) {
          setMessages((prev) => [
            ...prev,
            { id: `${Date.now()}-${prev.length}`, role: msg.role, text: msg.transcript },
          ]);
        }
      }
    });

    vapi.on('error', async (err) => {
      const msg =
        (err?.message || err?.error?.message || (typeof err === 'string' ? err : null)) ?? '';

      // Vapi fires this when the server ends the call normally — not a real error.
      if (msg.toLowerCase().includes('ejection') || msg.toLowerCase().includes('meeting has ended')) {
        setCallStatus('idle');
        return;
      }

      const micState = await getMicState();
      if (micState === 'denied') {
        setMicBlocked(true);
      } else {
        console.error('Vapi error:', msg || JSON.stringify(err));
        const userMsg =
          msg === 'Failed to fetch'
            ? 'Could not reach Boba Bot — check your internet connection and Vapi credentials.'
            : (msg || 'Something went wrong. Please try again.');
        setError(userMsg);
      }
      setCallStatus('idle');
    });

    return () => {
      vapi.stop();
      vapiRef.current = null;
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partial]);

  const toggleCall = useCallback(async () => {
    if (callStatus === 'connecting' || callStatus === 'ending') return;

    if (callStatus === 'idle') {
      const micState = await getMicState();
      if (micState === 'denied') {
        setMicBlocked(true);
        return;
      }
      setCallStatus('connecting');
      setMessages([]);
      setError(null);
      await vapiRef.current.start(VAPI_ASSISTANT_ID);
    } else {
      setCallStatus('ending');
      vapiRef.current?.stop();
    }
  }, [callStatus]);

  const requestMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicBlocked(false);
    } catch {
      // still denied — instructions remain visible
    }
  }, []);

  const submitText = useCallback(
    (e) => {
      e.preventDefault();
      const text = draft.trim();
      if (!text) return;

      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-${prev.length}`, role: 'user', text },
      ]);
      setDraft('');

      if (callStatus === 'active' && vapiRef.current) {
        try {
          vapiRef.current.send({
            type: 'add-message',
            message: { role: 'user', content: text },
          });
        } catch {
          // best-effort
        }
      }
    },
    [draft, callStatus]
  );

  const switchToVoice = useCallback(() => {
    setTextMode(false);
    setMicBlocked(false); // cleared so normal card shows; toggleCall re-checks on attempt
  }, []);

  const statusText = {
    idle: 'Tap to start your order',
    connecting: 'Connecting…',
    active: isSpeaking ? 'Boba Bot is speaking…' : 'Listening…',
    ending: 'Wrapping up…',
  }[callStatus];

  const showChat = messages.length > 0 || partial;

  if (!VAPI_PUBLIC_KEY || !VAPI_ASSISTANT_ID) {
    return (
      <div className={styles.page}>
        <div className={styles.configWarning}>
          <span>⚠️</span>
          <p>
            Set <code>NEXT_PUBLIC_VAPI_PUBLIC_KEY</code> and{' '}
            <code>NEXT_PUBLIC_VAPI_ASSISTANT_ID</code> in <code>.env.local</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.logo}>🧋</span>
          <div>
            <h1 className={styles.title}>Boba Order</h1>
            <p className={styles.subtitle}>Your voice-powered boba shop</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* ── Mic blocked panel ── */}
        {micBlocked && !textMode && (
          <div className={styles.card}>
            <div className={styles.decoRow} aria-hidden="true">
              <LaceHeart />
              <LaceHeart />
              <LaceHeart />
            </div>
            <span className={styles.micBlockedIcon}>🎙️</span>
            <p className={styles.micBlockedTitle}>Microphone is blocked</p>
            <p className={styles.micBlockedDesc}>
              Voice ordering needs mic access. Enable it in your browser, or type your order below.
            </p>
            <div className={styles.micInstructions}>
              <p>
                Click the <strong>🔒 lock</strong> in the address bar → find{' '}
                <strong>Microphone</strong> → set to <em>Allow</em> → refresh the page.
              </p>
            </div>
            <div className={styles.micActions}>
              <button className={styles.btnOutline} onClick={requestMic}>
                🎤 Try again
              </button>
              <button className={styles.btnFill} onClick={() => setTextMode(true)}>
                💬 Type instead
              </button>
            </div>
          </div>
        )}

        {/* ── Normal call card ── */}
        {!micBlocked && !textMode && (
          <div className={styles.card}>
            <div className={styles.decoRow} aria-hidden="true">
              <LaceHeart />
              <LaceHeart />
              <LaceHeart />
            </div>
            <p className={styles.statusText}>{statusText}</p>
            <button
              className={`${styles.callBtn} ${styles[callStatus]}`}
              onClick={toggleCall}
              disabled={callStatus === 'connecting' || callStatus === 'ending'}
              aria-label={callStatus === 'active' ? 'End call' : 'Start call'}
            >
              {callStatus === 'idle' && <span aria-hidden="true">🧋</span>}
              {(callStatus === 'connecting' || callStatus === 'ending') && <Spinner />}
              {callStatus === 'active' && <SoundBars speaking={isSpeaking} />}
            </button>
            {callStatus === 'active' && <p className={styles.hint}>tap to end</p>}
          </div>
        )}

        {/* ── Text mode card ── */}
        {textMode && (
          <div className={styles.card}>
            <div className={styles.decoRow} aria-hidden="true">
              <LaceHeart />
              <LaceHeart />
              <LaceHeart />
            </div>
            <p className={styles.statusText}>Type your boba order</p>
            <form className={styles.textForm} onSubmit={submitText}>
              <input
                className={styles.textInput}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="e.g. Taro milk tea, 50% sugar, boba…"
                autoFocus
              />
              <button className={styles.textSubmit} type="submit" disabled={!draft.trim()}>
                Send
              </button>
            </form>
            <button className={styles.modeSwitch} onClick={switchToVoice}>
              🎤 Switch to voice
            </button>
          </div>
        )}

        {error && <div className={styles.errorBox}>{error}</div>}

        {showChat && (
          <div className={styles.chatCard}>
            <div className={styles.chatLabel}>Order Transcript</div>
            <div className={styles.chatScroll}>
              {messages.map((m) => (
                <ChatBubble key={m.id} role={m.role} text={m.text} />
              ))}
              {partial && <ChatBubble role={partial.role} text={partial.text} isPartial />}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>Made with 🧋 &amp; love</footer>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className={styles.spinner}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

function LaceHeart() {
  return (
    <svg viewBox="0 0 12.4 11.5" width="18" height="18" aria-hidden="true">
      <path
        fill="#897052"
        d="M9.4,0C8.4,0,7,1.2,6.2,2.2C5.4,1.2,4,0,3.1,0C1.5-0.1,0.1,1.1,0,2.7C0,2.8,0,3,0,3.1c0,2.9,5.3,7.5,6.2,7.5s6.2-4.5,6.2-7.5c0.1-1.6-1-3-2.6-3.1C9.7,0,9.5,0,9.4,0z"
      />
    </svg>
  );
}

function SoundBars({ speaking }) {
  const delays = [0, 0.15, 0.05, 0.2, 0.1];
  return (
    <div className={styles.soundBars} aria-label="sound indicator">
      {delays.map((delay, i) => (
        <div
          key={i}
          className={`${styles.soundBar} ${speaking ? styles.soundBarActive : ''}`}
          style={{ '--bar-delay': `${delay}s` }}
        />
      ))}
    </div>
  );
}
