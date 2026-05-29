import { useState, useEffect, useCallback } from “react”;
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from “recharts”;

// ── THEME ─────────────────────────────────────────────────────────────
const T = {
black:”#080808”, dark:”#101010”, card:”#161616”, card2:”#1c1c1c”,
border:”#272727”, border2:”#333”,
yellow:”#f5c518”, yellowD:”#c9a010”, yellowL:”#fde68a”,
white:”#ffffff”, gray:”#777”, grayL:”#aaa”,
red:”#f04040”, green:”#22c55e”, blue:”#60a5fa”, purple:”#a78bfa”, orange:”#fb923c”,
};

// ── CONSTANTS ─────────────────────────────────────────────────────────
const STORES = [
“Água Verde”,“Batel”,“Portão”,“Pinheirinho”,“CIC”,“Rebouças”,
“Cajuru”,“Santa Felicidade”,“São José dos Pinhais”,“Colombo”,“Araucária”,“Campo Largo”,
];
const PERIODS    = [{ id:“manha”, label:“Manhã ☀️” },{ id:“tarde”, label:“Tarde 🌆” }];
const PREV_TIMES = [{ id:“prev11”,label:“11h” },{ id:“prev15”,label:“15h” },{ id:“prev1730”,label:“17h30” }];

// ── STORAGE ───────────────────────────────────────────────────────────
const LS = {
users:  ()=>{ try{ return JSON.parse(localStorage.getItem(“crm4_users”) ||”[]”); }catch{ return []; } },
visits: ()=>{ try{ return JSON.parse(localStorage.getItem(“crm4_visits”)||”[]”); }catch{ return []; } },
setU:   v=>localStorage.setItem(“crm4_users”,  JSON.stringify(v)),
setV:   v=>localStorage.setItem(“crm4_visits”, JSON.stringify(v)),
};

// ── ICONS ─────────────────────────────────────────────────────────────
const Ic = ({ d, s=16, c=“currentColor”, sw=2 }) => (
<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
<path d={d}/>
</svg>
);
const D = {
user:   “M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z”,
lock:   “M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4”,
phone:  “M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z”,
store:  “M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10”,
chart:  “M18 20V10M12 20V4M6 20v-6”,
plus:   “M12 5v14M5 12h14”,
logout: “M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9”,
check:  “M20 6L9 17l-5-5”,
list:   “M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01”,
users:  “M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75”,
trash:  “M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6”,
eye:    “M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z”,
eyeOff: “M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22”,
arrow:  “M5 12h14M12 5l7 7-7 7”,
shield: “M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z”,
xmark:  “M18 6L6 18M6 6l12 12”,
clock:  “M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2”,
doc:    “M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6”,
};

