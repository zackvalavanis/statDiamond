import './LoadingBaseball.css'

export function LoadingBaseball() {
  return (
    <div className="loading-container">
      <div className="scene">
        <div className="float-container">
          <div className="baseball-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
              <defs>
                <radialGradient id="ball-gradient" cx="40%" cy="35%" r="55%">
                  <stop offset="0%" stopColor="#faf8f2" />
                  <stop offset="40%" stopColor="#f0ece0" />
                  <stop offset="75%" stopColor="#e0d8c8" />
                  <stop offset="100%" stopColor="#c8bfa8" />
                </radialGradient>

                <filter id="leather">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
                  <feColorMatrix type="saturate" values="0" in="noise" result="gray-noise" />
                  <feBlend in="SourceGraphic" in2="gray-noise" mode="soft-light" />
                </filter>

                <filter id="inner-shadow">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                  <feOffset dx="2" dy="3" />
                  <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
                  <feFlood floodColor="#8a7a60" floodOpacity="0.25" />
                  <feComposite in2="SourceGraphic" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <circle cx="100" cy="100" r="90" fill="url(#ball-gradient)" filter="url(#leather)" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="#b8a888" strokeWidth="1.5" opacity="0.4" />
              <ellipse cx="75" cy="70" rx="30" ry="22" fill="white" opacity="0.15" transform="rotate(-20 75 70)" />

              <path d="M 68 22 C 50 45, 38 70, 42 100 C 46 130, 58 155, 78 178"
                fill="none" stroke="#cc2222" strokeWidth="2.2" strokeLinecap="round" />

              <g stroke="#cc2222" strokeWidth="1.4" strokeLinecap="round" opacity="0.9">
                <line x1="60" y1="28" x2="72" y2="34" />
                <line x1="54" y1="40" x2="66" y2="47" />
                <line x1="48" y1="53" x2="61" y2="59" />
                <line x1="44" y1="66" x2="57" y2="72" />
                <line x1="42" y1="80" x2="55" y2="85" />
                <line x1="42" y1="94" x2="55" y2="98" />
                <line x1="43" y1="108" x2="56" y2="111" />
                <line x1="46" y1="121" x2="59" y2="124" />
                <line x1="50" y1="134" x2="63" y2="136" />
                <line x1="56" y1="146" x2="68" y2="148" />
                <line x1="62" y1="157" x2="74" y2="158" />
                <line x1="70" y1="168" x2="82" y2="168" />
              </g>

              <path d="M 132 22 C 150 45, 162 70, 158 100 C 154 130, 142 155, 122 178"
                fill="none" stroke="#cc2222" strokeWidth="2.2" strokeLinecap="round" />

              <g stroke="#cc2222" strokeWidth="1.4" strokeLinecap="round" opacity="0.9">
                <line x1="140" y1="28" x2="128" y2="34" />
                <line x1="146" y1="40" x2="134" y2="47" />
                <line x1="152" y1="53" x2="139" y2="59" />
                <line x1="156" y1="66" x2="143" y2="72" />
                <line x1="158" y1="80" x2="145" y2="85" />
                <line x1="158" y1="94" x2="145" y2="98" />
                <line x1="157" y1="108" x2="144" y2="111" />
                <line x1="154" y1="121" x2="141" y2="124" />
                <line x1="150" y1="134" x2="137" y2="136" />
                <line x1="144" y1="146" x2="132" y2="148" />
                <line x1="138" y1="157" x2="126" y2="158" />
                <line x1="130" y1="168" x2="118" y2="168" />
              </g>

              <ellipse cx="68" cy="58" rx="14" ry="8" fill="white" opacity="0.2" transform="rotate(-30 68 58)" />
            </svg>
          </div>
        </div>
      </div>
      <div className="shadow"></div>
    </div>
  )
}