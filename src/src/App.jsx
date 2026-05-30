import { useState, useEffect, useCallback } from “react”;
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from “recharts”;

const T = {
black:”#080808”, dark:”#101010”, card:”#161616”, card2:”#1c1c1c”,
border:”#272727”, border2:”#333”,
yellow:”#f5c518”, yellowD:”#c9a010”,
white:”#ffffff”, gray:”#777”,
red:”#f04040”, green:”#22c55e”, blue:”#60a5fa”, purple:”#a78bfa”, orange:”#fb923c”,
};

const STORES = [
“Água Verde”,“Batel”,“Portão”,“Pinheirinho”,“CIC”,“Rebouças”,
“Cajuru”,“Santa Felicidade”,“São José dos Pinhais”,“Colombo”,“Araucária”,“Campo Largo”,
];
const PERIODS    = [{ id:“manha”, label:“Manhã ☀️” },{ id:“tarde”, label:“Tarde 🌆” }];
const PREV_TIMES = [{ id:“prev11”,label:“11h” },{ id:“prev15”,label:“15h” },{ id:“prev1730”,label:“17h30” }];
const CHECKLIST  = [
{ id:“apresentou”, label:“Apresentou produto” },
{ id:“treinou”,    label:“Treinou vendedor” },
{ id:“material”,   label:“Deixou material” },
];
const RELATIONSHIP = [
{ id:“quente”, label:“🔥 Quente”, color:T.green  },
{ id:“morno”,  label:“🌡 Morno”,  color:T.orange },
{ id:“frio”,   label:“❄️ Frio”,   color:T.blue   },
];
const ALERT_DAYS = 12;

const LS = {
users:  ()=>{ try{ return JSON.parse(localStorage.getItem(“crm5_users”) ||”[]”); }catch{ return []; } },
visits: ()=>{ try{ return JSON.parse(localStorage.getItem(“crm5_visits”)||”[]”); }catch{ return []; } },
setU:   v=>localStorage.setItem(“crm5_users”,  JSON.stringify(v)),
setV:   v=>localStorage.setItem(“crm5_visits”, JSON.stringify(v)),
};

const Ic = ({ d, s=16, c=“currentColor”, sw=2 }) => (
<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
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
alert:  “M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01”,
download:“M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3”,
};

const Toast = ({ msg, type, onClose }) => {
useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
return (
<div style={{ position:“fixed”, bottom:26, right:26, background:type===“error”?T.red:T.yellow, color:type===“error”?”#fff”:T.black, padding:“12px 20px”, borderRadius:10, fontWeight:800, fontSize:14, zIndex:9999, boxShadow:“0 6px 28px rgba(0,0,0,.8)”, display:“flex”, alignItems:“center”, gap:8 }}>
<Ic d={type===“error”?D.xmark:D.check} s={15} c={type===“error”?”#fff”:T.black}/> {msg}
</div>
);
};

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
onFocus={e=>e.target.style.borderColor=T.yellow} onBlur={e=>e.target.style.borderColor=error?T.red:T.border}/>
{isPass && <button type=“button” onClick={()=>setShow(s=>!s)} style={{ position:“absolute”, right:11, top:“50%”, transform:“translateY(-50%)”, background:“none”, border:“none”, cursor:“pointer”, color:T.gray, padding:0, display:“flex” }}><Ic d={show?D.eyeOff:D.eye} s={14}/></button>}
</div>
{error && <p style={{ color:T.red, fontSize:12, margin:“3px 0 0”, fontWeight:600 }}>{error}</p>}
</div>
);
};

const Sel = ({ label, value, onChange, options, error, placeholder, small }) => (

  <div style={{ marginBottom:small?0:16 }}>
    {label && <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:5 }}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:"100%", background:T.dark, border:`1.5px solid ${error?T.red:T.border}`, borderRadius:9, padding:small?"8px 12px":"11px 12px", color:value?T.white:T.gray, fontSize:small?13:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit", appearance:"none", cursor:"pointer" }}
      onFocus={e=>e.target.style.borderColor=T.yellow} onBlur={e=>e.target.style.borderColor=error?T.red:T.border}>
      <option value="">{placeholder||"Selecione..."}</option>
      {options.map(o=><option key={o.v||o} value={o.v||o} style={{ color:T.white, background:T.card }}>{o.l||o}</option>)}
    </select>
    {error && <p style={{ color:T.red, fontSize:12, margin:"3px 0 0", fontWeight:600 }}>{error}</p>}
  </div>
);

const Toggle = ({ active, onClick, children, color=T.yellow }) => (
<button onClick={onClick} style={{ flex:1, padding:“10px 6px”, border:`1.5px solid ${active?color:T.border}`, borderRadius:9, background:active?`${color}1a`:“transparent”, color:active?color:T.gray, fontWeight:800, fontSize:13, cursor:“pointer”, transition:“all .15s”, fontFamily:“inherit” }}>{children}</button>
);

const Btn = ({ children, onClick, variant=“primary”, full, small, disabled }) => {
const S = { primary:{bg:`linear-gradient(135deg,${T.yellow},${T.yellowD})`,color:T.black,border:“none”}, secondary:{bg:“transparent”,color:T.yellow,border:`1.5px solid ${T.yellow}`}, danger:{bg:`${T.red}18`,color:T.red,border:`1px solid ${T.red}44`}, ghost:{bg:“transparent”,color:T.gray,border:`1px solid ${T.border}`} }[variant];
return (
<button onClick={onClick} disabled={disabled} style={{ background:S.bg, color:S.color, border:S.border, borderRadius:9, padding:small?“7px 14px”:“11px 22px”, fontWeight:800, fontSize:small?12:14, cursor:disabled?“not-allowed”:“pointer”, display:“inline-flex”, alignItems:“center”, gap:6, opacity:disabled?.5:1, width:full?“100%”:“auto”, justifyContent:full?“center”:“flex-start”, fontFamily:“inherit” }}
onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity=”.8”;}} onMouseLeave={e=>{e.currentTarget.style.opacity=“1”;}}>
{children}
</button>
);
};

