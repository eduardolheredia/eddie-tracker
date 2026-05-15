import { useState, useEffect, useRef } from "react";

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const START_DATE = new Date('2025-05-19');

function getWeekNumber(date) {
  const diff = Math.floor((date - START_DATE) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(0, diff) + 1;
}
function getPhase(w) { return w <= 4 ? 1 : w <= 8 ? 2 : 3; }
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function fmtDate(date) { return MONTHS[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear(); }
function dateKey(date) { return date.toDateString(); }

const WORKOUTS = {
  push_p1: { name:'Push Day', sub:'Chest · Shoulders · Triceps', phase:'Weeks 1–4: Machine Foundation', ex:[
    {id:'p1',n:'Machine chest press',s:'4×10',tip:'Full range, controlled descent'},
    {id:'p2',n:'Machine incline chest press',s:'3×10',tip:'Feel the upper chest stretch'},
    {id:'p3',n:'Machine shoulder press',s:'3×10',tip:"Don't lock elbows at top"},
    {id:'p4',n:'Machine lateral raise',s:'3×15',tip:'Lead with elbows, not wrists'},
    {id:'p5',n:'Cable tricep pushdown',s:'3×12',tip:'Elbows pinned to sides'},
    {id:'p6',n:'Machine tricep extension',s:'3×12',tip:'Full extension at bottom'},
    {id:'p7',n:'Incline treadmill',s:'20 min · 10% · 3–4 mph',tip:"Don't hold the rails"},
  ]},
  pull_p1: { name:'Pull Day', sub:'Back · Biceps', phase:'Weeks 1–4: Machine Foundation', ex:[
    {id:'q1',n:'Seated cable row',s:'4×10',tip:'Squeeze shoulder blades at peak'},
    {id:'q2',n:'Lat pulldown machine',s:'4×10',tip:'Pull to upper chest, lean back slightly'},
    {id:'q3',n:'Machine chest supported row',s:'3×10',tip:'Full stretch at extension'},
    {id:'q4',n:'Cable face pulls',s:'3×15',tip:'Pull to forehead level, external rotation'},
    {id:'q5',n:'Machine preacher curl',s:'3×12',tip:'Full extension at bottom'},
    {id:'q6',n:'Cable hammer curl',s:'3×12',tip:'Neutral grip throughout'},
    {id:'q7',n:'Incline treadmill',s:'20 min · 10% · 3–4 mph',tip:'Steady pace'},
  ]},
  legs_p1: { name:'Leg Day', sub:'Quads · Hamstrings · Calves · Core', phase:'Weeks 1–4: Machine Foundation', ex:[
    {id:'l1',n:'Leg press machine',s:'4×12',tip:'Feet hip-width, full range'},
    {id:'l2',n:'Leg curl machine',s:'3×12',tip:'Controlled negative'},
    {id:'l3',n:'Leg extension machine',s:'3×12',tip:'Squeeze at top for 1 sec'},
    {id:'l4',n:'Seated calf raise machine',s:'4×15',tip:'Full stretch at bottom'},
    {id:'l5',n:'Ab crunch machine',s:'3×15',tip:'Exhale on the way down'},
    {id:'l6',n:'Plank',s:'3×45 sec',tip:'Neutral spine, breathe steadily'},
    {id:'l7',n:'Incline treadmill',s:'20 min · 10% · 3–4 mph',tip:'Steady pace'},
  ]},
  push_p2: { name:'Push Day', sub:'Chest · Shoulders · Triceps', phase:'Weeks 5–8: Adding Cables', ex:[
    {id:'p1',n:'Machine chest press',s:'4×10',tip:'Increase weight from phase 1'},
    {id:'p2b',n:'Cable chest flye',s:'3×12',tip:'Keep slight bend in elbows, squeeze at center'},
    {id:'p3',n:'Machine shoulder press',s:'3×10',tip:'Heavier than phase 1'},
    {id:'p4b',n:'Cable lateral raise',s:'3×15',tip:'Better range than machine'},
    {id:'p5b',n:'Cable overhead tricep extension',s:'3×12',tip:'Long head emphasis'},
    {id:'p6',n:'Machine tricep extension',s:'3×12',tip:'Drop set on last set'},
    {id:'p7',n:'Incline treadmill',s:'20 min · 10% · 3–4 mph',tip:'Steady pace'},
  ]},
  pull_p2: { name:'Pull Day', sub:'Back · Biceps', phase:'Weeks 5–8: Adding Cables', ex:[
    {id:'q1',n:'Seated cable row',s:'4×10',tip:'Heavier than phase 1'},
    {id:'q2',n:'Lat pulldown machine',s:'4×10',tip:'Try wide grip'},
    {id:'q3b',n:'Cable straight arm pulldown',s:'3×12',tip:'Great lat isolation'},
    {id:'q4',n:'Cable face pulls',s:'3×15',tip:'Rear delt focus'},
    {id:'q5b',n:'Cable curl',s:'3×12',tip:'Constant tension vs machine'},
    {id:'q6',n:'Cable hammer curl',s:'3×12',tip:'Superset with cable curl'},
    {id:'q7',n:'Incline treadmill',s:'20 min · 10% · 3–4 mph',tip:'Steady pace'},
  ]},
  legs_p2: { name:'Leg Day', sub:'Quads · Hamstrings · Calves · Core', phase:'Weeks 5–8: Adding Cables', ex:[
    {id:'l1',n:'Leg press machine',s:'4×12',tip:'Heavier than phase 1'},
    {id:'l2',n:'Leg curl machine',s:'3×12',tip:'Add ankle weight if available'},
    {id:'l3',n:'Leg extension machine',s:'3×12',tip:'Increase weight from phase 1'},
    {id:'l4b',n:'Cable pull-through',s:'3×12',tip:'Hip hinge, great glute/hamstring'},
    {id:'l4',n:'Seated calf raise machine',s:'4×15',tip:'Heavier than phase 1'},
    {id:'l5b',n:'Cable crunch',s:'3×15',tip:'Better than machine for abs'},
    {id:'l7',n:'Incline treadmill',s:'20 min · 10% · 3–4 mph',tip:'Steady pace'},
  ]},
  push_p3: { name:'Push Day', sub:'Chest · Shoulders · Triceps', phase:'Weeks 9–12: Compound Focus', ex:[
    {id:'p1c',n:'Dumbbell bench press',s:'4×8',tip:'Full range, heavy. Rest 90 sec.'},
    {id:'p2c',n:'Incline dumbbell press',s:'3×10',tip:'Upper chest emphasis'},
    {id:'p3c',n:'Dumbbell shoulder press',s:'3×10',tip:'More range than machine'},
    {id:'p4b',n:'Cable lateral raise superset',s:'3×15',tip:'No rest between sets'},
    {id:'p5b',n:'Cable overhead tricep extension',s:'3×10',tip:'Heavy, full stretch'},
    {id:'p7',n:'Incline treadmill',s:'20 min · 10% · 3–4 mph',tip:'Steady pace'},
  ]},
  pull_p3: { name:'Pull Day', sub:'Back · Biceps', phase:'Weeks 9–12: Compound Focus', ex:[
    {id:'q1c',n:'Dumbbell single arm row',s:'4×10 each',tip:'Full stretch, drive elbow to ceiling'},
    {id:'q2',n:'Lat pulldown machine',s:'4×8',tip:'Heavy. Full stretch at top.'},
    {id:'q3b',n:'Cable straight arm pulldown',s:'3×12',tip:'Superset with rows'},
    {id:'q4',n:'Cable face pulls',s:'3×15',tip:'Rear delt, shoulder health'},
    {id:'q5c',n:'Dumbbell curl',s:'4×10',tip:'Alternate arms, full supination'},
    {id:'q7',n:'Incline treadmill',s:'20 min · 10% · 3–4 mph',tip:'Steady pace'},
  ]},
  legs_p3: { name:'Leg Day', sub:'Quads · Hamstrings · Calves · Core', phase:'Weeks 9–12: Compound Focus', ex:[
    {id:'l1c',n:'Dumbbell goblet squat',s:'4×12',tip:'Chest up, knees track toes'},
    {id:'l2c',n:'Romanian deadlift',s:'4×10',tip:'Hinge at hips, feel hamstring stretch'},
    {id:'l3',n:'Leg extension machine',s:'3×12',tip:'Finisher for quads'},
    {id:'l4',n:'Seated calf raise machine',s:'4×15',tip:'Full range, heavy'},
    {id:'l5c',n:'Hanging knee raise',s:'3×15',tip:'Control the negative'},
    {id:'l6',n:'Plank',s:'3×60 sec',tip:'Progress from 45 sec phase 1'},
    {id:'l7',n:'Incline treadmill',s:'20 min · 10% · 3–4 mph',tip:'Steady pace'},
  ]},
  weekend: { name:'Active Recovery', sub:'Mobility · Light Core · Walk', phase:'Weekend — no muscle burnout', ex:[
    {id:'w1',n:'20 min walk outdoors',s:'Easy pace, flat ground',tip:'Promotes blood flow without taxing muscles'},
    {id:'w2',n:'Hip flexor stretch',s:'3×45 sec each side',tip:'Hold lunge position, push hips forward'},
    {id:'w3',n:'Doorway chest stretch',s:'3×45 sec',tip:'Arms at 90°, lean forward gently'},
    {id:'w4',n:'Cat-cow stretch',s:'2×10 reps',tip:'Slow and controlled, breathe'},
    {id:'w5',n:'Dead hang from bar',s:'3×20 sec',tip:'Decompresses spine, stretches lats'},
    {id:'w6',n:'Bodyweight glute bridge',s:'2×15',tip:'Activates glutes without fatigue'},
  ]},
};

function getWorkoutForDay(dayName, date) {
  const week = getWeekNumber(date);
  const phase = getPhase(week);
  const suffix = phase === 1 ? '_p1' : phase === 2 ? '_p2' : '_p3';
  if (dayName === 'Saturday' || dayName === 'Sunday') return WORKOUTS.weekend;
  const map = { Monday:'push', Tuesday:'pull', Wednesday:'legs', Thursday:'push', Friday:'pull' };
  const base = map[dayName];
  if (!base) return null;
  return WORKOUTS[base + suffix];
}

const BASE_MEALS = {
  Monday:    [{id:'m1',time:'7:00am',name:'Core Power Elite + Isopure',cal:360,p:67,c:9,f:5},{id:'m2',time:'7:00am',name:'Fuel Meals Proats cup',cal:210,p:30,c:17,f:3},{id:'m3',time:'10:30am',name:'Egg White Scramble',cal:350,p:34,c:18,f:15},{id:'m4',time:'1:30pm',name:'BBQ Grilled Chicken',cal:560,p:57,c:63,f:8},{id:'m5',time:'5:00pm',name:'Chimichurri Steak',cal:460,p:42,c:26,f:21}],
  Tuesday:   [{id:'m1',time:'7:00am',name:'Core Power Elite + Isopure',cal:360,p:67,c:9,f:5},{id:'m2',time:'7:00am',name:'Fuel Meals Proats cup',cal:210,p:30,c:17,f:3},{id:'m3',time:'10:30am',name:'Egg White Scramble',cal:350,p:34,c:18,f:15},{id:'m4',time:'1:30pm',name:'Grilled Chicken Pesto',cal:540,p:57,c:46,f:13},{id:'m5',time:'5:00pm',name:'Little Italy',cal:560,p:50,c:48,f:20}],
  Wednesday: [{id:'m1',time:'7:00am',name:'Core Power Elite + Isopure',cal:360,p:67,c:9,f:5},{id:'m2',time:'7:00am',name:'Fuel Meals Proats cup',cal:210,p:30,c:17,f:3},{id:'m3',time:'10:30am',name:'Egg White Scramble',cal:350,p:34,c:18,f:15},{id:'m4',time:'1:30pm',name:'BBQ Grilled Chicken',cal:560,p:57,c:63,f:8},{id:'m5',time:'5:00pm',name:'Creamy Ranch Chicken',cal:490,p:39,c:50,f:14}],
  Thursday:  [{id:'m1',time:'7:00am',name:'Core Power Elite + Isopure',cal:360,p:67,c:9,f:5},{id:'m2',time:'7:00am',name:'Fuel Meals Proats cup',cal:210,p:30,c:17,f:3},{id:'m3',time:'10:30am',name:'Egg White Scramble',cal:350,p:34,c:18,f:15},{id:'m4',time:'1:30pm',name:'Grilled Chicken Pesto',cal:540,p:57,c:46,f:13},{id:'m5',time:'5:00pm',name:'Chimichurri Steak',cal:460,p:42,c:26,f:21}],
  Friday:    [{id:'m1',time:'7:00am',name:'Core Power Elite + Isopure',cal:360,p:67,c:9,f:5},{id:'m2',time:'7:00am',name:'Fuel Meals Proats cup',cal:210,p:30,c:17,f:3},{id:'m3',time:'10:30am',name:'Egg White Scramble',cal:350,p:34,c:18,f:15},{id:'m4',time:'1:30pm',name:'Little Italy',cal:560,p:50,c:48,f:20},{id:'m5',time:'5:00pm',name:'Creamy Ranch Chicken',cal:490,p:39,c:50,f:14}],
  Saturday:  [{id:'m1',time:'7:00am',name:'Core Power Elite + Isopure',cal:360,p:67,c:9,f:5},{id:'m2',time:'7:00am',name:'Fuel Meals Proats cup',cal:210,p:30,c:17,f:3},{id:'m3',time:'Lunch',name:'Choose any Fuel Meals entree',cal:520,p:48,c:45,f:14},{id:'m4',time:'Dinner',name:'Choose any Fuel Meals entree',cal:490,p:42,c:35,f:16}],
  Sunday:    [{id:'m1',time:'7:00am',name:'Core Power Elite + Isopure',cal:360,p:67,c:9,f:5},{id:'m2',time:'7:00am',name:'Fuel Meals Proats cup',cal:210,p:30,c:17,f:3},{id:'m3',time:'Lunch',name:'Choose any Fuel Meals entree',cal:520,p:48,c:45,f:14},{id:'m4',time:'Dinner',name:'Choose any Fuel Meals entree',cal:490,p:42,c:35,f:16}],
};

const BASE_SCHEDULE = [
  {id:'sc0',time:'4:00am',name:'Wake up',type:'action',detail:"Alarm. Consistency is critical for Hashimoto's and cortisol rhythm.",always:true},
  {id:'sc1',time:'4:00am',name:'Levothyroxine 100mcg',type:'med',detail:'Water only. Empty stomach. Nothing else until 5:00am.',warn:'60 min window — no food, no other meds',always:true},
  {id:'sc2',time:'5:00am',name:'Leave home',type:'action',detail:'2-hour drive to work.',always:true},
  {id:'sc3',time:'5:00am — car',name:'Vitamin D 5,000 IU',type:'supp',detail:'Levothyroxine window now clear. Take with water.',always:true},
  {id:'sc4',time:'5:00am — car',name:'Fenugreek 400mg',type:'supp',detail:'Take with water in the car.',always:true},
  {id:'sc5',time:'5:00am — car',name:'DHEA 10mg',type:'supp',detail:"Morning matches your body's natural DHEA peak. Do not take at night.",always:true},
  {id:'sc6',time:'5:00am — car',name:'Tadalafil 5mg',type:'med',detail:'Same time every day. Food does not affect absorption.',always:true},
  {id:'sc7',time:'5:00am — car',name:'Adderall XR + IR',type:'med',detail:'Both together. IR active by 5:30am for drive. XR carries you through afternoon. M–F only.',warn:'M–F only · avoid citrus 1hr after',mf:true},
  {id:'sc8',time:'7:00am',name:'Arrive at work',type:'action',detail:'Grab Core Power Elite + mix in Isopure half scoop. Eat Proats at desk.',always:true},
  {id:'sc9',time:'7:00am',name:'Core Power Elite + Isopure',type:'meal',detail:'Mix half scoop Isopure into the Core Power bottle. 67g protein, 360 cal.',cal:360,p:67,c:9,f:5,mealId:'m1',always:true},
  {id:'sc10',time:'7:00am',name:'Fuel Meals Proats cup',type:'meal',detail:'Microwave 2 min. Eat at desk.',cal:210,p:30,c:17,f:3,mealId:'m2',always:true},
  {id:'sc11',time:'10:30am',name:'Egg White Scramble',type:'meal',detail:'Pre-workout fuel. Light enough to train on.',cal:350,p:34,c:18,f:15,mealId:'m3',always:true},
  {id:'sc12',time:'10:30am',name:'Creatine 5g',type:'supp',detail:'Mix in water alongside pre-workout meal.',always:true},
  {id:'sc13',time:'12:00pm',name:'Workout',type:'workout',detail:'Drive 3–4 min to gym. 50–55 min training + 20 min incline treadmill. M–F only.',warn:'M–F only',mf:true},
  {id:'sc14',time:'1:30pm',name:'Post-workout entree',type:'meal',detail:"Biggest carb load of the day. See Meals tab for today's specific entree.",cal:550,p:55,c:55,f:13,mealId:'m4',always:true},
  {id:'sc15',time:'5:00pm',name:'Second entree',type:'meal',detail:'Lower carb. Last substantial food before kitchen closes at 6pm.',cal:490,p:42,c:35,f:18,mealId:'m5',always:true},
  {id:'sc16',time:'6:00pm',name:'Kitchen closes',type:'action',detail:'Hard stop. 2.5hr fast before sermorelin injection at 8:30pm.',warn:'Nothing after this',always:true},
  {id:'sc17',time:'8:30pm',name:'Sermorelin 400mcg subQ',type:'med',detail:'2.5hrs since last food. 30–60 min before sleep. Empty stomach protects the GH pulse. M–F only.',warn:'M–F only · empty stomach · 2.5hrs after kitchen close',mf:true},
  {id:'sc18',time:'9:00–9:30pm',name:'Lights out',type:'action',detail:"7–7.5 hrs sleep before 4am wake. Non-negotiable for Hashimoto's and sermorelin.",warn:'Target: asleep by 9:30pm',always:true},
];

const SUPPLEMENT_LIST = [
  {id:'sup1',name:'Levothyroxine',dose:'100mcg',timing:'4:00am — empty stomach',type:'med',detail:'Water only. Wait 60 minutes before anything else.',warn:'No food, coffee, or supplements for 60 min after'},
  {id:'sup2',name:'Vitamin D',dose:'5,000 IU',timing:'5:00am — in the car',type:'supp',detail:'Fat-soluble — Core Power shake at 7am aids absorption.'},
  {id:'sup3',name:'Fenugreek',dose:'400mg',timing:'5:00am — in the car',type:'supp',detail:'Supports testosterone. Safe to stack with other morning supplements.'},
  {id:'sup4',name:'DHEA',dose:'10mg',timing:'5:00am — in the car',type:'supp',detail:'Morning only — matches natural DHEA peak 6–8am. Taking at night disrupts sleep.'},
  {id:'sup5',name:'Tadalafil',dose:'5mg',timing:'5:00am — in the car',type:'med',detail:'Daily dose. Food does not affect absorption. Same time every day.',warn:'Theoretical minor interaction with DHEA — confirmed low risk by Defy Medical'},
  {id:'sup6',name:'Adderall XR + IR',dose:'as prescribed',timing:'5:00am — in the car, M–F only',type:'med',detail:'IR active by 5:30am for drive focus. XR carries through afternoon. Both clear by 7–8pm protecting 9pm sleep.',warn:'M–F only · avoid citrus 1 hr after'},
  {id:'sup7',name:'Creatine',dose:'5g',timing:'10:30am — pre-workout',type:'supp',detail:'Mix in water with Egg White Scramble. Fenugreek taken earlier improves creatine uptake.'},
  {id:'sup8',name:'Sermorelin',dose:'400mcg subQ injection',timing:'8:30pm — M–F only',type:'med',detail:'Inject on empty stomach — 2.5hrs after last food. 30–60 min before bed.',warn:'M–F only · empty stomach required'},
];

const TYPE_COLORS = {med:'#ef4444',supp:'#3b82f6',meal:'#22c55e',action:'#94a3b8',workout:'#f59e0b'};
const TYPE_LABELS = {med:'Medication',supp:'Supplement',meal:'Meal',action:'',workout:'Workout'};
const TARGETS = { cal:2050, p:160, c:190, f:70 };

const MEASURE_SITES = [
  {id:'weight',label:'Body Weight',unit:'lbs',icon:'⚖️',guide:'Morning, after bathroom, before food'},
  {id:'waist',label:'Waist',unit:'in',icon:'📏',guide:'At navel level, exhale normally'},
  {id:'chest',label:'Chest',unit:'in',icon:'📐',guide:'At nipple line, arms relaxed'},
  {id:'shoulders',label:'Shoulders',unit:'in',icon:'📐',guide:'Widest point across both shoulders'},
  {id:'leftArm',label:'Left Arm',unit:'in',icon:'💪',guide:'Flexed, mid-bicep peak'},
  {id:'rightArm',label:'Right Arm',unit:'in',icon:'💪',guide:'Flexed, mid-bicep peak'},
  {id:'leftThigh',label:'Left Thigh',unit:'in',icon:'🦵',guide:'Mid-thigh, standing relaxed'},
  {id:'rightThigh',label:'Right Thigh',unit:'in',icon:'🦵',guide:'Mid-thigh, standing relaxed'},
];

function BodyDiagram({ activeSite }) {
  const highlights = {
    waist:{cx:100,cy:155,rx:28,ry:12},
    chest:{cx:100,cy:125,rx:32,ry:12},
    shoulders:{cx:100,cy:105,rx:42,ry:10},
    leftArm:{cx:62,cy:130,rx:10,ry:18},
    rightArm:{cx:138,cy:130,rx:10,ry:18},
    leftThigh:{cx:78,cy:210,rx:14,ry:22},
    rightThigh:{cx:122,cy:210,rx:14,ry:22},
  };
  const h = highlights[activeSite];
  return (
    <svg viewBox="0 0 200 300" style={{width:'100%',maxWidth:140,display:'block',margin:'0 auto'}}>
      <ellipse cx="100" cy="88" rx="18" ry="20" fill="#334155"/>
      <rect x="72" y="105" width="56" height="55" rx="8" fill="#334155"/>
      <rect x="56" y="108" width="18" height="45" rx="8" fill="#334155"/>
      <rect x="126" y="108" width="18" height="45" rx="8" fill="#334155"/>
      <rect x="74" y="158" width="22" height="60" rx="8" fill="#334155"/>
      <rect x="104" y="158" width="22" height="60" rx="8" fill="#334155"/>
      <rect x="74" y="215" width="22" height="30" rx="6" fill="#334155"/>
      <rect x="104" y="215" width="22" height="30" rx="6" fill="#334155"/>
      {h && <ellipse cx={h.cx} cy={h.cy} rx={h.rx} ry={h.ry} fill="#38bdf8" opacity="0.45"/>}
      {activeSite==='weight' && <text x="100" y="280" textAnchor="middle" fontSize="28" fill="#38bdf8">⚖</text>}
    </svg>
  );
}

function MacroFooter({ macros }) {
  const pct = (v,t) => Math.min(100,Math.round((v/t)*100));
  const col = (v,t) => v > t*1.1 ? '#ef4444' : v > t*0.9 ? '#22c55e' : '#f59e0b';
  const items = [
    {label:'Cal',val:macros.cal,target:TARGETS.cal},
    {label:'Protein',val:macros.p,target:TARGETS.p,suf:'g',kcal:macros.p*4},
    {label:'Carbs',val:macros.c,target:TARGETS.c,suf:'g',kcal:macros.c*4},
    {label:'Fat',val:macros.f,target:TARGETS.f,suf:'g',kcal:macros.f*9},
  ];
  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#1e293b',borderTop:'1px solid #0f172a',padding:'8px 12px',zIndex:50,maxWidth:420,margin:'0 auto'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4}}>
        {items.map(it=>(
          <div key={it.label} style={{textAlign:'center'}}>
            <div style={{fontSize:13,fontWeight:700,color:col(it.val,it.target)}}>{it.val}{it.suf||''}</div>
            <div style={{fontSize:9,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em'}}>{it.label}</div>
            <div style={{height:3,background:'#0f172a',borderRadius:2,marginTop:2,overflow:'hidden'}}>
              <div style={{height:'100%',width:pct(it.val,it.target)+'%',background:col(it.val,it.target),borderRadius:2,transition:'width 0.3s'}}/>
            </div>
            <div style={{fontSize:9,color:'#475569',marginTop:1}}>/{it.target}{it.suf||''}</div>
            {it.kcal!==undefined&&<div style={{fontSize:9,color:'#334155'}}>{it.kcal}kc</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [viewDate, setViewDate] = useState(new Date());
  const [tab, setTab] = useState('timeline');
  const [allState, setAllState] = useState({});
  const [modal, setModal] = useState(null);
  const [modalData, setModalData] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const [activeSite, setActiveSite] = useState('weight');
  const fileRef = useRef();

  const dk = dateKey(viewDate);
  const dayName = DAYS[viewDate.getDay()];
  const isMFDay = viewDate.getDay() >= 1 && viewDate.getDay() <= 5;
  const isToday = dk === dateKey(new Date());
  const weekNum = getWeekNumber(viewDate);
  const phase = getPhase(weekNum);
  const workout = getWorkoutForDay(dayName, viewDate);

  useEffect(()=>{
    try { const r=localStorage.getItem('eddie_v5'); if(r) setAllState(JSON.parse(r)); } catch(e){}
  },[]);

  const persist = (next) => { setAllState(next); try{localStorage.setItem('eddie_v5',JSON.stringify(next));}catch(e){} };
  const getDay = () => allState[dk]||{checked:{},exLogs:{},customEntries:[],customExercises:[],measurements:{},photos:[]};
  const setDay = (fn) => { const prev=getDay(); persist({...allState,[dk]:fn(prev)}); };

  const {checked={},exLogs={},customEntries=[],customExercises=[]} = getDay();

  const toggle = (id, mealId) => {
    setDay(prev=>{
      const next={...prev.checked,[id]:!prev.checked[id]};
      if(mealId){
        const meals=BASE_MEALS[dayName]||[];
        meals.forEach((m,i)=>{ if(m.id===mealId) next['meal_'+i]=next[id]; });
      }
      return {...prev,checked:next};
    });
  };
  const toggleCustom=(cid)=>setDay(prev=>({...prev,customEntries:(prev.customEntries||[]).map(e=>e._id===cid?{...e,checked:!e.checked}:e)}));
  const deleteCustom=(cid)=>setDay(prev=>({...prev,customEntries:(prev.customEntries||[]).filter(e=>e._id!==cid)}));

  const getMacros=()=>{
    let cal=0,p=0,c=0,f=0;
    const mealLogged={};
    BASE_SCHEDULE.forEach(e=>{
      if(e.cal&&checked[e.id]){cal+=e.cal;p+=e.p;c+=e.c;f+=e.f;if(e.mealId)mealLogged[e.mealId]=true;}
    });
    (BASE_MEALS[dayName]||[]).forEach((m,i)=>{
      if(checked['meal_'+i]&&!mealLogged[m.id]){cal+=m.cal;p+=m.p;c+=m.c;f+=m.f;}
    });
    (customEntries||[]).forEach(e=>{if(e.checked&&e.cal){cal+=e.cal;p+=(e.p||0);c+=(e.c||0);f+=(e.f||0);}});
    return {cal,p,c,f};
  };

  const saveExLog=()=>{
    const {exIdx,weight,notes}=modalData;
    const log=(weight?weight+' lbs':'logged')+(notes?' — '+notes:'');
    setDay(prev=>({...prev,exLogs:{...prev.exLogs,[exIdx]:log}}));
    closeModal();
  };

  const saveCustomEntry=()=>{
    if(!modalData.name)return;
    const entry={_custom:true,_id:'c_'+Date.now(),type:modalData.type||'meal',hour:modalData.hour||'Custom',name:modalData.name,dose:modalData.dose||'',detail:modalData.detail||'',cal:parseInt(modalData.cal)||0,p:parseInt(modalData.p)||0,c:parseInt(modalData.c)||0,f:parseInt(modalData.f)||0,checked:false};
    setDay(prev=>({...prev,customEntries:[...(prev.customEntries||[]),entry]}));
    closeModal();
  };

  const saveCustomEx=()=>{
    if(!modalData.exName)return;
    setDay(prev=>({...prev,customExercises:[...(prev.customExercises||[]),{name:modalData.exName,sets:modalData.exSets||''}]}));
    closeModal();
  };

  const updateCustomEx=(i)=>{
    setDay(prev=>({...prev,customExercises:(prev.customExercises||[]).map((e,idx)=>idx===i?{...e,name:modalData.exName,sets:modalData.exSets}:e)}));
    closeModal();
  };

  const saveMeasurement=()=>{
    const {site,value,photo}=modalData;
    setDay(prev=>({
      ...prev,
      measurements:{...(prev.measurements||{}),[site]:value||prev.measurements?.[site]},
      photos:photo?[...(prev.photos||[]),{site,url:photo,date:dk}]:(prev.photos||[])
    }));
    closeModal();
  };

  const estimateAI=async()=>{
    const desc=modalData.desc||'';
    if(!desc.trim())return;
    setAiLoading(true);setAiMsg('');
    try{
      const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:200,messages:[{role:'user',content:`Estimate macros for: "${desc}". Reply ONLY with valid JSON: {"cal":500,"p":40,"c":45,"f":15}. No other text.`}]})});
      const data=await res.json();
      const j=JSON.parse(data.content[0].text.trim());
      setModalData(prev=>({...prev,cal:j.cal||0,p:j.p||0,c:j.c||0,f:j.f||0}));
      setAiMsg('✓ Macros estimated. Review and add.');
    }catch(e){setAiMsg('Could not estimate. Enter manually.');}
    setAiLoading(false);
  };

  const closeModal=()=>{setModal(null);setModalData({});setAiMsg('');};
  const macros=getMacros();
  const meals=BASE_MEALS[dayName]||[];
  const filteredSchedule=BASE_SCHEDULE.filter(e=>e.always||(e.mf&&isMFDay));
  const dayData=getDay();
  const dayMeasurements=dayData.measurements||{};
  const dayPhotos=dayData.photos||[];

  const S={
    app:{background:'#0f172a',minHeight:'100vh',color:'#e2e8f0',fontFamily:"'DM Sans',system-ui,sans-serif",maxWidth:420,margin:'0 auto',paddingBottom:90},
    hdr:{padding:'12px 16px 8px',borderBottom:'1px solid #1e293b',background:'#0f172a',position:'sticky',top:0,zIndex:20},
    macroBar:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4,padding:'8px 16px',background:'#1e293b',borderBottom:'1px solid #0f172a'},
    nav:{display:'flex',borderBottom:'1px solid #1e293b',background:'#0f172a',position:'sticky',top:61,zIndex:15,overflowX:'auto'},
    navBtn:(a)=>({flex:'none',minWidth:68,padding:'8px 4px',textAlign:'center',fontSize:10,cursor:'pointer',fontWeight:a?700:400,color:a?'#38bdf8':'#64748b',borderBottom:a?'2px solid #38bdf8':'2px solid transparent',letterSpacing:'0.03em',textTransform:'uppercase',whiteSpace:'nowrap'}),
    card:{background:'#1e293b',borderRadius:12,overflow:'hidden',marginBottom:12},
    row:(done)=>({padding:'9px 12px',borderBottom:'1px solid #0f172a',display:'flex',alignItems:'flex-start',gap:10,background:done?'rgba(34,197,94,0.08)':'transparent'}),
    timeHdr:{padding:'5px 12px',background:'#0f172a',fontSize:10,fontWeight:700,color:'#38bdf8',textTransform:'uppercase',letterSpacing:'0.08em'},
    name:{fontSize:13,fontWeight:600,color:'#f1f5f9'},
    detail:{fontSize:11,color:'#94a3b8',marginTop:2,lineHeight:1.5},
    warn:{fontSize:10,color:'#fbbf24',marginTop:3},
    chk:(done)=>({width:26,height:26,borderRadius:'50%',border:done?'none':'1px solid #334155',background:done?'#22c55e':'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,marginTop:2}),
    addRow:{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',color:'#38bdf8',fontSize:13,cursor:'pointer'},
    secTitle:{fontSize:10,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8,padding:'12px 16px 0'},
    inp:{width:'100%',padding:'8px 10px',border:'1px solid #334155',borderRadius:8,fontSize:13,color:'#e2e8f0',background:'#0f172a',marginTop:4,boxSizing:'border-box'},
    btnP:{flex:1,padding:10,background:'#0ea5e9',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'},
    btnS:{flex:1,padding:10,background:'#0f172a',color:'#94a3b8',border:'1px solid #334155',borderRadius:8,fontSize:13,cursor:'pointer'},
    modal:{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.6)',zIndex:200,display:'flex',alignItems:'flex-end'},
    modalBox:{background:'#1e293b',borderRadius:'16px 16px 0 0',padding:20,width:'100%',maxHeight:'88vh',overflowY:'auto'},
    delBtn:{fontSize:10,color:'#ef4444',cursor:'pointer',padding:'1px 5px',border:'1px solid rgba(239,68,68,0.3)',borderRadius:5},
    editBtn:{fontSize:10,color:'#38bdf8',cursor:'pointer',padding:'1px 5px',border:'1px solid rgba(56,189,248,0.3)',borderRadius:5},
  };

  const groupByTime=(items)=>{
    const g={};const o=[];
    items.forEach(e=>{if(!g[e.time]){g[e.time]=[];o.push(e.time);}g[e.time].push(e);});
    (customEntries||[]).forEach(e=>{const t=e.hour||'Custom';if(!g[t]){g[t]=[];o.push(t);}g[t].push({...e,_isCustom:true});});
    return {g,o};
  };

  const {g:tlG,o:tlO}=groupByTime(filteredSchedule);

  const Chk=({done,onTap})=>(
    <div onClick={onTap} style={S.chk(done)}>
      <span style={{fontSize:12,color:done?'#fff':'#64748b'}}>{done?'✓':'+'}</span>
    </div>
  );

  const TypeBadge=({type,dose})=>{
    const colors={med:'#ef4444',supp:'#3b82f6',meal:'#22c55e',action:'#94a3b8',workout:'#f59e0b'};
    const labels={med:'Medication',supp:'Supplement',meal:'Meal',action:'',workout:'Workout'};
    if(!labels[type])return null;
    return <div style={{fontSize:9,fontWeight:700,color:colors[type],textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2}}>{labels[type]}{dose?' · '+dose:''}</div>;
  };

  const navJump=(type)=>{
    if(type==='meal')setTab('meals');
    else if(type==='workout')setTab('workout');
    else if(type==='supp'||type==='med')setTab('supps');
  };

  const tabLabels={timeline:'Timeline',meals:'Meals',workout:'Workout',supps:'Meds/Supps',measure:'Measure',plan:'Plan'};

  return (
    <div style={S.app}>
      <div style={S.hdr}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={()=>setViewDate(d=>addDays(d,-1))} style={{background:'#1e293b',border:'none',color:'#94a3b8',borderRadius:8,width:28,height:28,cursor:'pointer',fontSize:16}}>‹</button>
            <div>
              <div style={{fontSize:11,color:'#64748b'}}>{fmtDate(viewDate)}{isToday?' · Today':''}</div>
              <div style={{fontSize:20,fontWeight:700,color:'#f1f5f9',letterSpacing:'-0.02em'}}>{dayName}</div>
            </div>
            <button onClick={()=>setViewDate(d=>addDays(d,1))} style={{background:'#1e293b',border:'none',color:'#94a3b8',borderRadius:8,width:28,height:28,cursor:'pointer',fontSize:16}}>›</button>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:10,color:'#64748b'}}>Week {weekNum} · Phase {phase}</div>
            <div style={{fontSize:10,fontWeight:600,color:workout?.name!=='Active Recovery'?'#f59e0b':'#64748b',marginTop:1}}>{workout?.name||'Rest'}</div>
          </div>
        </div>
      </div>

      <div style={S.macroBar}>
        {[['Cal',macros.cal,TARGETS.cal,''],['Prot',macros.p,TARGETS.p,'g'],['Carbs',macros.c,TARGETS.c,'g'],['Fat',macros.f,TARGETS.f,'g']].map(([l,v,t,s])=>(
          <div key={l} style={{textAlign:'center'}}>
            <div style={{fontSize:14,fontWeight:700,color:'#f1f5f9'}}>{v}{s}</div>
            <div style={{fontSize:9,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em'}}>{l}</div>
            <div style={{fontSize:9,color:'#475569'}}>/{t}{s}</div>
          </div>
        ))}
      </div>

      <div style={S.nav}>
        {Object.keys(tabLabels).map(t=>(
          <div key={t} onClick={()=>setTab(t)} style={S.navBtn(tab===t)}>{tabLabels[t]}</div>
        ))}
      </div>

      {tab==='timeline'&&(
        <div style={{padding:'0 16px'}}>
          <div style={S.secTitle}>Full daily schedule</div>
          <div style={S.card}>
            {tlO.map((time,ti)=>(
              <div key={time} style={{borderBottom:ti<tlO.length-1?'1px solid #0f172a':'none'}}>
                <div style={S.timeHdr}>{time}</div>
                {tlG[time].map((e,ei)=>{
                  const isC=e._isCustom;
                  const done=isC?e.checked:!!checked[e.id];
                  return (
                    <div key={e.id||e._id||ei} style={S.row(done)}>
                      <div style={{flex:1}}>
                        <TypeBadge type={e.type} dose={e.dose}/>
                        <div style={S.name}>{e.name}</div>
                        {e.detail&&<div style={S.detail}>{e.detail}</div>}
                        {e.warn&&<div style={S.warn}>⚠ {e.warn}</div>}
                        {(e.type==='meal'||e.type==='workout'||e.type==='supp'||e.type==='med')&&(
                          <div onClick={ev=>{ev.stopPropagation();navJump(e.type);}} style={{fontSize:10,color:TYPE_COLORS[e.type],marginTop:3,cursor:'pointer'}}>
                            → view in {TYPE_LABELS[e.type]||'section'}
                          </div>
                        )}
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'center'}}>
                        <Chk done={done} onTap={()=>isC?toggleCustom(e._id):toggle(e.id,e.mealId)}/>
                        {isC&&<div onClick={()=>deleteCustom(e._id)} style={S.delBtn}>del</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div onClick={()=>{setModal('addEntry');setModalData({type:'meal'});}} style={S.addRow}>
              <span style={{fontSize:16}}>+</span> Add custom entry
            </div>
          </div>
        </div>
      )}

      {tab==='meals'&&(
        <div style={{padding:'0 16px'}}>
          <div style={S.secTitle}>Meals — {dayName}</div>
          <div style={S.card}>
            {meals.map((m,i)=>{
              const mid='meal_'+i;const done=!!checked[mid];
              return (
                <div key={i} onClick={()=>toggle(mid)} style={{...S.row(done),cursor:'pointer'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:700,color:'#22c55e',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2}}>{m.time}</div>
                    <div style={S.name}>{m.name}</div>
                    <div style={S.detail}>{m.cal} cal · {m.p}g P · {m.c}g C · {m.f}g F</div>
                  </div>
                  <Chk done={done} onTap={()=>toggle(mid)}/>
                </div>
              );
            })}
            {(customEntries||[]).filter(e=>e.type==='meal').map(e=>{
              const done=e.checked;
              return (
                <div key={e._id} style={S.row(done)}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:700,color:'#38bdf8',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2}}>Custom · {e.hour}</div>
                    <div style={S.name}>{e.name}</div>
                    {e.cal>0&&<div style={S.detail}>{e.cal} cal · {e.p}g P · {e.c}g C · {e.f}g F</div>}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'center'}}>
                    <Chk done={done} onTap={()=>toggleCustom(e._id)}/>
                    <div onClick={()=>deleteCustom(e._id)} style={S.delBtn}>del</div>
                  </div>
                </div>
              );
            })}
            <div onClick={()=>{setModal('addEntry');setModalData({type:'meal'});}} style={S.addRow}>
              <span style={{fontSize:16}}>+</span> Add custom meal
            </div>
          </div>
        </div>
      )}

      {tab==='workout'&&(
        <div style={{padding:'0 16px'}}>
          <div style={S.secTitle}>Workout — {dayName} · 12:00pm</div>
          {!workout?(
            <div style={{...S.card,padding:'24px 16px',textAlign:'center',color:'#64748b',fontSize:13,lineHeight:1.7}}>
              🌙 Rest day<br/><span style={{fontSize:11}}>Sleep 9pm · Wake 4am · Recovery is the work</span>
            </div>
          ):(
            <div style={S.card}>
              <div style={{padding:'10px 12px',borderBottom:'1px solid #0f172a'}}>
                <div style={S.name}>{workout.name}</div>
                <div style={S.detail}>{workout.sub}</div>
                <div style={{fontSize:10,color:'#f59e0b',marginTop:3,fontWeight:600}}>{workout.phase}</div>
              </div>
              {workout.ex.map((ex,i)=>{
                const logged=exLogs?.[ex.id||i];
                return (
                  <div key={ex.id||i} style={{...S.row(!!logged),cursor:'pointer'}} onClick={()=>{setModal('logEx');setModalData({exIdx:ex.id||i,exName:ex.n,exSets:ex.s,exTip:ex.tip,weight:logged&&logged.includes('lb')?logged.split('lb')[0].trim():'',notes:''});}}>
                    <div style={{flex:1}}>
                      <div style={S.name}>{ex.n}</div>
                      <div style={S.detail}>{ex.s}</div>
                      {ex.tip&&<div style={{fontSize:10,color:'#475569',marginTop:2}}>💡 {ex.tip}</div>}
                      {logged&&<div style={{fontSize:10,color:'#22c55e',marginTop:2}}>✓ {logged}</div>}
                    </div>
                    <span style={{fontSize:14,color:'#475569',marginTop:2}}>›</span>
                  </div>
                );
              })}
              {(customExercises||[]).map((ex,i)=>(
                <div key={'cx'+i} style={S.row(false)}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:9,fontWeight:700,color:'#f59e0b',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2}}>Custom</div>
                    <div style={S.name}>{ex.name}</div>
                    <div style={S.detail}>{ex.sets}</div>
                  </div>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <div onClick={()=>{setModal('editEx');setModalData({customIdx:i,exName:ex.name,exSets:ex.sets});}} style={S.editBtn}>edit</div>
                    <div onClick={()=>setDay(prev=>({...prev,customExercises:(prev.customExercises||[]).filter((_,idx)=>idx!==i)}))} style={S.delBtn}>del</div>
                  </div>
                </div>
              ))}
              <div onClick={()=>{setModal('addEx');setModalData({});}} style={S.addRow}>
                <span style={{fontSize:16}}>+</span> Add custom exercise
              </div>
            </div>
          )}
        </div>
      )}

      {tab==='supps'&&(
        <div style={{padding:'0 16px'}}>
          <div style={S.secTitle}>Medications & Supplements</div>
          <div style={S.card}>
            {SUPPLEMENT_LIST.map(s=>{
              const done=!!checked['sup_'+s.id];
              const color=TYPE_COLORS[s.type]||'#94a3b8';
              return (
                <div key={s.id} style={S.row(done)}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:9,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2}}>{s.type==='med'?'Medication':'Supplement'} · {s.dose}</div>
                    <div style={S.name}>{s.name}</div>
                    <div style={{fontSize:10,color:'#38bdf8',marginTop:2,fontWeight:600}}>⏰ {s.timing}</div>
                    <div style={S.detail}>{s.detail}</div>
                    {s.warn&&<div style={S.warn}>⚠ {s.warn}</div>}
                  </div>
                  <Chk done={done} onTap={()=>toggle('sup_'+s.id)}/>
                </div>
              );
            })}
            {(customEntries||[]).filter(e=>e.type==='supp'||e.type==='med').map(e=>(
              <div key={e._id} style={S.row(e.checked)}>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,fontWeight:700,color:TYPE_COLORS[e.type],textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2}}>{TYPE_LABELS[e.type]}</div>
                  <div style={S.name}>{e.name}{e.dose?' · '+e.dose:''}</div>
                  {e.hour&&<div style={{fontSize:10,color:'#38bdf8',marginTop:2}}>⏰ {e.hour}</div>}
                  {e.detail&&<div style={S.detail}>{e.detail}</div>}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'center'}}>
                  <Chk done={e.checked} onTap={()=>toggleCustom(e._id)}/>
                  <div onClick={()=>deleteCustom(e._id)} style={S.delBtn}>del</div>
                </div>
              </div>
            ))}
            <div onClick={()=>{setModal('addEntry');setModalData({type:'supp'});}} style={S.addRow}>
              <span style={{fontSize:16}}>+</span> Add custom supplement or med
            </div>
          </div>
        </div>
      )}

      {tab==='measure'&&(
        <div style={{padding:'0 16px'}}>
          <div style={S.secTitle}>Weekly measurements — {fmtDate(viewDate)}</div>
          <div style={{...S.card,padding:12,marginBottom:12}}>
            <BodyDiagram activeSite={activeSite}/>
            <div style={{textAlign:'center',marginTop:8}}>
              <div style={{fontSize:11,color:'#38bdf8',fontWeight:600}}>{MEASURE_SITES.find(s=>s.id===activeSite)?.label}</div>
              <div style={{fontSize:10,color:'#64748b',marginTop:2}}>{MEASURE_SITES.find(s=>s.id===activeSite)?.guide}</div>
            </div>
          </div>
          <div style={S.card}>
            {MEASURE_SITES.map(site=>{
              const val=dayMeasurements[site.id];
              return (
                <div key={site.id} onClick={()=>{setActiveSite(site.id);setModal('measure');setModalData({site:site.id,value:val||'',siteLabel:site.label,unit:site.unit});}} style={{...S.row(!!val),cursor:'pointer'}}>
                  <div style={{fontSize:20,width:32,textAlign:'center',flexShrink:0}}>{site.icon}</div>
                  <div style={{flex:1}}>
                    <div style={S.name}>{site.label}</div>
                    <div style={S.detail}>{site.guide}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    {val?<div style={{fontSize:15,fontWeight:700,color:'#22c55e'}}>{val}<span style={{fontSize:10,color:'#64748b'}}> {site.unit}</span></div>
                    :<div style={{fontSize:11,color:'#475569'}}>tap to log</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={S.secTitle}>Progress photos</div>
          <div style={{...S.card,padding:12}}>
            {dayPhotos.length===0&&<div style={{fontSize:12,color:'#475569',textAlign:'center',padding:'8px 0'}}>No photos for this date</div>}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
              {dayPhotos.map((ph,i)=>(
                <div key={i} style={{borderRadius:8,overflow:'hidden',aspectRatio:'1',background:'#0f172a'}}>
                  <img src={ph.url} alt={ph.site} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </div>
              ))}
            </div>
            <div onClick={()=>{setModal('addPhoto');setModalData({});}} style={{...S.addRow,justifyContent:'center',marginTop:8}}>
              <span style={{fontSize:16}}>+</span> Add progress photo
            </div>
          </div>
        </div>
      )}

      {tab==='plan'&&(
        <div style={{padding:'0 16px'}}>
          {[
            {title:'Weekly workout split',rows:[['Monday','Push — Chest · Shoulders · Triceps'],['Tuesday','Pull — Back · Biceps'],['Wednesday','Legs — Quads · Hamstrings · Calves · Core'],['Thursday','Push repeat — go heavier'],['Friday','Pull repeat — go heavier'],['Saturday','Active Recovery — Mobility + Walk'],['Sunday','Active Recovery — Mobility + Walk']]},
            {title:'Workout phases',rows:[['Weeks 1–4','Machine foundation'],['Weeks 5–8','Cables added — more range'],['Weeks 9–12','Compound focus — heavier']]},
            {title:'Macro targets',rows:[['Calories','2,000–2,100 kcal'],['Protein','150–160g · 640 kcal'],['Carbs','185–200g · 760 kcal'],['Fat','65–70g · 630 kcal'],['Hard floor','Never below 1,800 kcal']]},
            {title:'Sleep protocol',rows:[['Wake','4:00am'],['Leave home','5:00am'],['Arrive work','7:00am'],['Kitchen closes','6:00pm'],['Sermorelin','8:30pm'],['Lights out','9:00–9:30pm'],['Sleep','~7 hours']]},
          ].map(sec=>(
            <div key={sec.title} style={{marginBottom:16}}>
              <div style={S.secTitle}>{sec.title}</div>
              <div style={S.card}>
                {sec.rows.map(([k,v],i)=>(
                  <div key={i} style={{padding:'8px 12px',borderBottom:i<sec.rows.length-1?'1px solid #0f172a':'none',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:12,color:'#94a3b8'}}>{k}</span>
                    <span style={{fontSize:12,fontWeight:600,color:'#f1f5f9',textAlign:'right',flex:1,marginLeft:12}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <MacroFooter macros={macros}/>

      {modal&&(
        <div style={S.modal} onClick={e=>{if(e.target===e.currentTarget)closeModal();}}>
          <div style={S.modalBox}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{fontSize:15,fontWeight:700,color:'#f1f5f9'}}>
                {modal==='addEntry'?'Add custom entry':modal==='logEx'?modalData.exName:modal==='addEx'||modal==='editEx'?'Exercise':modal==='measure'?'Log '+modalData.siteLabel:'Add photo'}
              </div>
              <div onClick={closeModal} style={{cursor:'pointer',fontSize:13,color:'#64748b'}}>Close</div>
            </div>

            {modal==='addEntry'&&(
              <div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:12,color:'#94a3b8'}}>Type</div>
                  <select value={modalData.type||'meal'} onChange={e=>setModalData(p=>({...p,type:e.target.value}))} style={S.inp}>
                    <option value="meal">Meal</option><option value="supp">Supplement</option>
                    <option value="med">Medication</option><option value="workout">Workout</option><option value="action">Note</option>
                  </select>
                </div>
                {[['Time','hour','6:00am'],['Name','name','e.g. Magnesium'],['Dose','dose','e.g. 200mg']].map(([lbl,key,ph])=>(
                  <div key={key} style={{marginBottom:10}}>
                    <div style={{fontSize:12,color:'#94a3b8'}}>{lbl}</div>
                    <input value={modalData[key]||''} onChange={e=>setModalData(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={S.inp}/>
                  </div>
                ))}
                <div style={{marginBottom:6}}>
                  <div style={{fontSize:12,color:'#94a3b8',marginBottom:6}}>Macros (optional)</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                    {['cal','p','c','f'].map((k,i)=>(
                      <div key={k}>
                        <div style={{fontSize:10,color:'#64748b',marginBottom:3}}>{['Cal','Prot','Carb','Fat'][i]}</div>
                        <input type="number" value={modalData[k]||''} onChange={e=>setModalData(p=>({...p,[k]:e.target.value}))} placeholder="0" style={S.inp}/>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:6}}>
                  <div style={{fontSize:12,color:'#94a3b8',marginBottom:4}}>Describe meal for AI estimate</div>
                  <textarea value={modalData.desc||''} onChange={e=>setModalData(p=>({...p,desc:e.target.value}))} placeholder="e.g. grilled salmon with sweet potato" style={{...S.inp,height:50,resize:'none'}}/>
                </div>
                {aiMsg&&<div style={{fontSize:11,color:aiMsg.startsWith('✓')?'#22c55e':'#fbbf24',marginBottom:8}}>{aiMsg}</div>}
                <button onClick={estimateAI} disabled={aiLoading} style={{width:'100%',padding:8,background:'#0f172a',color:'#38bdf8',border:'1px solid #334155',borderRadius:8,fontSize:13,cursor:'pointer',marginBottom:10}}>
                  {aiLoading?'Estimating...':'Estimate macros with AI'}
                </button>
                <div style={{display:'flex',gap:8}}><button onClick={closeModal} style={S.btnS}>Cancel</button><button onClick={saveCustomEntry} style={S.btnP}>Add ↗</button></div>
              </div>
            )}

            {modal==='logEx'&&(
              <div>
                <div style={{fontSize:12,color:'#94a3b8',marginBottom:4}}>{modalData.exSets}</div>
                {modalData.exTip&&<div style={{fontSize:11,color:'#475569',marginBottom:12}}>💡 {modalData.exTip}</div>}
                {[['Weight used (lbs)','weight','number','e.g. 60'],['Notes','notes','text','e.g. felt strong']].map(([lbl,key,type,ph])=>(
                  <div key={key} style={{marginBottom:10}}>
                    <div style={{fontSize:12,color:'#94a3b8'}}>{lbl}</div>
                    <input type={type} value={modalData[key]||''} onChange={e=>setModalData(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={S.inp}/>
                  </div>
                ))}
                <div style={{display:'flex',gap:8,marginTop:4}}><button onClick={closeModal} style={S.btnS}>Cancel</button><button onClick={saveExLog} style={S.btnP}>Save ↗</button></div>
              </div>
            )}

            {(modal==='addEx'||modal==='editEx')&&(
              <div>
                {[['Exercise name','exName','text','e.g. Cable crunch'],['Sets × reps','exSets','text','e.g. 3×15']].map(([lbl,key,type,ph])=>(
                  <div key={key} style={{marginBottom:10}}>
                    <div style={{fontSize:12,color:'#94a3b8'}}>{lbl}</div>
                    <input type={type} value={modalData[key]||''} onChange={e=>setModalData(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={S.inp}/>
                  </div>
                ))}
                <div style={{display:'flex',gap:8,marginTop:4}}><button onClick={closeModal} style={S.btnS}>Cancel</button><button onClick={modal==='editEx'?()=>updateCustomEx(modalData.customIdx):saveCustomEx} style={S.btnP}>{modal==='editEx'?'Save changes':'Add ↗'}</button></div>
              </div>
            )}

            {modal==='measure'&&(
              <div>
                <div style={{marginBottom:12}}>
                  <BodyDiagram activeSite={modalData.site}/>
                  <div style={{textAlign:'center',marginTop:8,fontSize:11,color:'#64748b'}}>{MEASURE_SITES.find(s=>s.id===modalData.site)?.guide}</div>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,color:'#94a3b8'}}>{modalData.siteLabel} ({modalData.unit})</div>
                  <input type="number" step="0.1" value={modalData.value||''} onChange={e=>setModalData(p=>({...p,value:e.target.value}))} placeholder={modalData.unit==='lbs'?'e.g. 165':'e.g. 14.5'} style={S.inp}/>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,color:'#94a3b8',marginBottom:6}}>Add photo (optional)</div>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setModalData(p=>({...p,photo:ev.target.result}));r.readAsDataURL(f);}}/>
                  {modalData.photo?<img src={modalData.photo} alt="preview" style={{width:'100%',borderRadius:8,objectFit:'cover',maxHeight:160}}/> :<button onClick={()=>fileRef.current?.click()} style={{width:'100%',padding:10,background:'#0f172a',color:'#38bdf8',border:'1px solid #334155',borderRadius:8,fontSize:13,cursor:'pointer'}}>📷 Choose photo</button>}
                </div>
                <div style={{display:'flex',gap:8}}><button onClick={closeModal} style={S.btnS}>Cancel</button><button onClick={saveMeasurement} style={S.btnP}>Save ↗</button></div>
              </div>
            )}

            {modal==='addPhoto'&&(
              <div>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setModalData(p=>({...p,photo:ev.target.result}));r.readAsDataURL(f);}}/>
                {modalData.photo?<img src={modalData.photo} alt="preview" style={{width:'100%',borderRadius:8,objectFit:'cover',maxHeight:200,marginBottom:12}}/>:<button onClick={()=>fileRef.current?.click()} style={{width:'100%',padding:16,background:'#0f172a',color:'#38bdf8',border:'1px dashed #334155',borderRadius:8,fontSize:13,cursor:'pointer',marginBottom:12}}>📷 Choose photo from library</button>}
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,color:'#94a3b8'}}>Label (optional)</div>
                  <input value={modalData.site||''} onChange={e=>setModalData(p=>({...p,site:e.target.value}))} placeholder="e.g. Front, Side, Back" style={S.inp}/>
                </div>
                <div style={{display:'flex',gap:8}}><button onClick={closeModal} style={S.btnS}>Cancel</button><button onClick={()=>{if(!modalData.photo){closeModal();return;}setDay(prev=>({...prev,photos:[...(prev.photos||[]),{site:modalData.site||'Progress',url:modalData.photo,date:dk}]}));closeModal();}} style={S.btnP}>Save ↗</button></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