// ── TOAST ─────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
return (
<div style={{ position:“fixed”, bottom:26, right:26, background:type===“error”?T.red:T.yellow, color:type===“error”?”#fff”:T.black, padding:“12px 20px”, borderRadius:10, fontWeight:800, fontSize:14, zIndex:9999, boxShadow:“0 6px 28px rgba(0,0,0,.8)”, display:“flex”, alignItems:“center”, gap:8 }}>
<Ic d={type===“error”?D.xmark:D.check} s={15} c={type===“error”?”#fff”:T.black}/> {msg}
</div>
);
};

// ── INPUT ─────────────────────────────────────────────────────────────
const Input = ({ label, value, onChange, type=“text”, placeholder, error, icon }) => {
const [show, setShow] = useState(false);
const isPass = type===“password”;
return (
<div style={{ marginBottom:16 }}>
{label && <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:“uppercase”, letterSpacing:.8, display:“block”, marginBottom:5 }}>{label}</label>}
<div style={{ position:“relative” }}>
{icon && <span style={{ position:“absolute”, left:12, top:“50%”, transform:“translateY(-50%)”, color:T.gray, pointerEvents:“none” }}><Ic d={icon} s={14}/></span>}
<input type={isPass&&show?“text”:type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
style={{ width:“100%”, background:T.dark, border:`1.5px solid ${error?T.red:T.border}`, borderRadius:9, padding:`11px ${isPass?"40px":"12px"} 11px ${icon?"38px":"12px"}`, color:T.white, fontSize:14, outline:“none”, boxSizing:“border-box”, fontFamily:“inherit” }}
onFocus={e=>e.target.style.borderColor=error?T.red:T.yellow}
onBlur={e=>e.target.style.borderColor=error?T.red:T.border}/>
{isPass && <button type=“button” onClick={()=>setShow(s=>!s)} style={{ position:“absolute”, right:11, top:“50%”, transform:“translateY(-50%)”, background:“none”, border:“none”, cursor:“pointer”, color:T.gray, padding:0, display:“flex” }}><Ic d={show?D.eyeOff:D.eye} s={14}/></button>}
</div>
{error && <p style={{ color:T.red, fontSize:12, margin:“3px 0 0”, fontWeight:600 }}>{error}</p>}
</div>
);
};

// ── SELECT ────────────────────────────────────────────────────────────
const Sel = ({ label, value, onChange, options, error, placeholder, small }) => (

  <div style={{ marginBottom:small?0:16 }}>
    {label && <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:5 }}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:"100%", background:T.dark, border:`1.5px solid ${error?T.red:T.border}`, borderRadius:9, padding:small?"8px 12px":"11px 12px", color:value?T.white:T.gray, fontSize:small?13:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit", appearance:"none", cursor:"pointer" }}
      onFocus={e=>e.target.style.borderColor=error?T.red:T.yellow}
      onBlur={e=>e.target.style.borderColor=error?T.red:T.border}>
      <option value="">{placeholder||"Selecione..."}</option>
      {options.map(o=><option key={o.v||o} value={o.v||o} style={{ color:T.white, background:T.card }}>{o.l||o}</option>)}
    </select>
    {error && <p style={{ color:T.red, fontSize:12, margin:"3px 0 0", fontWeight:600 }}>{error}</p>}
  </div>
);

// ── TOGGLE BTN ────────────────────────────────────────────────────────
const Toggle = ({ active, onClick, children, color=T.yellow }) => (
<button onClick={onClick} style={{ flex:1, padding:“10px 6px”, border:`1.5px solid ${active?color:T.border}`, borderRadius:9, background:active?`${color}1a`:“transparent”, color:active?color:T.gray, fontWeight:800, fontSize:13, cursor:“pointer”, transition:“all .15s”, fontFamily:“inherit” }}>
{children}
</button>
);

// ── BTN ───────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant=“primary”, full, small, disabled }) => {
const S = { primary:{bg:`linear-gradient(135deg,${T.yellow},${T.yellowD})`,color:T.black,border:“none”}, secondary:{bg:“transparent”,color:T.yellow,border:`1.5px solid ${T.yellow}`}, danger:{bg:`${T.red}18`,color:T.red,border:`1px solid ${T.red}44`}, ghost:{bg:“transparent”,color:T.gray,border:`1px solid ${T.border}`} }[variant];
return (
<button onClick={onClick} disabled={disabled} style={{ background:S.bg, color:S.color, border:S.border, borderRadius:9, padding:small?“7px 14px”:“11px 22px”, fontWeight:800, fontSize:small?12:14, cursor:disabled?“not-allowed”:“pointer”, display:“inline-flex”, alignItems:“center”, gap:6, opacity:disabled?.5:1, width:full?“100%”:“auto”, justifyContent:full?“center”:“flex-start”, transition:“opacity .15s”, fontFamily:“inherit” }}
onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity=”.8”;}}
onMouseLeave={e=>{e.currentTarget.style.opacity=“1”;}}>
{children}
</button>
);
};

// ── BADGE ─────────────────────────────────────────────────────────────
const Badge = ({ children, color=T.yellow }) => (
<span style={{ background:`${color}22`, color, padding:“2px 10px”, borderRadius:20, fontSize:11, fontWeight:800, letterSpacing:.3, textTransform:“uppercase”, whiteSpace:“nowrap” }}>{children}</span>
);