const Badge = ({ children, color=T.yellow }) => (
<span style={{ background:`${color}22`, color, padding:“2px 10px”, borderRadius:20, fontSize:11, fontWeight:800, letterSpacing:.3, textTransform:“uppercase”, whiteSpace:“nowrap” }}>{children}</span>
);

const SLabel = ({ children }) => (

  <p style={{ color:T.yellow, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:1, margin:"0 0 14px" }}>{children}</p>
);

// ── ALERTS ENGINE ─────────────────────────────────────────────────────
const getAlerts = (visits, userId, isGestor) => {
const mine = isGestor ? visits : visits.filter(v=>v.gnId===userId);
const alerts = [];
const today = new Date();

STORES.forEach(store => {
const storeVisits = mine.filter(v=>v.store===store).sort((a,b)=>new Date(b.date)-new Date(a.date));
if(storeVisits.length===0){
alerts.push({ type:“no_visit”, store, msg:`${store} nunca foi visitada`, level:“red” });
return;
}
const last = new Date(storeVisits[0].date+“T12:00:00”);
const daysSince = Math.floor((today-last)/(1000*60*60*24));
if(daysSince>=ALERT_DAYS){
alerts.push({ type:“no_visit”, store, msg:`${store} sem visita há ${daysSince} dias`, level:“red” });
}

```
// Queda de pagamentos
const recent = storeVisits.slice(0,3);
const older  = storeVisits.slice(3,6);
if(recent.length>=2 && older.length>=2){
  const avgRecent = recent.reduce((a,v)=>a+v.payments,0)/recent.length;
  const avgOlder  = older.reduce((a,v)=>a+v.payments,0)/older.length;
  if(avgOlder>0 && avgRecent < avgOlder*0.7){
    alerts.push({ type:"drop", store, msg:`${store} com queda de pagamentos (média caiu ${Math.round((1-avgRecent/avgOlder)*100)}%)`, level:"orange" });
  }
}
```

});

return alerts;
};

// ── AUTH ──────────────────────────────────────────────────────────────
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
if(!form.phone||!/^\d{10,11}$/.test(form.phone)) e.phone=“Telefone inválido”;
if(!form.password||form.password.length<4) e.password=“Mínimo 4 caracteres”;
if(form.password!==form.confirm) e.confirm=“Senhas não coincidem”;
if(LS.users().find(u=>u.phone===form.phone)) e.phone=“Telefone já cadastrado”;
if(Object.keys(e).length){ setErrors(e); return; }
const u={ id:Date.now(), name:form.name.trim(), phone:form.phone, password:form.password, role:form.role };
LS.setU([…LS.users(), u]); onLogin(u);
};

const sw = m=>{ setMode(m); setForm({ name:””, phone:””, password:””, confirm:””, role:“gn” }); setErrors({}); };

return (
<div style={{ minHeight:“100vh”, background:T.black, display:“flex”, alignItems:“center”, justifyContent:“center”, fontFamily:”‘Segoe UI’,system-ui,sans-serif”, padding:20 }}>
<div style={{ width:“100%”, maxWidth:400 }}>
<div style={{ textAlign:“center”, marginBottom:32 }}>
<div style={{ width:56, height:56, background:T.yellow, borderRadius:15, display:“flex”, alignItems:“center”, justifyContent:“center”, margin:“0 auto 14px”, boxShadow:`0 0 40px ${T.yellow}50` }}>
<Ic d={D.store} s={26} c={T.black} sw={2.5}/>
</div>
<h1 style={{ color:T.white, margin:“0 0 4px”, fontSize:24, fontWeight:900, letterSpacing:-.8 }}>Elite <span style={{ color:T.yellow }}>Comercial</span></h1>
</div>
<div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:18, padding:“26px 22px”, boxShadow:“0 20px 60px rgba(0,0,0,.7)” }}>
<div style={{ display:“flex”, background:T.dark, borderRadius:9, padding:3, marginBottom:22 }}>
{[[“login”,“Entrar”],[“signup”,“Cadastrar”]].map(([m,l])=>(
<button key={m} onClick={()=>sw(m)} style={{ flex:1, padding:“9px”, border:“none”, borderRadius:7, cursor:“pointer”, fontWeight:800, fontSize:13, fontFamily:“inherit”, background:mode===m?T.yellow:“transparent”, color:mode===m?T.black:T.gray }}>{l}</button>
))}
</div>
{mode===“login” ? (
<>
<Input label=“Telefone” value={form.phone} onChange={v=>set(“phone”,v)} placeholder=“41999990000” icon={D.phone} error={errors.phone}/>
<Input label=“Senha” value={form.password} onChange={v=>set(“password”,v)} type=“password” placeholder=”••••••••” icon={D.lock} error={errors.password}/>
<Btn onClick={handleLogin} full><Ic d={D.arrow} s={15} c={T.black}/> Entrar</Btn>
</>
) : (
<>
<Input label=“Nome completo” value={form.name} onChange={v=>set(“name”,v)} placeholder=“João da Silva” icon={D.user} error={errors.name}/>
<Input label=“Telefone” value={form.phone} onChange={v=>set(“phone”,v)} placeholder=“41999990000” icon={D.phone} error={errors.phone}/>
<Input label=“Senha” value={form.password} onChange={v=>set(“password”,v)} type=“password” placeholder=“Mínimo 4 caracteres” icon={D.lock} error={errors.password}/>
<Input label=“Confirme a senha” value={form.confirm} onChange={v=>set(“confirm”,v)} type=“password” placeholder=“Repita a senha” icon={D.lock} error={errors.confirm}/>
<Sel label=“Tipo de acesso” value={form.role} onChange={v=>set(“role”,v)} options={[{v:“gn”,l:“GN”},{v:“gestor”,l:“Gestor”}]}/>
<Btn onClick={handleSignup} full><Ic d={D.plus} s={15} c={T.black}/> Criar conta</Btn>
</>
)}
</div>
</div>
</div>
);
};

