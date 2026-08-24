import { useMemo } from 'react';

interface AsciiMorphTextProps {
  text: string;
}

// Each letter hangs from a thin string and drops into place, settling
// with a slight bounce — like a row of marionettes falling into line.
const FALL_DISTANCE = 56;
const STAGGER_MS = 65;
const DROP_DURATION_MS = 650;

const AsciiMorphText: React.FC<AsciiMorphTextProps> = ({ text }) => {
  const letters = useMemo(() => text.split(''), [text]);

  return (
    <div
      className="ascii-morph-text"
      style={{
        fontSize: 'clamp(1.5rem, 5vw, 3rem)',
        fontWeight: 400,
        fontFamily: '"DK Crayonista", "Courier Prime", "Courier New", monospace',
        letterSpacing: '0.06em',
        textAlign: 'left',
        margin: '0.5rem 0',
        color: '#000000',
        lineHeight: 1,
        display: 'inline-flex',
        flexWrap: 'nowrap',
        alignItems: 'flex-start',
        whiteSpace: 'nowrap',
        position: 'relative',
        paddingTop: '18px',
      }}
    >
      <style>{`
        @keyframes letterDropFall {
          0%   { transform: translateY(-${FALL_DISTANCE}px); opacity: 0; }
          62%  { transform: translateY(5px); opacity: 1; }
          80%  { transform: translateY(-2px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes letterDropString {
          0%   { height: ${FALL_DISTANCE}px; opacity: 0.55; }
          62%  { height: 0px; opacity: 0.4; }
          100% { height: 0px; opacity: 0; }
        }
      `}</style>
      {letters.map((letter, index) => {
        const isSpace = letter === ' ';
        const delay = index * STAGGER_MS;
        return (
          <span
            key={index}
            style={{
              position: 'relative',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: isSpace ? '0.55em' : '0.9em',
              minWidth: isSpace ? '0.55em' : '0.9em',
            }}
          >
          {!isSpace && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-18px',
                left: '50%',
                width: '1px',
                marginLeft: '-0.5px',
                background: 'rgba(0, 0, 0, 0.65)',
                animation: `letterDropString ${DROP_DURATION_MS}ms ease-out ${delay}ms both`,
              }}
            />
          )}
          <span
            style={{
              display: 'inline-block',
              opacity: isSpace ? 1 : 0,
              animation: isSpace ? undefined : `letterDropFall ${DROP_DURATION_MS}ms cubic-bezier(0.34, 1.2, 0.64, 1) ${delay}ms both`,
              transformOrigin: 'center top',
            }}
          >
            {letter}
          </span>
          </span>
        );
      })}
    </div>
  );
};

export default AsciiMorphText;