// ── SECTION LABEL ─────────────────────────────────────────────────────
const SLabel = ({ children }) => (

  <p style={{ color:T.yellow, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:1, margin:"0 0 14px" }}>{children}</p>
);

// ══════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════
const AuthScreen = ({ onLogin }) => {
const [mode, setMode] = useState(“login”);
const [form, setForm] = useState({ name:””, phone:””, password:””, confirm:””, role:“gn” });
const [errors, setErrors] = useState({});
const set = (k,v)=>{ setForm(f=>({…f,[k]:v})); setErrors(e=>({…e,[k]:””})); };

const handleLogin = () => {
const e={};
if(!form.phone) e.phone=“Informe o telefone”;
if(!form.password) e.password=“Informe a senha”;
if(Object.keys(e).length){ setErrors(e); return; }
const u = LS.users().find(x=>x.phone===form.phone&&x.password===form.password);
if(u) onLogin(u); else setErrors({ phone:“Telefone ou senha incorretos” });
};

const handleSignup = () => {
const e={};
if(!form.name.trim()) e.name=“Nome obrigatório”;
if(!form.phone||!/^\d{10,11}$/.test(form.phone)) e.phone=“Telefone inválido (10–11 dígitos)”;
if(!form.password||form.password.length<4) e.password=“Mínimo 4 caracteres”;
if(form.password!==form.confirm) e.confirm=“As senhas não coincidem”;
if(LS.users().find(u=>u.phone===form.phone)) e.phone=“Telefone já cadastrado”;
if(Object.keys(e).length){ setErrors(e); return; }
const u={ id:Date.now(), name:form.name.trim(), phone:form.phone, password:form.password, role:form.role };
LS.setU([…LS.users(), u]);
onLogin(u);
};

const sw = m=>{ setMode(m); setForm({ name:””, phone:””, password:””, confirm:””, role:“gn” }); setErrors({}); };

return (
<div style={{ minHeight:“100vh”, background:T.black, display:“flex”, alignItems:“center”, justifyContent:“center”, fontFamily:”‘Segoe UI’,system-ui,sans-serif”, padding:20 }}>
<div style={{ position:“fixed”, top:-100, right:-100, width:400, height:400, background:T.yellow, borderRadius:“50%”, opacity:.04, filter:“blur(90px)”, pointerEvents:“none” }}/>
<div style={{ width:“100%”, maxWidth:400 }}>
<div style={{ textAlign:“center”, marginBottom:32 }}>
<div style={{ width:56, height:56, background:T.yellow, borderRadius:15, display:“flex”, alignItems:“center”, justifyContent:“center”, margin:“0 auto 14px”, boxShadow:`0 0 40px ${T.yellow}50` }}>
<Ic d={D.store} s={26} c={T.black} sw={2.5}/>
</div>
<h1 style={{ color:T.white, margin:“0 0 4px”, fontSize:24, fontWeight:900, letterSpacing:-.8 }}>Elite <span style={{ color:T.yellow }}>Comercial</span></h1>
</div>

```
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:18, padding:"26px 22px", boxShadow:"0 20px 60px rgba(0,0,0,.7)" }}>
      <div style={{ display:"flex", background:T.dark, borderRadius:9, padding:3, marginBottom:22 }}>
        {[["login","Entrar"],["signup","Cadastrar"]].map(([m,l])=>(
          <button key={m} onClick={()=>sw(m)} style={{ flex:1, padding:"9px", border:"none", borderRadius:7, cursor:"pointer", fontWeight:800, fontSize:13, transition:"all .2s", fontFamily:"inherit", background:mode===m?T.yellow:"transparent", color:mode===m?T.black:T.gray }}>{l}</button>
        ))}
      </div>

      {mode==="login" ? (
        <>
          <Input label="Telefone" value={form.phone} onChange={v=>set("phone",v)} placeholder="41999990000" icon={D.phone} error={errors.phone}/>
          <Input label="Senha" value={form.password} onChange={v=>set("password",v)} type="password" placeholder="••••••••" icon={D.lock} error={errors.password}/>
          <Btn onClick={handleLogin} full><Ic d={D.arrow} s={15} c={T.black}/> Entrar</Btn>
          <p style={{ color:T.gray, fontSize:12, textAlign:"center", marginTop:14, marginBottom:0 }}>
            Não tem conta? <button onClick={()=>sw("signup")} style={{ background:"none", border:"none", color:T.yellow, fontWeight:800, cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>Cadastre-se</button>
          </p>
        </>
      ) : (
        <>
          <Input label="Nome completo" value={form.name} onChange={v=>set("name",v)} placeholder="João da Silva" icon={D.user} error={errors.name}/>
          <Input label="Telefone (login)" value={form.phone} onChange={v=>set("phone",v)} placeholder="41999990000" icon={D.phone} error={errors.phone}/>
          <Input label="Crie sua senha" value={form.password} onChange={v=>set("password",v)} type="password" placeholder="Mínimo 4 caracteres" icon={D.lock} error={errors.password}/>
          <Input label="Confirme a senha" value={form.confirm} onChange={v=>set("confirm",v)} type="password" placeholder="Repita a senha" icon={D.lock} error={errors.confirm}/>
          <Sel label="Tipo de acesso" value={form.role} onChange={v=>set("role",v)} options={[{v:"gn",l:"GN"},{v:"gestor",l:"Gestor"}]}/>
          <div style={{ background:`${T.yellow}0e`, border:`1px solid ${T.yellow}28`, borderRadius:9, padding:"9px 13px", marginBottom:14, display:"flex", gap:7, alignItems:"center" }}>
            <Ic d={D.shield} s={13} c={T.yellow}/>
            <p style={{ color:T.yellow, fontSize:12, margin:0 }}><strong>Gestor</strong> visualiza visitas de todos os GNs.</p>
          </div>
          <Btn onClick={handleSignup} full><Ic d={D.plus} s={15} c={T.black}/> Criar conta</Btn>
          <p style={{ color:T.gray, fontSize:12, textAlign:"center", marginTop:14, marginBottom:0 }}>
            Já tem conta? <button onClick={()=>sw("login")} style={{ background:"none", border:"none", color:T.yellow, fontWeight:800, cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>Entrar</button>
          </p>
        </>
      )}
    </div>
  </div>
</div>
```

);
};