// ── NAV ───────────────────────────────────────────────────────────────
const Nav = ({ tab, setTab, user, onLogout, alertCount }) => {
const tabs = [
{ id:“visits”,  label:“Registrar”, icon:D.plus  },
{ id:“list”,    label:“Visitas”,   icon:D.list   },
{ id:“alerts”,  label:“Alertas”,   icon:D.alert  },
{ id:“charts”,  label:“Gráficos”,  icon:D.chart  },
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
<button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:“6px 13px”, borderRadius:7, border:“none”, cursor:“pointer”, fontSize:13, fontWeight:700, display:“flex”, alignItems:“center”, gap:5, fontFamily:“inherit”, background:tab===t.id?`${T.yellow}15`:“transparent”, color:tab===t.id?T.yellow:T.gray, borderBottom:tab===t.id?`2px solid ${T.yellow}`:“2px solid transparent”, position:“relative” }}>
<Ic d={t.icon} s={13} c={tab===t.id?T.yellow:T.gray}/> {t.label}
{t.id===“alerts”&&alertCount>0&&<span style={{ background:T.red, color:”#fff”, borderRadius:10, fontSize:9, fontWeight:900, padding:“1px 5px”, position:“absolute”, top:2, right:2 }}>{alertCount}</span>}
</button>
))}
</div>
<div style={{ display:“flex”, alignItems:“center”, gap:10 }}>
<div style={{ textAlign:“right” }}>
<p style={{ margin:0, color:T.white, fontSize:13, fontWeight:700 }}>{user.name.split(” “)[0]}</p>
<span style={{ background:`${user.role==="gestor"?T.yellow:T.green}22`, color:user.role===“gestor”?T.yellow:T.green, padding:“1px 8px”, borderRadius:20, fontSize:10, fontWeight:800 }}>{user.role===“gestor”?“GESTOR”:“GN”}</span>
</div>
<button onClick={onLogout} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:“6px 9px”, cursor:“pointer”, color:T.gray, display:“flex” }}>
<Ic d={D.logout} s={14}/>
</button>
</div>
</nav>
);
};

// ── FORM VISITA ───────────────────────────────────────────────────────
const VisitForm = ({ user, onSaved }) => {
const today = new Date().toISOString().split(“T”)[0];
const [form, setForm] = useState({ date:today, store:””, period:””, payments:””, hadContract:null, relationship:””, notes:”” });
const [checklist, setChecklist] = useState({});
const [previas, setPrevias] = useState([]);
const [errors, setErrors] = useState({});
const set = (k,v)=>{ setForm(f=>({…f,[k]:v})); setErrors(e=>({…e,[k]:””})); };
const addPrevia = () => setPrevias(p=>[…p,{ time:””, store:”” }]);
const removePrevia = i => setPrevias(p=>p.filter((_,idx)=>idx!==i));
const updatePrevia = (i,k,v) => setPrevias(p=>p.map((x,idx)=>idx===i?{…x,[k]:v}:x));

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
const visit = { id:Date.now(), gnId:user.id, gnName:user.name, date:form.date, store:form.store, period:form.period, payments:Number(form.payments), hadContract:form.hadContract, relationship:form.relationship, notes:form.notes, checklist, previas:previas.filter(p=>p.time||p.store), createdAt:new Date().toISOString() };
LS.setV([…LS.visits(), visit]);
setForm({ date:today, store:””, period:””, payments:””, hadContract:null, relationship:””, notes:”” });
setChecklist({}); setPrevias([]); onSaved();
};

