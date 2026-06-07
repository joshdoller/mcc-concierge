import { useState, useRef, useEffect } from "react";

const C = {
  bg:       "#EAE4DC",
  bgDeep:   "#DDD7CE",
  paper:    "#F4F1ED",
  sage:     "#6B7C5C",
  sageDark: "#556248",
  sagePale: "#8A9A78",
  rule:     "#D5CFC6",
  charcoal: "#2A2925",
  warm:     "#4A4640",
  muted:    "#8C8880",
};

const SUGGESTIONS = [
  "I'm interested in lip filler",
  "Tell me about anti-wrinkle treatments",
  "What is a non-surgical rhinoplasty?",
  "I've never had treatment before",
  "I'd like to book a consultation",
];

const GLOBAL = `
  @keyframes mcc-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
  @keyframes mcc-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes mcc-pulse{0%,100%{opacity:1}50%{opacity:0.3}}
  *{box-sizing:border-box;} body{margin:0;padding:0;}
  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#D5CFC6;border-radius:2px}
  textarea{resize:none} textarea:focus{outline:none}
  .btn-sage:hover{background:#556248 !important;}
  .sug:hover{border-color:#6B7C5C !important;color:#6B7C5C !important;}
`;

const TypingDots = () => (
  <div style={{ display:"flex", gap:6, alignItems:"center", padding:"3px 0" }}>
    {[0,1,2].map(i => (
      <div key={i} style={{
        width:6, height:6, borderRadius:"50%", background:"#8A9A78",
        animation:"mcc-bounce 1.4s ease infinite",
        animationDelay:`${i*0.2}s`,
      }}/>
    ))}
  </div>
);

const MCCAvatar = () => (
  <div style={{
    width:30, height:30, borderRadius:"50%", flexShrink:0,
    background:"#6B7C5C", display:"flex", alignItems:"center", justifyContent:"center",
    fontFamily:"'Cormorant Garamond', serif", fontSize:10,
    letterSpacing:"0.08em", color:"#F4F1ED", marginBottom:2,
  }}>MCC</div>
);

export default function App() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Welcome to Melbourne Cosmetic Centre.\n\nI'm here to answer your questions and help you explore what might be right for you. Everything we do begins with a consultation — so there is no rush, and no pressure.\n\nWhat brings you in today?"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setStarted(true);
    setError("");
    const next = [...messages, { role:"user", content:msg }];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(m => ({ role:m.role, content:m.content }))
        })
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);

      const data = await res.json();
      const reply = data.content?.[0]?.text;

      if (!reply) throw new Error("No response");

      setMessages(p => [...p, { role:"assistant", content: reply }]);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setMessages(p => [...p, {
        role:"assistant",
        content:"I'm sorry — something went wrong on my end. Please try again in a moment."
      }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#EAE4DC", display:"flex", flexDirection:"column", fontFamily:"'Jost', sans-serif" }}>
      <style>{GLOBAL}</style>

      <header style={{ background:"#F4F1ED", borderBottom:"1px solid #D5CFC6", padding:"18px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:12, fontWeight:400, letterSpacing:"0.24em", textTransform:"uppercase", color:"#2A2925", lineHeight:1.55 }}>
          Melbourne<br/>Cosmetic Centre
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#6B7C5C", animation:"mcc-pulse 3s ease infinite" }}/>
          <span style={{ fontSize:10, color:"#8C8880", letterSpacing:"0.16em", textTransform:"uppercase" }}>Patient Concierge</span>
        </div>
      </header>

      <div style={{ flex:1, overflowY:"auto", maxWidth:620, width:"100%", margin:"0 auto", padding:"32px 20px 24px", display:"flex", flexDirection:"column", gap:20 }}>

        {!started && (
          <div style={{ borderLeft:"2px solid #6B7C5C", paddingLeft:20, marginBottom:8, animation:"mcc-in 0.5s ease forwards" }}>
            <p style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:400, fontStyle:"italic", color:"#2A2925", lineHeight:1.5, margin:"0 0 10px" }}>
              "A consultation begins<br/>with a conversation."
            </p>
            <p style={{ fontSize:11, color:"#8C8880", letterSpacing:"0.14em", textTransform:"uppercase", margin:0 }}>
              Melbourne Cosmetic Centre · Est. 2008
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display:"flex", flexDirection:msg.role==="user"?"row-reverse":"row", alignItems:"flex-end", gap:10, animation:"mcc-in 0.25s ease forwards" }}>
            {msg.role === "assistant" && <MCCAvatar />}
            <div style={{
              maxWidth:"76%",
              background: msg.role==="user" ? "#6B7C5C" : "#F4F1ED",
              color: msg.role==="user" ? "#F4F1ED" : "#2A2925",
              padding:"14px 18px",
              borderRadius: msg.role==="user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
              fontSize:14, lineHeight:1.82, fontWeight:300,
              border: msg.role==="user" ? "none" : "1px solid #D5CFC6",
              whiteSpace:"pre-wrap", wordBreak:"break-word", letterSpacing:"0.015em"
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display:"flex", alignItems:"flex-end", gap:10, animation:"mcc-in 0.25s ease forwards" }}>
            <MCCAvatar />
            <div style={{ background:"#F4F1ED", border:"1px solid #D5CFC6", padding:"14px 18px", borderRadius:"14px 14px 14px 3px" }}>
              <TypingDots />
            </div>
          </div>
        )}

        {!started && (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:4 }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className="sug" onClick={() => send(s)} style={{ background:"transparent", border:"1px solid #D5CFC6", color:"#8C8880", padding:"8px 16px", fontSize:11, fontFamily:"'Jost', sans-serif", fontWeight:300, letterSpacing:"0.06em", cursor:"pointer", transition:"all 0.18s", whiteSpace:"nowrap" }}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={{ background:"#F4F1ED", borderTop:"1px solid #D5CFC6", padding:"14px 20px 18px", position:"sticky", bottom:0 }}>
        <div style={{ maxWidth:620, margin:"0 auto", display:"flex", gap:10, alignItems:"flex-end" }}>
          <textarea
            ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
            placeholder="Ask about treatments, or type your question..."
            rows={1}
            style={{ flex:1, background:"#EAE4DC", border:"1px solid #D5CFC6", padding:"11px 15px", color:"#2A2925", fontSize:13, fontFamily:"'Jost', sans-serif", lineHeight:1.6, maxHeight:120, overflowY:"auto", transition:"border-color 0.2s", letterSpacing:"0.015em", fontWeight:300 }}
            onFocus={e => e.target.style.borderColor="#6B7C5C"}
            onBlur={e => e.target.style.borderColor="#D5CFC6"}
          />
          <button onClick={() => send()} disabled={!input.trim()||loading} className={input.trim()&&!loading?"btn-sage":""}
            style={{ width:44, height:44, background:input.trim()&&!loading?"#6B7C5C":"#DDD7CE", border:"none", cursor:input.trim()&&!loading?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 0.18s" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke={input.trim()&&!loading?"#F4F1ED":"#8C8880"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim()&&!loading?"#F4F1ED":"#8C8880"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p style={{ maxWidth:620, margin:"10px auto 0", fontSize:10, color:"#8C8880", textAlign:"center", letterSpacing:"0.1em", textTransform:"uppercase" }}>
          All treatments require a clinical consultation · Powered by AVAR Digital
        </p>
      </div>
    </div>
  );
}