// ══════════════════════════════════════════════════════════════════════
// NAV
// ══════════════════════════════════════════════════════════════════════
const Nav = ({ tab, setTab, user, onLogout }) => {
const tabs = [
{ id:“visits”, label:“Registrar”, icon:D.plus },
{ id:“list”,   label:“Visitas”,   icon:D.list  },
{ id:“charts”, label:“Gráficos”,  icon:D.chart },
…(user.role===“gestor”?[{ id:“team”, label:“Equipe”, icon:D.users }]:[]),
];
return (
<nav style={{ background:T.dark, borderBottom:`1px solid ${T.border}`, padding:“0 20px”, display:“flex”, alignItems:“center”, height:54, position:“sticky”, top:0, zIndex:100, gap:2 }}>
<div style={{ display:“flex”, alignItems:“center”, gap:9, marginRight:18 }}>
<div style={{ width:32, height:32, background:T.yellow, borderRadius:8, display:“flex”, alignItems:“center”, justifyContent:“center” }}>
<Ic d={D.store} s={15} c={T.black} sw={2.5}/>
</div>
<span style={{ color:T.white, fontWeight:900, fontSize:14, letterSpacing:-.5 }}>Elite <span style={{ color:T.yellow }}>Comercial</span></span>
</div>
<div style={{ flex:1, display:“flex”, gap:1 }}>
{tabs.map(t=>(
<button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:“6px 13px”, borderRadius:7, border:“none”, cursor:“pointer”, fontSize:13, fontWeight:700, display:“flex”, alignItems:“center”, gap:5, transition:“all .15s”, fontFamily:“inherit”, background:tab===t.id?`${T.yellow}15`:“transparent”, color:tab===t.id?T.yellow:T.gray, borderBottom:tab===t.id?`2px solid ${T.yellow}`:“2px solid transparent” }}>
<Ic d={t.icon} s={13} c={tab===t.id?T.yellow:T.gray}/> {t.label}
</button>
))}
</div>
<div style={{ display:“flex”, alignItems:“center”, gap:10 }}>
<div style={{ textAlign:“right” }}>
<p style={{ margin:0, color:T.white, fontSize:13, fontWeight:700 }}>{user.name.split(” “)[0]}</p>
<span style={{ background:`${user.role==="gestor"?T.yellow:T.green}22`, color:user.role===“gestor”?T.yellow:T.green, padding:“1px 8px”, borderRadius:20, fontSize:10, fontWeight:800 }}>{user.role===“gestor”?“GESTOR”:“GN”}</span>
</div>
<button onClick={onLogout} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:“6px 9px”, cursor:“pointer”, color:T.gray, display:“flex” }}
onMouseEnter={e=>e.currentTarget.style.borderColor=T.red}
onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
<Ic d={D.logout} s={14}/>
</button>
</div>
</nav>
);
};