return (
<div style={{ maxWidth:600, margin:“0 auto” }}>
<div style={{ marginBottom:22 }}>
<h2 style={{ color:T.white, fontSize:21, fontWeight:900, margin:“0 0 3px”, letterSpacing:-.5 }}>Nova Visita</h2>
<p style={{ color:T.gray, fontSize:13, margin:0 }}>{user.name}</p>
</div>

```
  {/* Dados básicos */}
  <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"20px 18px", marginBottom:12 }}>
    <SLabel>📍 Dados da Visita</SLabel>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
      <div>
        <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:5 }}>Data</label>
        <input type="date" value={form.date} onChange={e=>set("date",e.target.value)}
          style={{ width:"100%", background:T.dark, border:`1.5px solid ${errors.date?T.red:T.border}`, borderRadius:9, padding:"11px 12px", color:T.white, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}/>
      </div>
      <div>
        <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:5 }}>Pagamentos na Loja</label>
        <input type="number" min="0" value={form.payments} onChange={e=>set("payments",e.target.value)} placeholder="0"
          style={{ width:"100%", background:T.dark, border:`1.5px solid ${errors.payments?T.red:T.border}`, borderRadius:9, padding:"11px 12px", color:T.white, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}/>
        {errors.payments&&<p style={{ color:T.red, fontSize:12, margin:"3px 0 0", fontWeight:600 }}>{errors.payments}</p>}
      </div>
    </div>
    <div style={{ marginTop:14 }}>
      <Sel label="Loja Visitada" value={form.store} onChange={v=>set("store",v)} options={STORES} error={errors.store} placeholder="Selecione a loja..."/>
    </div>
    {form.store && (
      <div style={{ marginBottom:16 }}>
        <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:7 }}>Teve contrato na {form.store} hoje?</label>
        <div style={{ display:"flex", gap:10 }}>
          <Toggle active={form.hadContract===true}  onClick={()=>set("hadContract",true)}  color={T.green}>✅ Sim</Toggle>
          <Toggle active={form.hadContract===false} onClick={()=>set("hadContract",false)} color={T.red}>❌ Não</Toggle>
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

  {/* Qualidade da visita */}
  <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"20px 18px", marginBottom:12 }}>
    <SLabel>✅ Qualidade da Visita</SLabel>

    {/* Checklist */}
    <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:8 }}>O que foi feito?</label>
    <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:18 }}>
      {CHECKLIST.map(c=>(
        <div key={c.id} onClick={()=>setChecklist(ch=>({...ch,[c.id]:!ch[c.id]}))}
          style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"10px 14px", border:`1.5px solid ${checklist[c.id]?T.yellow:T.border}`, borderRadius:9, background:checklist[c.id]?`${T.yellow}10`:"transparent", transition:"all .15s" }}>
          <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${checklist[c.id]?T.yellow:T.border}`, background:checklist[c.id]?T.yellow:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {checklist[c.id]&&<Ic d={D.check} s={12} c={T.black} sw={3}/>}
          </div>
          <span style={{ color:checklist[c.id]?T.white:T.gray, fontWeight:600, fontSize:14 }}>{c.label}</span>
        </div>
      ))}
    </div>

    {/* Relacionamento */}
    <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:8 }}>Relacionamento com a Loja</label>
    <div style={{ display:"flex", gap:10, marginBottom:18 }}>
      {RELATIONSHIP.map(r=>(
        <Toggle key={r.id} active={form.relationship===r.id} onClick={()=>set("relationship",r.id)} color={r.color}>{r.label}</Toggle>
      ))}
    </div>

    {/* Observações */}
    <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:6 }}>Observações</label>
    <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Ex: gerente trocou, acordo com outro banco, problema de crédito..."
      style={{ width:"100%", background:T.dark, border:`1.5px solid ${T.border}`, borderRadius:9, padding:"11px 12px", color:T.white, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit", resize:"vertical", minHeight:80 }}
      onFocus={e=>e.target.style.borderColor=T.yellow} onBlur={e=>e.target.style.borderColor=T.border}/>
  </div>

  {/* Prévias */}
  <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"20px 18px", marginBottom:14 }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:previas.length>0?14:0 }}>
      <SLabel style={{ margin:0 }}>🕐 Prévias</SLabel>
      <Btn onClick={addPrevia} variant="secondary" small><Ic d={D.plus} s={13} c={T.yellow}/> Adicionar</Btn>
    </div>
    {previas.length===0 && <p style={{ color:T.gray, fontSize:13, margin:"8px 0 0" }}>Nenhuma prévia registrada.</p>}
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {previas.map((p,i)=>(
        <div key={i} style={{ background:T.card2, border:`1px solid ${T.border2}`, borderRadius:12, padding:"14px 15px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <span style={{ color:T.yellow, fontWeight:800, fontSize:13 }}>Prévia {i+1}</span>
            <button onClick={()=>removePrevia(i)} style={{ background:`${T.red}15`, border:`1px solid ${T.red}33`, borderRadius:6, padding:"3px 6px", cursor:"pointer", color:T.red, display:"flex" }}><Ic d={D.xmark} s={12}/></button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1.8fr", gap:10, marginBottom:10 }}>
            <Sel value={p.time} onChange={v=>updatePrevia(i,"time",v)} options={PREV_TIMES.map(pt=>({v:pt.id,l:pt.label}))} placeholder="Horário..." small/>
            <Sel value={p.store} onChange={v=>updatePrevia(i,"store",v)} options={STORES} placeholder="Loja pagante..." small/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", display:"block", marginBottom:4 }}>Valor (R$)</label>
              <input type="number" min="0" value={p.value||""} onChange={e=>updatePrevia(i,"value",e.target.value)} placeholder="0"
                style={{ width:"100%", background:T.dark, border:`1.5px solid ${T.border}`, borderRadius:8, padding:"8px 11px", color:T.white, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}/>
            </div>
            <div>
              <label style={{ color:T.gray, fontSize:11, fontWeight:800, textTransform:"uppercase", display:"block", marginBottom:4 }}>Qtd. Contratos</label>
              <input type="number" min="0" value={p.contracts||""} onChange={e=>updatePrevia(i,"contracts",e.target.value)} placeholder="0"
                style={{ width:"100%", background:T.dark, border:`1.5px solid ${T.border}`, borderRadius:8, padding:"8px 11px", color:T.white, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}/>
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            {[{ key:"insurance",label:"🛡 Seguro",color:T.green },{ key:"special",label:"⭐ Taxa Especial",color:T.blue }].map(opt=>(
              <button key={opt.key} onClick={()=>updatePrevia(i,opt.key,!p[opt.key])}
                style={{ flex:1, padding:"8px", border:`1.5px solid ${p[opt.key]?opt.color:T.border}`, borderRadius:9, background:p[opt.key]?`${opt.color}18`:"transparent", color:p[opt.key]?opt.color:T.gray, fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
  <Btn onClick={submit} full><Ic d={D.check} s={16} c={T.black}/> Salvar Visita</Btn>
</div>
```

);
};

// ── LISTA ─────────────────────────────────────────────────────────────
const VisitList = ({ user, refresh }) => {
const [filter, setFilter] = useState(””);
const [expanded, setExpanded] = useState(null);
const all = LS.visits();
const mine = user.role===“gn”?all.filter(v=>v.gnId===user.id):all;
const shown = filter ? mine.filter(v=>v.store.toLowerCase().includes(filter.toLowerCase())||v.gnName.toLowerCase().includes(filter.toLowerCase())) : mine;
const sorted = […shown].sort((a,b)=>new Date(b.date)-new Date(a.date));
const del = id=>{ if(user.role!==“gestor”)return; LS.setV(LS.visits().filter(v=>v.id!==id)); refresh(); };
const relColor = r=>({ quente:T.green, morno:T.orange, frio:T.blue })[r]||T.gray;

return (
<div>
<div style={{ display:“flex”, justifyContent:“space-between”, alignItems:“center”, marginBottom:18, flexWrap:“wrap”, gap:10 }}>
<div>
<h2 style={{ color:T.white, fontSize:21, fontWeight:900, margin:“0 0 2px”, letterSpacing:-.5 }}>Visitas</h2>
<p style={{ color:T.gray, fontSize:13, margin:0 }}>{sorted.length} registro(s)</p>
</div>
<input value={filter} onChange={e=>setFilter(e.target.value)} placeholder=“Buscar loja ou GN…”
style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:9, padding:“8px 14px”, color:T.white, fontSize:13, outline:“none”, fontFamily:“inherit”, width:210 }}/>
</div>
{sorted.length===0 && <div style={{ textAlign:“center”, padding:“56px 0”, color:T.gray }}><p>Nenhuma visita.</p></div>}
<div style={{ display:“flex”, flexDirection:“column”, gap:8 }}>
{sorted.map(v=>{
const isOpen = expanded===v.id;
const prevCount = (v.previas||[]).filter(p=>p.time||p.store).length;
const relInfo = RELATIONSHIP.find(r=>r.id===v.relationship);
return (
<div key={v.id} style={{ background:T.card, border:`1px solid ${isOpen?T.yellow+"55":T.border}`, borderRadius:13, overflow:“hidden” }}>
<div onClick={()=>setExpanded(isOpen?null:v.id)} style={{ padding:“13px 16px”, display:“flex”, gap:12, alignItems:“flex-start”, cursor:“pointer” }}>
<div style={{ flex:1, minWidth:0 }}>
<div style={{ display:“flex”, gap:7, flexWrap:“wrap”, marginBottom:5, alignItems:“center” }}>
<span style={{ fontWeight:800, color:T.white, fontSize:14 }}>{v.store}</span>
{user.role===“gestor”&&<Badge color="#818cf8">{v.gnName.split(” “)[0]}</Badge>}
<Badge color={v.period===“manha”?”#fbbf24”:”#a78bfa”}>{v.period===“manha”?“Manhã”:“Tarde”}</Badge>
{v.hadContract===true  && <Badge color={T.green}>✅ Contrato</Badge>}
{v.hadContract===false && <Badge color={T.red}>❌ Sem contrato</Badge>}
{relInfo && <Badge color={relInfo.color}>{relInfo.label}</Badge>}
{prevCount>0 && <Badge color={T.yellow}>🕐 {prevCount} prévia(s)</Badge>}
</div>
<div style={{ display:“flex”, gap:14, flexWrap:“wrap” }}>
<span style={{ color:T.gray, fontSize:12 }}>📅 {new Date(v.date+“T12:00:00”).toLocaleDateString(“pt-BR”)}</span>
<span style={{ color:T.green, fontSize:12, fontWeight:700 }}>💳 {v.payments} pag.</span>
{v.checklist && Object.values(v.checklist).filter(Boolean).length>0 && <span style={{ color:T.yellow, fontSize:12 }}>✅ {Object.values(v.checklist).filter(Boolean).length} itens</span>}
</div>
</div>
<div style={{ display:“flex”, gap:7, flexShrink:0, alignItems:“center” }}>
<span style={{ color:T.gray, fontSize:18 }}>›</span>
{user.role===“gestor”&&<button onClick={e=>{e.stopPropagation();del(v.id);}} style={{ background:`${T.red}12`, border:`1px solid ${T.red}30`, borderRadius:7, padding:“5px 7px”, cursor:“pointer”, color:T.red, display:“flex” }}><Ic d={D.trash} s={13}/></button>}
</div>
</div>
{isOpen && (
<div style={{ borderTop:`1px solid ${T.border}`, padding:“14px 16px”, background:T.card2 }}>
{/* Checklist */}
{v.checklist && Object.keys(v.checklist).some(k=>v.checklist[k]) && (
<div style={{ marginBottom:12 }}>
<p style={{ color:T.yellow, fontSize:11, fontWeight:800, textTransform:“uppercase”, margin:“0 0 7px” }}>Checklist</p>
<div style={{ display:“flex”, gap:6, flexWrap:“wrap” }}>
{CHECKLIST.filter(c=>v.checklist[c.id]).map(c=><Badge key={c.id} color={T.green}>✅ {c.label}</Badge>)}
</div>
</div>
)}
{/* Observações */}
{v.notes && (
<div style={{ marginBottom:12 }}>
<p style={{ color:T.yellow, fontSize:11, fontWeight:800, textTransform:“uppercase”, margin:“0 0 5px” }}>Observações</p>
<p style={{ color:T.grayL||”#aaa”, fontSize:13, margin:0, background:T.card, padding:“9px 12px”, borderRadius:8, border:`1px solid ${T.border}` }}>{v.notes}</p>
</div>
)}
{/* Prévias */}
{prevCount>0 && (
<div>
<p style={{ color:T.yellow, fontSize:11, fontWeight:800, textTransform:“uppercase”, margin:“0 0 7px” }}>Prévias</p>
{v.previas.filter(p=>p.time||p.store).map((p,i)=>{
const tLabel = PREV_TIMES.find(x=>x.id===p.time)?.label||p.time||”—”;
return (
<div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:9, padding:“10px 13px”, marginBottom:7 }}>
<div style={{ display:“flex”, gap:8, flexWrap:“wrap”, marginBottom:5 }}>
<Badge color={T.yellow}>🕐 {tLabel}</Badge>
{p.store&&<span style={{ color:T.white, fontSize:13, fontWeight:600 }}>🏪 {p.store}</span>}
</div>
<div style={{ display:“flex”, gap:6, flexWrap:“wrap” }}>
{p.contracts>0&&<span style={{ background:`${T.purple}22`, color:T.purple, padding:“2px 9px”, borderRadius:20, fontSize:11, fontWeight:800 }}>📄 {p.contracts} contratos</span>}
{p.value>0&&<span style={{ background:`${T.yellow}22`, color:T.yellow, padding:“2px 9px”, borderRadius:20, fontSize:11, fontWeight:800 }}>💰 R$ {Number(p.value).toLocaleString(“pt-BR”)}</span>}
{p.insurance&&<span style={{ background:`${T.green}22`, color:T.green, padding:“2px 9px”, borderRadius:20, fontSize:11, fontWeight:800 }}>🛡 Seguro</span>}
{p.special&&<span style={{ background:`${T.blue}22`, color:T.blue, padding:“2px 9px”, borderRadius:20, fontSize:11, fontWeight:800 }}>⭐ Taxa Especial</span>}
</div>
</div>
);
})}
</div>
)}
</div>
)}
</div>
);
})}
</div>
</div>
);
};

// ── ALERTAS ───────────────────────────────────────────────────────────
const AlertsPanel = ({ user }) => {
const visits = LS.visits();
const isGestor = user.role===“gestor”;
const alerts = getAlerts(visits, user.id, isGestor);

const exportCSV = () => {
const rows = [[“Tipo”,“Loja”,“Mensagem”,“Nível”]];
alerts.forEach(a=>rows.push([a.type, a.store, a.msg, a.level]));
const csv = rows.map(r=>r.join(”;”)).join(”\n”);
const blob = new Blob([csv], { type:“text/csv;charset=utf-8;” });
const url = URL.createObjectURL(blob);
const a = document.createElement(“a”); a.href=url; a.download=“alertas_elite.csv”; a.click();
};

return (
<div style={{ maxWidth:700, margin:“0 auto” }}>
<div style={{ display:“flex”, justifyContent:“space-between”, alignItems:“center”, marginBottom:20, flexWrap:“wrap”, gap:10 }}>
<div>
<h2 style={{ color:T.white, fontSize:21, fontWeight:900, margin:“0 0 2px”, letterSpacing:-.5 }}>⚠️ Alertas</h2>
<p style={{ color:T.gray, fontSize:13, margin:0 }}>{alerts.length} alerta(s) ativos</p>
</div>
{alerts.length>0&&<Btn onClick={exportCSV} variant="secondary" small><Ic d={D.download} s={13} c={T.yellow}/> Exportar CSV</Btn>}
</div>

```
  {alerts.length===0 && (
    <div style={{ textAlign:"center", padding:"60px 0", color:T.gray }}>
      <Ic d={D.check} s={48} c={T.green}/>
      <p style={{ marginTop:12, fontSize:15, color:T.green, fontWeight:700 }}>Tudo certo! Nenhum alerta no momento.</p>
    </div>
  )}

  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
    {alerts.map((a,i)=>{
      const color = a.level==="red"?T.red:T.orange;
      return (
        <div key={i} style={{ background:T.card, border:`1px solid ${color}44`, borderRadius:12, padding:"14px 16px", display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ width:36, height:36, background:`${color}18`, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Ic d={D.alert} s={16} c={color}/>
          </div>
          <div>
            <p style={{ margin:"0 0 3px", color:T.white, fontWeight:700, fontSize:14 }}>{a.store}</p>
            <p style={{ margin:0, color:color, fontSize:13 }}>{a.msg}</p>
          </div>
        </div>
      );
    })}
  </div>

  {/* Info sobre regras */}
  <div style={{ background:`${T.yellow}0a`, border:`1px solid ${T.yellow}22`, borderRadius:12, padding:"13px 16px", marginTop:20 }}>
    <p style={{ color:T.yellow, fontSize:12, fontWeight:700, margin:"0 0 5px" }}>📋 Regras de alerta</p>
    <p style={{ color:T.gray, fontSize:12, margin:0 }}>🔴 Loja sem visita há <strong style={{ color:T.white }}>{ALERT_DAYS}+ dias</strong> — alerta crítico<br/>🟠 Queda de pagamentos superior a <strong style={{ color:T.white }}>30%</strong> nas últimas visitas</p>
  </div>
</div>
```

);
};

// ── EXPORTAÇÃO ────────────────────────────────────────────────────────
const exportWeeklyCSV = (visits, user) => {
const isGestor = user.role===“gestor”;
const mine = isGestor ? visits : visits.filter(v=>v.gnId===user.id);
const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate()-7);
const weekly = mine.filter(v=>new Date(v.date+“T12:00:00”)>=oneWeekAgo);

const rows = [[“Data”,“GN”,“Loja”,“Período”,“Pagamentos”,“Contrato”,“Relacionamento”,“Apresentou Produto”,“Treinou Vendedor”,“Deixou Material”,“Observações”,“Prévias”]];
weekly.forEach(v=>{
const ch = v.checklist||{};
const prevStr = (v.previas||[]).filter(p=>p.time||p.store).map(p=>`${PREV_TIMES.find(x=>x.id===p.time)?.label||p.time} - ${p.store} (R$${p.value||0} / ${p.contracts||0} contr.)`).join(” | “);
rows.push([
new Date(v.date+“T12:00:00”).toLocaleDateString(“pt-BR”),
v.gnName, v.store,
v.period===“manha”?“Manhã”:“Tarde”,
v.payments,
v.hadContract?“Sim”:“Não”,
v.relationship||””,
ch.apresentou?“Sim”:“Não”,
ch.treinou?“Sim”:“Não”,
ch.material?“Sim”:“Não”,
v.notes||””,
prevStr,
]);
});

const csv = “\uFEFF” + rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(”;”)).join(”\n”);
const blob = new Blob([csv], { type:“text/csv;charset=utf-8;” });
const url = URL.createObjectURL(blob);
const a = document.createElement(“a”); a.href=url; a.download=`relatorio_semanal_elite_${new Date().toISOString().split("T")[0]}.csv`; a.click();
};

// ── GRÁFICOS ─────────────────────────────────────────────────────────
const Charts = ({ user }) => {
const allVisits = LS.visits();
const mine = user.role===“gn” ? allVisits.filter(v=>v.gnId===user.id) : allVisits;
const isGestor = user.role===“gestor”;

const byStore = STORES.map(s=>{
const vs = mine.filter(v=>v.store===s);
const prevS = mine.flatMap(v=>(v.previas||[]).filter(p=>p.store===s));
const relCounts = { quente:0, morno:0, frio:0 };
vs.forEach(v=>{ if(v.relationship) relCounts[v.relationship]=(relCounts[v.relationship]||0)+1; });
const lastRel = vs.sort((a,b)=>new Date(b.date)-new Date(a.date))[0]?.relationship||””;
return { name:s, visitas:vs.length, comContrato:vs.filter(v=>v.hadContract===true).length, semContrato:vs.filter(v=>v.hadContract===false).length, pagamentos:vs.reduce((a,v)=>a+v.payments,0), previas:prevS.length, valor:prevS.reduce((a,p)=>a+(Number(p.value)||0),0), lastRel };
}).filter(x=>x.visitas>0);

const days = Array.from({length:14},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(13-i)); return d.toISOString().split(“T”)[0]; });
const byDay = days.map(d=>({ name:d.slice(5), visitas:mine.filter(v=>v.date===d).length, contratos:mine.filter(v=>v.date===d&&v.hadContract===true).length }));

const allPrev = mine.flatMap(v=>v.previas||[]).filter(p=>p.time||p.store);
const checkStats = CHECKLIST.map(c=>({ name:c.label, total:mine.filter(v=>v.checklist&&v.checklist[c.id]).length }));
const relStats = RELATIONSHIP.map(r=>({ name:r.label, total:mine.filter(v=>v.relationship===r.id).length }));

const kpis = [
{ label:“Visitas”,       value:mine.length,                                           icon:“🏪”, color:T.yellow },
{ label:“Com Contrato”,  value:mine.filter(v=>v.hadContract===true).length,           icon:“✅”, color:T.green  },
{ label:“Pagamentos”,    value:mine.reduce((a,v)=>a+v.payments,0),                   icon:“💳”, color:T.blue   },
{ label:“Prévias”,       value:allPrev.length,                                        icon:“🕐”, color:T.purple },
{ label:“Valor Prévias”, value:`R$${allPrev.reduce((a,p)=>a+(Number(p.value)||0),0).toLocaleString("pt-BR")}`, icon:“💰”, color:T.orange },
{ label:“Lojas Quentes”, value:mine.filter(v=>v.relationship===“quente”).length,      icon:“🔥”, color:T.green  },
];

const CC = ({title,children,full})=>(
<div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:“17px 13px 10px”, gridColumn:full?“1 / -1”:undefined }}>
<h3 style={{ color:T.gray, fontSize:10, fontWeight:800, textTransform:“uppercase”, letterSpacing:1, margin:“0 0 14px” }}>{title}</h3>
{children}
</div>
);
const tip = { contentStyle:{ background:T.dark, border:`1px solid ${T.border}`, borderRadius:8, color:T.white, fontSize:12 }, labelStyle:{ color:T.yellow, fontWeight:700 } };

return (
<div>
<div style={{ display:“flex”, justifyContent:“space-between”, alignItems:“center”, marginBottom:20, flexWrap:“wrap”, gap:10 }}>
<div>
<h2 style={{ color:T.white, fontSize:21, fontWeight:900, margin:“0 0 2px”, letterSpacing:-.5 }}>{isGestor?“Painel Geral”:“Meus Resultados”}</h2>
</div>
<Btn onClick={()=>exportWeeklyCSV(LS.visits(), user)} variant=“secondary” small>
<Ic d={D.download} s={13} c={T.yellow}/> Relatório Semanal
</Btn>
</div>

```
  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:14 }}>
    {kpis.map(k=>(
      <div key={k.label} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"13px 12px" }}>
        <p style={{ margin:"0 0 5px", fontSize:17 }}>{k.icon}</p>
        <p style={{ margin:"0 0 2px", color:k.color, fontSize:22, fontWeight:900, lineHeight:1 }}>{k.value}</p>
        <p style={{ margin:0, color:T.gray, fontSize:10, fontWeight:700, textTransform:"uppercase" }}>{k.label}</p>
      </div>
    ))}
  </div>

  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11 }}>
    <CC title="Visitas por Loja — Contratos" full>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={byStore}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
          <XAxis dataKey="name" tick={{ fill:T.gray, fontSize:10 }} interval={0} angle={-18} textAnchor="end" height={38}/>
          <YAxis tick={{ fill:T.gray, fontSize:11 }} allowDecimals={false}/>
          <Tooltip {...tip}/>
          <Legend wrapperStyle={{ color:T.gray, fontSize:11 }}/>
          <Bar dataKey="comContrato" name="Com Contrato" fill={T.green} radius={[3,3,0,0]} stackId="a"/>
          <Bar dataKey="semContrato" name="Sem Contrato" fill={T.red}   radius={[3,3,0,0]} stackId="a"/>
        </BarChart>
      </ResponsiveContainer>
    </CC>

    <CC title="Checklist — Qualidade das Visitas">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={checkStats}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
          <XAxis dataKey="name" tick={{ fill:T.gray, fontSize:11 }}/>
          <YAxis tick={{ fill:T.gray, fontSize:11 }} allowDecimals={false}/>
          <Tooltip {...tip}/>
          <Bar dataKey="total" name="Visitas" fill={T.yellow} radius={[3,3,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </CC>

    <CC title="Relacionamento com as Lojas">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={relStats}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
          <XAxis dataKey="name" tick={{ fill:T.gray, fontSize:12 }}/>
          <YAxis tick={{ fill:T.gray, fontSize:11 }} allowDecimals={false}/>
          <Tooltip {...tip}/>
          <Bar dataKey="total" name="Lojas" fill={T.orange} radius={[3,3,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </CC>

    <CC title="Últimos 14 dias">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={byDay}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
          <XAxis dataKey="name" tick={{ fill:T.gray, fontSize:10 }}/>
          <YAxis tick={{ fill:T.gray, fontSize:11 }} allowDecimals={false}/>
          <Tooltip {...tip}/>
          <Legend wrapperStyle={{ color:T.gray, fontSize:11 }}/>
          <Line type="monotone" dataKey="visitas"   name="Visitas"   stroke={T.yellow} strokeWidth={2.5} dot={{ fill:T.yellow, r:3 }}/>
          <Line type="monotone" dataKey="contratos" name="Contratos" stroke={T.green}  strokeWidth={2}   dot={{ fill:T.green,  r:3 }}/>
        </LineChart>
      </ResponsiveContainer>
    </CC>
  </div>
</div>
```

);
};

// ── EQUIPE ────────────────────────────────────────────────────────────
const TeamPanel = ({ currentUser }) => {
const [users, setUsers] = useState(LS.users());
const remove = id=>{ if(id===currentUser.id)return; LS.setU(LS.users().filter(u=>u.id!==id)); setUsers(LS.users()); };
const Sec = ({ title, list, color }) => (
<div style={{ marginBottom:22 }}>
<h3 style={{ color, fontSize:11, fontWeight:800, textTransform:“uppercase”, letterSpacing:1, marginBottom:11 }}>{title} ({list.length})</h3>
<div style={{ display:“flex”, flexDirection:“column”, gap:7 }}>
{list.map(u=>(
<div key={u.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:11, padding:“11px 14px”, display:“flex”, alignItems:“center”, gap:12 }}>
<div style={{ flex:1 }}>
<p style={{ margin:0, color:T.white, fontWeight:700, fontSize:13 }}>{u.name}</p>
<p style={{ margin:0, color:T.gray, fontSize:12 }}>📱 {u.phone}</p>
</div>
<Badge color={color}>{u.role===“gestor”?“Gestor”:“GN”}</Badge>
{u.id!==currentUser.id&&<button onClick={()=>remove(u.id)} style={{ background:`${T.red}12`, border:`1px solid ${T.red}30`, borderRadius:7, padding:“5px 7px”, cursor:“pointer”, color:T.red, display:“flex” }}><Ic d={D.trash} s={13}/></button>}
</div>
))}
{list.length===0&&<p style={{ color:T.gray, fontSize:13 }}>Nenhum cadastrado.</p>}
</div>
</div>
);
return (
<div style={{ maxWidth:580, margin:“0 auto” }}>
<h2 style={{ color:T.white, fontSize:21, fontWeight:900, margin:“0 0 20px”, letterSpacing:-.5 }}>Equipe</h2>
<Sec title=“Gestores” list={users.filter(u=>u.role===“gestor”)} color={T.yellow}/>
<Sec title=“GNs”      list={users.filter(u=>u.role===“gn”)}     color={T.green}/>
</div>
);
};

// ── APP ROOT ──────────────────────────────────────────────────────────
export default function App() {
const [user, setUser]   = useState(null);
const [tab, setTab]     = useState(“visits”);
const [toast, setToast] = useState(null);
const [tick, setTick]   = useState(0);
const showToast = useCallback((msg,type=“success”)=>setToast({msg,type}),[]);
const refresh   = useCallback(()=>setTick(t=>t+1),[]);

const alerts = user ? getAlerts(LS.visits(), user.id, user.role===“gestor”) : [];

if(!user) return <AuthScreen onLogin={u=>{ setUser(u); setTab(“visits”); }}/>;

return (
<div style={{ minHeight:“100vh”, background:T.black, fontFamily:”‘Segoe UI’,system-ui,sans-serif” }}>
<Nav tab={tab} setTab={setTab} user={user} onLogout={()=>setUser(null)} alertCount={alerts.length}/>
<div style={{ maxWidth:940, margin:“0 auto”, padding:“26px 18px” }}>
{tab===“visits” && <VisitForm  key={tick} user={user} onSaved={()=>{ showToast(“Visita salva!”); refresh(); }}/>}
{tab===“list”   && <VisitList  key={tick} user={user} refresh={refresh}/>}
{tab===“alerts” && <AlertsPanel key={tick} user={user}/>}
{tab===“charts” && <Charts     key={tick} user={user}/>}
{tab===“team”   && user.role===“gestor” && <TeamPanel key={tick} currentUser={user}/>}
</div>
{toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
</div>
);
}