// ══════════════════════════════════════════════════════════════════════
// FORM VISITA
// ══════════════════════════════════════════════════════════════════════
const VisitForm = ({ user, onSaved }) => {
const today = new Date().toISOString().split(“T”)[0];
const [form, setForm] = useState({ date:today, store:””, period:””, payments:””, hadContract:null });
const [previas, setPrevias] = useState([]);
const [errors, setErrors] = useState({});

const set = (k,v)=>{ setForm(f=>({…f,[k]:v})); setErrors(e=>({…e,[k]:””})); };

const addPrevia = () => setPrevias(p=>[…p,{ time:””, store:”” }]);
const removePrevia = i => setPrevias(p=>p.filter((_,idx)=>idx!==i));
const updatePrevia = (i, k, v) => setPrevias(p=>p.map((x,idx)=>idx===i?{…x,[k]:v}:x));

const validate = () => {
const e={};
if(!form.date) e.date=“Informe a data”;
if(!form.store) e.store=“Selecione a loja”;
if(!form.period) e.period=“Selecione o período”;
if(form.payments===””||isNaN(Number(form.payments))) e.payments=“Informe a quantidade”;
if(form.hadContract===null) e.hadContract=“Informe se houve contrato”;
setErrors(e); return Object.keys(e).length===0;
};

const submit = () => {
if(!validate()) return;
const visit = {
id:Date.now(), gnId:user.id, gnName:user.name,
date:form.date, store:form.store, period:form.period,
payments:Number(form.payments),
hadContract: form.hadContract,
previas: previas.filter(p=>p.time||p.store),
createdAt:new Date().toISOString(),
};
LS.setV([…LS.visits(), visit]);
setForm({ date:today, store:””, period:””, payments:””, hadContract:null });
setPrevias([]);
onSaved();
};

return (
<div style={{ maxWidth:580, margin:“0 auto” }}>
<div style={{ marginBottom:22 }}>
<h2 style={{ color:T.white, fontSize:21, fontWeight:900, margin:“0 0 3px”, letterSpacing:-.5 }}>Nova Visita</h2>
<p style={{ color:T.gray, fontSize:13, margin:0 }}>{user.name}</p>
</div>

```
  <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"20px 18px", marginBottom:12 }}>
    <SLabel>📍 Dados da Visita</SLabel>

    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:0 }}>
      <div>
        <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:5 }}>Data</label>
        <input type="date" value={form.date} onChange={e=>set("date",e.target.value)}
          style={{ width:"100%", background:T.dark, border:`1.5px solid ${errors.date?T.red:T.border}`, borderRadius:9, padding:"11px 12px", color:T.white, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
          onFocus={e=>e.target.style.borderColor=T.yellow}
          onBlur={e=>e.target.style.borderColor=errors.date?T.red:T.border}/>
        {errors.date&&<p style={{ color:T.red, fontSize:12, margin:"3px 0 0", fontWeight:600 }}>{errors.date}</p>}
      </div>
      <div>
        <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:5 }}>Pagamentos na Loja</label>
        <input type="number" min="0" value={form.payments} onChange={e=>set("payments",e.target.value)} placeholder="0"
          style={{ width:"100%", background:T.dark, border:`1.5px solid ${errors.payments?T.red:T.border}`, borderRadius:9, padding:"11px 12px", color:T.white, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
          onFocus={e=>e.target.style.borderColor=T.yellow}
          onBlur={e=>e.target.style.borderColor=errors.payments?T.red:T.border}/>
        {errors.payments&&<p style={{ color:T.red, fontSize:12, margin:"3px 0 0", fontWeight:600 }}>{errors.payments}</p>}
      </div>
    </div>

    <div style={{ marginTop:14 }}>
      <Sel label="Loja Visitada" value={form.store} onChange={v=>set("store",v)} options={STORES} error={errors.store} placeholder="Selecione a loja..."/>
    </div>

    {form.store && (
      <div style={{ marginBottom:16 }}>
        <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:7 }}>
          Teve contrato na {form.store} hoje?
        </label>
        <div style={{ display:"flex", gap:10 }}>
          <Toggle active={form.hadContract===true} onClick={()=>set("hadContract",true)} color={T.green}>✅ Sim, teve contrato</Toggle>
          <Toggle active={form.hadContract===false} onClick={()=>set("hadContract",false)} color={T.red}>❌ Não teve contrato</Toggle>
        </div>
        {errors.hadContract&&<p style={{ color:T.red, fontSize:12, margin:"5px 0 0", fontWeight:600 }}>{errors.hadContract}</p>}
      </div>
    )}

    <div>
      <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:7 }}>Período</label>
      <div style={{ display:"flex", gap:10 }}>
        {PERIODS.map(p=><Toggle key={p.id} active={form.period===p.id} onClick={()=>set("period",p.id)}>{p.label}</Toggle>)}
      </div>
      {errors.period&&<p style={{ color:T.red, fontSize:12, margin:"5px 0 0", fontWeight:600 }}>{errors.period}</p>}
    </div>
  </div>

  <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"20px 18px", marginBottom:14 }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: previas.length>0?14:0 }}>
      <SLabel style={{ margin:0 }}>🕐 Prévias</SLabel>
      <Btn onClick={addPrevia} variant="secondary" small><Ic d={D.plus} s={13} c={T.yellow}/> Adicionar</Btn>
    </div>

    {previas.length===0 && (
      <div style={{ textAlign:"center", padding:"16px 0 4px", color:T.gray }}>
        <Ic d={D.clock} s={26} c={T.border}/>
        <p style={{ fontSize:13, margin:"7px 0 0" }}>Nenhuma prévia — clique em Adicionar</p>
      </div>
    )}

    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {previas.map((p,i)=>(
        <div key={i} style={{ background:T.card2, border:`1px solid ${T.border2}`, borderRadius:12, padding:"14px 15px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ width:24, height:24, background:`${T.yellow}22`, border:`1px solid ${T.yellow}44`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Ic d={D.clock} s={12} c={T.yellow}/>
              </div>
              <span style={{ color:T.yellow, fontWeight:800, fontSize:13 }}>Prévia {i+1}</span>
            </div>
            <button onClick={()=>removePrevia(i)} style={{ background:`${T.red}15`, border:`1px solid ${T.red}33`, borderRadius:6, padding:"3px 6px", cursor:"pointer", color:T.red, display:"flex" }}>
              <Ic d={D.xmark} s={12}/>
            </button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1.8fr", gap:10, marginBottom:10 }}>
            <Sel value={p.time} onChange={v=>updatePrevia(i,"time",v)} options={PREV_TIMES.map(pt=>({v:pt.id,l:pt.label}))} placeholder="Horário..." small/>
            <Sel value={p.store} onChange={v=>updatePrevia(i,"store",v)} options={STORES} placeholder="Loja que está pagando..." small/>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            <div>
              <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing
```
