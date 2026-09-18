import React, { useMemo, useState, useRef } from "react";

const E_MPa=210000, G_MPa=81000;
const gM0=1.0, gM1=1.0, gQ=1.5, gG=1.35, rhoSteel=7850;
const STEEL={S235:235,S275:275,S355:355,S420:420};
const HC={
  HC1:{beta2:0.17,phi2min:1.05,desc:"lekkie"},HC2:{beta2:0.34,phi2min:1.10,desc:"normalne"},
  HC3:{beta2:0.51,phi2min:1.15,desc:"ciężkie"},HC4:{beta2:0.68,phi2min:1.20,desc:"intensywne"},
};
const PROFILES={
  HEA:{
    "HEA 200":{h:190,b:200,tw:6.5, tf:10.0,A: 53.83,Iy:  3692,Iz: 1336,It: 21.1,Iw:  108000,Wy:  389,Wz: 134},
    "HEA 220":{h:210,b:220,tw:7.0, tf:11.0,A: 64.34,Iy:  5410,Iz: 1955,It: 28.5,Iw:  194000,Wy:  515,Wz: 178},
    "HEA 240":{h:230,b:240,tw:7.5, tf:12.0,A: 76.84,Iy:  7763,Iz: 2769,It: 41.6,Iw:  329000,Wy:  675,Wz: 231},
    "HEA 260":{h:250,b:260,tw:7.5, tf:12.5,A: 86.82,Iy: 10450,Iz: 3668,It: 52.4,Iw:  517000,Wy:  836,Wz: 282},
    "HEA 280":{h:270,b:280,tw:8.0, tf:13.0,A: 97.26,Iy: 13670,Iz: 4763,It: 66.7,Iw:  786000,Wy: 1013,Wz: 340},
    "HEA 300":{h:290,b:300,tw:8.5, tf:14.0,A:112.50,Iy: 18260,Iz: 6310,It: 85.2,Iw: 1200000,Wy: 1260,Wz: 421},
    "HEA 320":{h:310,b:300,tw:9.0, tf:15.5,A:124.40,Iy: 22930,Iz: 6985,It:108.0,Iw: 1510000,Wy: 1479,Wz: 466},
    "HEA 340":{h:330,b:300,tw:9.5, tf:16.5,A:133.50,Iy: 27690,Iz: 7440,It:143.0,Iw: 1830000,Wy: 1680,Wz: 496},
    "HEA 360":{h:350,b:300,tw:10.0,tf:17.5,A:142.80,Iy: 33090,Iz: 7890,It:169.0,Iw: 2180000,Wy: 1890,Wz: 526},
    "HEA 400":{h:390,b:300,tw:11.0,tf:19.0,A:158.90,Iy: 45070,Iz: 8560,It:229.0,Iw: 2940000,Wy: 2311,Wz: 571},
    "HEA 450":{h:440,b:300,tw:11.5,tf:21.0,A:178.00,Iy: 63720,Iz: 9465,It:318.0,Iw: 4150000,Wy: 2896,Wz: 631},
    "HEA 500":{h:490,b:300,tw:12.0,tf:23.0,A:197.50,Iy: 86970,Iz:10370,It:435.0,Iw: 5650000,Wy: 3550,Wz: 691},
    "HEA 550":{h:540,b:300,tw:12.5,tf:24.0,A:211.80,Iy:111900,Iz:10820,It:535.0,Iw: 7200000,Wy: 4146,Wz: 721},
    "HEA 600":{h:590,b:300,tw:13.0,tf:25.0,A:226.50,Iy:141200,Iz:11270,It:657.0,Iw: 8990000,Wy: 4787,Wz: 751},
  },
  HEB:{
    "HEB 200":{h:200,b:200,tw:9.0, tf:15.0,A: 78.08,Iy:  5696,Iz: 2003,It: 59.3,Iw:  171000,Wy:  570,Wz: 200},
    "HEB 220":{h:220,b:220,tw:9.5, tf:16.0,A: 91.04,Iy:  8091,Iz: 2843,It: 76.6,Iw:  296000,Wy:  736,Wz: 259},
    "HEB 240":{h:240,b:240,tw:10.0,tf:17.0,A:106.00,Iy: 11260,Iz: 3923,It:103.0,Iw:  488000,Wy:  938,Wz: 327},
    "HEB 260":{h:260,b:260,tw:10.0,tf:17.5,A:118.40,Iy: 14920,Iz: 5135,It:124.0,Iw:  755000,Wy: 1148,Wz: 395},
    "HEB 280":{h:280,b:280,tw:10.5,tf:18.0,A:131.40,Iy: 19270,Iz: 6595,It:143.0,Iw: 1130000,Wy: 1376,Wz: 471},
    "HEB 300":{h:300,b:300,tw:11.0,tf:19.0,A:149.10,Iy: 25170,Iz: 8560,It:185.0,Iw: 1690000,Wy: 1678,Wz: 571},
    "HEB 320":{h:320,b:300,tw:11.5,tf:20.5,A:161.30,Iy: 30820,Iz: 9239,It:225.0,Iw: 2070000,Wy: 1926,Wz: 616},
    "HEB 340":{h:340,b:300,tw:12.0,tf:21.5,A:170.90,Iy: 36660,Iz: 9690,It:265.0,Iw: 2460000,Wy: 2156,Wz: 646},
    "HEB 360":{h:360,b:300,tw:12.5,tf:22.5,A:180.60,Iy: 43190,Iz:10140,It:302.0,Iw: 2890000,Wy: 2400,Wz: 676},
    "HEB 400":{h:400,b:300,tw:13.5,tf:24.0,A:197.80,Iy: 57680,Iz:10820,It:388.0,Iw: 3820000,Wy: 2884,Wz: 721},
    "HEB 450":{h:450,b:300,tw:14.0,tf:26.0,A:218.00,Iy: 79890,Iz:11720,It:539.0,Iw: 5270000,Wy: 3551,Wz: 781},
    "HEB 500":{h:500,b:300,tw:14.5,tf:28.0,A:238.60,Iy:107200,Iz:12620,It:738.0,Iw: 7030000,Wy: 4287,Wz: 841},
    "HEB 550":{h:550,b:300,tw:15.0,tf:29.0,A:254.10,Iy:136700,Iz:13080,It:903.0,Iw: 8880000,Wy: 4971,Wz: 872},
    "HEB 600":{h:600,b:300,tw:15.5,tf:30.0,A:270.00,Iy:171000,Iz:13530,It:1080, Iw:10990000,Wy: 5701,Wz: 902},
  },
  IPE:{
    "IPE 200":{h:200,b:100,tw:5.6, tf: 8.5,A: 28.48,Iy:  1943,Iz:  142,It:  6.98,Iw:  13000,Wy:  194,Wz:  28.5},
    "IPE 220":{h:220,b:110,tw:5.9, tf: 9.2,A: 33.37,Iy:  2772,Iz:  205,It:  9.07,Iw:  22800,Wy:  252,Wz:  37.3},
    "IPE 240":{h:240,b:120,tw:6.2, tf: 9.8,A: 39.12,Iy:  3892,Iz:  284,It: 12.9, Iw:  37600,Wy:  324,Wz:  47.3},
    "IPE 270":{h:270,b:135,tw:6.6, tf:10.2,A: 45.95,Iy:  5790,Iz:  420,It: 15.9, Iw:  70900,Wy:  429,Wz:  62.2},
    "IPE 300":{h:300,b:150,tw:7.1, tf:10.7,A: 53.81,Iy:  8356,Iz:  604,It: 20.1, Iw: 126000,Wy:  557,Wz:  80.5},
    "IPE 330":{h:330,b:160,tw:7.5, tf:11.5,A: 62.61,Iy: 11770,Iz:  788,It: 28.2, Iw: 200000,Wy:  713,Wz:  98.5},
    "IPE 360":{h:360,b:170,tw:8.0, tf:12.7,A: 72.73,Iy: 16270,Iz: 1043,It: 37.3, Iw: 314000,Wy:  904,Wz: 123},
    "IPE 400":{h:400,b:180,tw:8.6, tf:13.5,A: 84.46,Iy: 23130,Iz: 1318,It: 51.1, Iw: 492000,Wy: 1156,Wz: 146},
    "IPE 450":{h:450,b:190,tw:9.4, tf:14.6,A: 98.82,Iy: 33740,Iz: 1676,It: 66.9, Iw: 794000,Wy: 1500,Wz: 176},
    "IPE 500":{h:500,b:200,tw:10.2,tf:16.0,A:116.00,Iy: 48200,Iz: 2142,It: 89.3, Iw:1254000,Wy: 1928,Wz: 214},
    "IPE 550":{h:550,b:210,tw:11.1,tf:17.2,A:134.40,Iy: 67120,Iz: 2668,It:123.0, Iw:1891000,Wy: 2441,Wz: 254},
    "IPE 600":{h:600,b:220,tw:12.0,tf:19.0,A:156.00,Iy: 92080,Iz: 3387,It:165.0, Iw:2861000,Wy: 3069,Wz: 308},
  },
  IPN:{
    "IPN 200":{h:200,b: 75,tw: 8.5,tf:11.3,A: 33.40,Iy:  2140,Iz:  114,It:  9.6,Iw:  10200,Wy:  214,Wz:  16.8},
    "IPN 220":{h:220,b: 82,tw: 9.2,tf:12.2,A: 40.30,Iy:  3060,Iz:  162,It: 13.2,Iw:  16400,Wy:  278,Wz:  21.5},
    "IPN 240":{h:240,b: 88,tw: 9.9,tf:13.1,A: 47.30,Iy:  4250,Iz:  221,It: 16.7,Iw:  25200,Wy:  354,Wz:  27.3},
    "IPN 260":{h:260,b: 93,tw:10.5,tf:14.0,A: 53.40,Iy:  5740,Iz:  288,It: 21.2,Iw:  36400,Wy:  442,Wz:  33.0},
    "IPN 280":{h:280,b:100,tw:11.1,tf:15.0,A: 61.00,Iy:  7590,Iz:  399,It: 27.0,Iw:  56800,Wy:  542,Wz:  41.8},
    "IPN 300":{h:300,b:107,tw:11.8,tf:16.2,A: 69.00,Iy:  9800,Iz:  451,It: 37.4,Iw:  73100,Wy:  653,Wz:  49.9},
    "IPN 320":{h:320,b:114,tw:12.4,tf:17.3,A: 77.70,Iy: 12510,Iz:  572,It: 46.0,Iw: 103000,Wy:  782,Wz:  59.5},
    "IPN 340":{h:340,b:121,tw:13.0,tf:18.3,A: 87.00,Iy: 15700,Iz:  718,It: 58.3,Iw: 143000,Wy:  923,Wz:  71.1},
    "IPN 360":{h:360,b:128,tw:13.5,tf:19.3,A: 97.00,Iy: 19610,Iz:  893,It: 74.5,Iw: 192000,Wy: 1090,Wz:  86.6},
    "IPN 380":{h:380,b:134,tw:14.1,tf:20.0,A:107.20,Iy: 24010,Iz: 1060,It: 89.4,Iw: 250000,Wy: 1264,Wz: 101},
    "IPN 400":{h:400,b:155,tw:13.0,tf:18.0,A: 91.50,Iy: 20350,Iz:  507,It: 55.0,Iw: 108000,Wy: 1018,Wz:  65.4},
    "IPN 450":{h:450,b:170,tw:14.2,tf:19.6,A:111.00,Iy: 29940,Iz:  763,It: 78.5,Iw: 181000,Wy: 1330,Wz:  89.8},
    "IPN 500":{h:500,b:185,tw:15.5,tf:21.2,A:131.00,Iy: 42740,Iz: 1090,It:108.0,Iw: 290000,Wy: 1710,Wz: 118},
    "IPN 550":{h:550,b:200,tw:16.8,tf:22.8,A:154.40,Iy: 59440,Iz: 1510,It:146.0,Iw: 440000,Wy: 2161,Wz: 151},
    "IPN 600":{h:600,b:215,tw:18.0,tf:24.5,A:179.00,Iy: 80380,Iz: 2020,It:194.0,Iw: 630000,Wy: 2679,Wz: 188},
  },
};
const C1_CASES=[
  {label:"Dwa koła suwnicy — trapezowy (typowy)",C1:1.06,C2:0.41},{label:"Siła skupiona w środku",C1:1.13,C2:0.46},
  {label:"Obciążenie równomierne — paraboliczny",C1:1.13,C2:1.12},{label:"Równomierny moment (ψ=1,0)",C1:1.00,C2:0.00},
  {label:"Liniowy ψ=0,75",C1:1.14,C2:0.00},{label:"Liniowy ψ=0,50",C1:1.31,C2:0.00},{label:"Liniowy ψ=0,25",C1:1.52,C2:0.00},
  {label:"Liniowy ψ=0,0 — trójkątny",C1:1.77,C2:0.00},{label:"Antysymetryczny ψ=−1,0",C1:2.56,C2:0.00},
];
// Typowe szyny podsuwnicowe: k = szerokość główki [mm], h = wysokość szyny [mm]
const RAILS={
  "Kęs 50×50":{k:50,h:50},"Kęs 60×60":{k:60,h:60},"Kęs 80×80":{k:80,h:80},
  "SD 65":{k:65,h:65},"SD 75":{k:75,h:75},"SD 85":{k:85,h:85},"SD 100":{k:100,h:95},
  "A 55":{k:55,h:65},"A 65":{k:65,h:75},"A 75":{k:75,h:85},
  "Własna":{k:null,h:null},
};

// ── Geometria ────────────────────────────────────────────────────────────────
function computeSection(mode,profile,cust){
  if(mode==="rolled"&&profile){
    const p=profile,hw=p.h-2*p.tf;
    const A_mm2=p.A*100,Iy_mm4=p.Iy*1e4,Iz_mm4=p.Iz*1e4,It_mm4=p.It*1e4;
    const Wy_mm3=p.Wy*1e3,Wz_mm3=p.Wz*1e3;
    const Iw_mm6=p.Iw*1e6;
    return{h:p.h,bf1:p.b,tf1:p.tf,bf2:p.b,tf2:p.tf,hw,tw:p.tw,A_mm2,Iy_mm4,Iz_mm4,It_mm4,Iw_mm6,
      Wy_top_mm3:Wy_mm3,Wy_bot_mm3:Wy_mm3,Wz_mm3,Wz_f1_mm3:p.tf*p.b*p.b/6,isRolled:true,ybar_mm:p.h/2};
  }
  const{bf1,tf1,bf2,tf2,hw,tw}=cust;
  const Af1=bf1*tf1,Af2=bf2*tf2,Aw=hw*tw,A_mm2=Af1+Af2+Aw;
  const yf2=tf2/2,yw=tf2+hw/2,yf1=tf2+hw+tf1/2;
  const ybar=(Af2*yf2+Aw*yw+Af1*yf1)/A_mm2;
  const Iy_mm4=(bf2*tf2**3)/12+Af2*(yf2-ybar)**2+(tw*hw**3)/12+Aw*(yw-ybar)**2+(bf1*tf1**3)/12+Af1*(yf1-ybar)**2;
  const zTop=tf2+hw+tf1-ybar,zBot=ybar;
  const If1=bf1**3*tf1/12,If2=bf2**3*tf2/12;
  const Iz_mm4=If1+If2+hw*tw**3/12;
  const Wz_mm3=Iz_mm4/(Math.max(bf1,bf2)/2);
  const It_mm4=(bf1*tf1**3+bf2*tf2**3+hw*tw**3)/3;
  const hd=hw+tf1/2+tf2/2;
  const Iw_mm6=(If1+If2)>0?If1*If2/(If1+If2)*hd*hd:0;
  return{h:hw+tf1+tf2,bf1,tf1,bf2,tf2,hw,tw,A_mm2,Iy_mm4,Iz_mm4,It_mm4,Iw_mm6,
    Wy_top_mm3:Iy_mm4/zTop,Wy_bot_mm3:Iy_mm4/zBot,Wz_mm3,Wz_f1_mm3:If1/(bf1/2),isRolled:false,ybar_mm:ybar};
}

// ── Zwichrzenie ───────────────────────────────────────────────────────────────
function computeLTB(sec,MyEd,MzEd,fy,Lcr_mm,{C1,C2,railType,hRail_mm}){
  const{Iz_mm4,It_mm4,Iw_mm6,Wy_top_mm3,Wz_mm3,isRolled,h,bf1,tf1}=sec;
  if(!Lcr_mm||Lcr_mm<=0||Iz_mm4<=0||Iw_mm6<=0)return null;
  const pi2EIz=Math.PI**2*E_MPa*Iz_mm4;
  const baseArg=Iw_mm6/Iz_mm4+Lcr_mm**2*G_MPa*It_mm4/pi2EIz;

  let Mcr_Nmm;
  let z_g=0;

  if(railType==="pad"){
    // z_g: odległość od środka ścinania do punktu przyłożenia [mm]
    // Dla przekroju symetrycznego: SC = centroid = h/2 od dołu
    // Punkt przyłożenia = wierzch szyny = h + hRail od dołu
    // → z_g = h/2 + hRail (powyżej SC = wartość dodatnia = destabilizująco)
    z_g=sec.h/2+hRail_mm;
    const term=Math.sqrt((C2*z_g)**2+baseArg)-C2*z_g;
    Mcr_Nmm=C1*(pi2EIz/Lcr_mm**2)*term;
  }else{
    // Szyna spawana: z_g = 0 → klasyczna formuła
    Mcr_Nmm=C1*(pi2EIz/Lcr_mm**2)*Math.sqrt(baseArg);
  }

  const Mcr_kNm=Mcr_Nmm/1e6;
  const MyRk_kNm=Wy_top_mm3*fy/1e6;
  const lambdaLT=Math.sqrt(MyRk_kNm/Mcr_kNm);
  const hb=h/bf1;
  let alphaLT,curve;
  if(isRolled){
    if(hb<=2&&tf1<=40){alphaLT=0.21;curve="a";}
    else if(hb>2&&tf1<=40){alphaLT=0.34;curve="b";}
    else if(hb<=2){alphaLT=0.34;curve="b";}
    else{alphaLT=0.49;curve="c";}
  }else{alphaLT=hb<=2?0.49:0.76;curve=hb<=2?"c":"d";}
  const noLTB=lambdaLT<=0.2;
  const chiLT=noLTB?1.0:(()=>{
    const phi=0.5*(1+alphaLT*(lambdaLT-0.2)+lambdaLT**2);
    return Math.min(1.0,1/(phi+Math.sqrt(Math.max(0,phi**2-lambdaLT**2))));
  })();
  const MbRd_kNm=chiLT*MyRk_kNm/gM1;
  const MzRk_kNm=Wz_mm3*fy/1e6;
  const term_My=MyEd/MbRd_kNm,term_Mz=MzRk_kNm>0?MzEd/(MzRk_kNm/gM1):0;
  return{Mcr_kNm,lambdaLT,chiLT,alphaLT,curve,MbRd_kNm,MyRk_kNm,MzRk_kNm,
    etaLT:term_My+term_Mz,term_My,term_Mz,noLTB,z_g,railType};
}

// ── Docisk koła / wyboczenie środnika — EN 1993-1-5 §6 ────────────────────────
function computeWebWheelResistance(sec, fy, FzEd_kN, aStiff_m, ss_mm) {
  const hw  = sec.hw;   // [mm]
  const tw  = sec.tw;   // [mm]
  const tf  = sec.tf1;  // [mm] — pas górny
  const bf  = sec.bf1;  // [mm]

  // EN 1993-1-5 §6.4.2 — kF: panel = rozstaw żeber, nie rozstaw kół!
  const a_mm = Math.max(aStiff_m * 1000, hw);          // panel ≥ hw
  const kF   = 6 + 2 * (hw / a_mm) ** 2;

  // EN 1993-1-5 §6.5.2 — m1 (jednolity materiał: fyf = fyw)
  const m1 = bf / tw;

  // Iteracja: m2 → ly (3 przebiegi wystarczają)
  let m2 = 0, ly = 0, lambdaF = 0;
  for (let i = 0; i < 3; i++) {
    const ly_raw = ss_mm + 2 * tf * (1 + Math.sqrt(m1 + m2)); // eq.(6.13)
    ly = Math.min(ly_raw, a_mm);                               // nie więcej niż panel

    const Fcr_i  = 0.9 * kF * E_MPa * tw ** 3 / hw;           // [N]
    lambdaF      = Math.sqrt(ly * tw * fy / Fcr_i);

    m2 = lambdaF > 0.5 ? 0.02 * (hw / tf) ** 2 : 0;           // eq.(6.17)
  }

  const Fcr  = 0.9 * kF * E_MPa * tw ** 3 / hw;               // [N]
  const chiF = Math.min(0.5 / Math.max(lambdaF, 0.001), 1.0); // eq.(6.3)
  const Leff = chiF * ly;                                       // [mm]
  const FRd  = Leff * tw * fy / gM1 / 1000;                   // [kN]

  return { kF, m1, m2, ly, lambdaF, chiF, Leff, FRd,
           etaLoc: FzEd_kN / FRd };
}

// ── Skręcanie i bimoment — EN 1993-6 §7.5 ─────────────────────────────────────
// Obowiązuje wyłącznie dla przekrojów dwuosiowo symetrycznych (HEA, HEB),
// gdzie środek ścinania pokrywa się ze środkiem ciężkości,
// a It oraz Iw pochodzą z tablicy profili.
function computeTorsionBimoment(sec, HTd_kN, HextTors_kN, FzEd_kN, l_m, hRail_mm, kRail_mm, useEcc) {
  // ── Składnik A: od poziomej siły suwnicy H_T na ramieniu pionowym ──
  // H_T działa na poziomie kontaktu koło–szyna = wierzch szyny
  const e_z   = sec.h / 2 + hRail_mm;                  // [mm] od środka ścinania
  const T_A   = HTd_kN * 1000 * e_z;                    // [N·mm]

  // ── Składnik C: od zewnętrznej siły poziomej H_ext, przyjętej na tej samej
  //    wysokości co H_T (ten sam mechanizm/ramię e_z). Tylko dla trybu
  //    "siła skupiona" — to jedyny przypadek fizycznie analogiczny do H_T
  //    (rozłożone/momentowe H_ext mają inną fizykę, zob. HextTors_kN=0 w useMemo).
  const T_C   = HextTors_kN * 1000 * e_z;               // [N·mm]

  // ── Składnik B: od mimośrodu pionowej siły koła ──
  const e_y   = useEcc ? kRail_mm / 4 : 0;             // [mm] EN 1993-6 §9.3.3
  const T_B   = FzEd_kN * 1000 * e_y;                   // [N·mm]

  // ── Moment skręcający całkowity (sumowanie — strona bezpieczna) ──
  const T_Ed  = T_A + T_B + T_C;                        // [N·mm]

  // ── Bimoment wg rozwiązania Własowa ──
  // Belka wolnopodparta, moment skręcający skupiony w środku rozpiętości
  const L_mm  = l_m * 1000;
  const k     = Math.sqrt(G_MPa * sec.It_mm4 / (E_MPa * sec.Iw_mm6));  // [1/mm]
  const kL2   = k * L_mm / 2;
  // tanh dla dużych argumentów → 1 (unikamy overflow)
  const tanhV = kL2 > 20 ? 1.0 : Math.tanh(kL2);
  const B_Ed  = T_Ed / (2 * k) * tanhV;                 // [N·mm²]

  // ── Naprężenie od skręcania nieswobodnego (narożnik pasa górnego) ──
  const omega   = (sec.bf1 / 2) * (sec.h - sec.tf1) / 2;  // [mm²] — wycinkowa
  const sigma_w = B_Ed * omega / sec.Iw_mm6;              // [MPa]

  return {
    e_z, e_y, T_A_kNm: T_A/1e6, T_B_kNm: T_B/1e6, T_C_kNm: T_C/1e6, T_Ed_kNm: T_Ed/1e6,
    k, B_Ed, B_Ed_kNm2: B_Ed/1e9, omega, sigma_w,
  };
}
function torsionApplicable(secMode, profFam) {
  return secMode === "rolled" && (profFam === "HEA" || profFam === "HEB");
}

// ── Klasyfikacja przekroju — EN 1993-1-1 Tab. 5.2 ─────────────────────────────
function classifySection(sec, fy) {
  const eps = Math.sqrt(235 / fy);  // ε

  const clFlange = (c, t) => {
    const r = c / t;
    return r <= 9*eps ? 1 : r <= 10*eps ? 2 : r <= 14*eps ? 3 : 4;
  };
  const clWebBend = (c, t) => {
    const r = c / t;
    return r <= 72*eps ? 1 : r <= 83*eps ? 2 : r <= 124*eps ? 3 : 4;
  };

  // c dla pasa = wysunięta część (bez środnika, bez r — konserwatywne)
  const cTop = (sec.bf1 - sec.tw) / 2;
  const cBot = (sec.bf2 - sec.tw) / 2;
  const cWeb = sec.hw;

  const classTop  = clFlange(cTop,  sec.tf1);
  const classBot  = clFlange(cBot,  sec.tf2);
  const classWeb  = clWebBend(cWeb, sec.tw);
  const secClass  = Math.max(classTop, classBot, classWeb);

  const lamTop = cTop / sec.tf1;
  const lamBot = cBot / sec.tf2;
  const lamWeb = cWeb / sec.tw;

  // Wpl,y — wzór dla I-kształtu; dokładny dla przekroju symetrycznego,
  // dla niesymetrycznych: konserwatywna aproksymacja
  const Wpl_top = sec.bf1 * sec.tf1 * (sec.hw / 2 + sec.tf1 / 2) +
                  sec.bf2 * sec.tf2 * (sec.hw / 2 + sec.tf2 / 2) +
                  sec.hw ** 2 * sec.tw / 4;          // [mm³]

  // klasa 1/2 → plastyczny; klasa 3 → sprężysty; klasa 4 → jak 3 + ostrzeżenie
  const Weff_mm3 = secClass <= 2 ? Wpl_top : sec.Wy_top_mm3;

  return { eps, classTop, classBot, classWeb, secClass,
           lamTop, lamBot, lamWeb, Wpl_top, Weff_mm3 };
}

// ── Pełny zestaw sprawdzeń dla danego przekroju i danych wejściowych ──────────
function computeChecks(sec,p){
  const{Qc,Qh,Lc,ac,nW,emin,vh,hcCl,mu,nr,l,q_total,fy,Lcr_m,C1,C2,secMode,profFam,
    useHext,hExtF,hExtQ,hExtM,hExtType,aStiff,ssMm,railType,hRail,kRail,useEccentricity,l1Bot}=p;
  const cls=classifySection(sec,fy);
  const hc=HC[hcCl],phi1=1.1,phi2=hc.phi2min+hc.beta2*vh,phi5=1.05;
  const Qrmin=phi1*Qc*(Lc-emin)/(nW*Lc),Qrmin_c=phi1*Qc*emin/(nW*Lc);
  const Qrmax=Qrmin+phi2*Qh*(Lc-emin)/(nW*Lc),Qrmax_c=Qrmin_c+phi2*Qh*emin/(nW*Lc);
  const sMin=Qrmin+Qrmin_c,sMax=Qrmax+Qrmax_c;
  const K=mu*sMin,HL=phi5*K/nr;
  const xi1=sMax/(sMax+sMin),Md=K*Math.abs(xi1-0.5)*Lc;
  const HT1=phi5*(1-xi1)*Md/ac,HT2=phi5*xi1*Md/ac,HT=Math.max(Math.abs(HT1),Math.abs(HT2));
  const Qd=Qrmax*gQ;
  const My_Q=ac<l?Qd*(2*l-ac)**2/(8*l):Qd*l/4;
  const MyEd=My_Q+gG*q_total*l*l/8;
  const VEd=(ac<l?Qd*(2*l-ac)/l:Qd)+gG*q_total*l/2;
  const HTd=HT*gQ,MzCrane=ac<l?HTd*(2*l-ac)**2/(8*l):HTd*l/4;
  let MzExt=0,HextR_d=0,HextR_c=0,HextTors_d=0;
  if(useHext){
    if(hExtType==="conc"){
      MzExt=hExtF*gQ*l/4;
      HextR_d=hExtF*gQ/2;HextR_c=hExtF/2;      // reakcja: siła skupiona w środku → P/2 na podporę
      HextTors_d=hExtF*gQ;                     // siła skupiona — ten sam mechanizm torsji co H_T (e_z)
    }else if(hExtType==="udl"){
      MzExt=hExtQ*gQ*l*l/8;
      HextR_d=hExtQ*gQ*l/2;HextR_c=hExtQ*l/2;  // reakcja: obciążenie równomierne → q·l/2 na podporę
      // obciążenie rozłożone wzdłuż belki daje moment skręcający ZMIENNY wzdłuż
      // rozpiętości (analogicznie do siły poprzecznej), niezgodny z uproszczonym
      // modelem Własowa dla torsji skupionej w środku → pomijamy (ostrzeżenie w UI)
    }else{
      MzExt=hExtM;
      // hExtType==="moment": wartość Mz,ext podana bezpośrednio, bez zdefiniowanego
      // punktu przyłożenia siły → brak jednoznacznej reakcji podporowej/ugięcia
    }
  }
  const MzEd=MzCrane+MzExt;
  const{Iy_mm4,Wy_top_mm3,Wy_bot_mm3,Wz_mm3}=sec;
  const sigmaRd=fy/gM0;
  const FzEd=Qrmax*gQ;
  // Skręcanie i bimoment — EN 1993-6 §7.5 (tylko HEA/HEB walcowane)
  const torsionOK=torsionApplicable(secMode,profFam);
  const tors=torsionOK?computeTorsionBimoment(sec,HTd,HextTors_d,FzEd,l,hRail,kRail,useEccentricity):null;
  const sigma_w=tors?.sigma_w??0;
  // Naprężenie w pasie górnym (zawsze sprężyste — dla V–M interakcji §6.2.8)
  const sigma_My=MyEd*1e6/Wy_top_mm3;
  const sigma_Mz=MzEd*1e6/Wz_mm3;
  const sigma_top=sigma_My+sigma_Mz+sigma_w;
  const sigma_bot=MyEd*1e6/Wy_bot_mm3;
  // Nośność momentowa na My — zależna od klasy przekroju (EN 1993-1-1 Tab. 5.2)
  const McRd_kNm=cls.Weff_mm3*fy/gM0/1e6;
  const etaTop=MyEd/McRd_kNm+MzEd/(Wz_mm3*fy/gM0/1e6)+sigma_w/(fy/gM0);
  const etaBot=sigma_bot/sigmaRd;
  const sigma_w_pct=sigma_top>0?(sigma_w/sigma_top*100):0;
  const Av=sec.hw*sec.tw,VplRd=Av*fy/(Math.sqrt(3)*gM0)/1000,etaV=VEd/VplRd;
  const rhoVM=VEd>0.5*VplRd?(2*VEd/VplRd-1)**2:0;
  const etaTopVM=sigma_top/(fy*(1-rhoVM)/gM0),vmActive=VEd>0.5*VplRd;
  // Docisk koła / wyboczenie środnika — EN 1993-1-5 §6
  const webR=computeWebWheelResistance(sec,fy,FzEd,aStiff,ssMm);
  const{FRd,etaLoc,Leff:Leff_web,kF:kFval,ly:ly_web,lambdaF:lambdaF_web,chiF:chiF_web}=webR;
  const EIy=E_MPa*1000*Iy_mm4*1e-12;
  const deflG=5*q_total*l**4/(384*EIy);
  const c_d=Math.max(0,(l-ac)/2);
  const deflQ=ac<l?Qrmax*c_d*(3*l**2-4*c_d**2)/(24*EIy):Qrmax*l**3/(48*EIy);
  const deflZ=(deflG+deflQ)*1000,deflGr=Math.min(l*1000/600,25),etaDefl=deflZ/deflGr;
  // Ugięcie poziome δy ≤ l/600 — obciążenia charakterystyczne H_T i H_ext (bez φ5, bez γQ)
  const HT_char=HT/phi5;
  const EIz=E_MPa*1000*sec.Iz_mm4*1e-12;
  const c_h=c_d;
  const deflY_HT=ac<l?HT_char*c_h*(3*l**2-4*c_h**2)/(24*EIz):HT_char*l**3/(48*EIz);
  let deflY_ext=0;
  if(useHext){
    if(hExtType==="conc")deflY_ext=hExtF*l**3/(48*EIz);          // siła skupiona w środku
    else if(hExtType==="udl")deflY_ext=5*hExtQ*l**4/(384*EIz);   // obciążenie równomierne
    // hExtType==="moment": bez zdefiniowanego punktu przyłożenia → brak wkładu do ugięcia
  }
  const deflY=deflY_HT+deflY_ext;
  const deflY_mm=deflY*1000,deflYGr=l*1000/600,etaDeflY=deflY_mm/deflYGr;
  // Ochrona pasa dolnego przed nadmiernymi drganiami (literatura — belki podsuwnicowe):
  // λ_bot = l1/iz ≤ 250, gdzie iz = promień bezwładności samego pasa (prostokąt bf2×tf2,
  // zginanie w płaszczyźnie poziomej): iz = bf2/√12 (niezależne od tf2)
  const iz_bot_mm=sec.bf2/Math.sqrt(12);
  const lambdaBot=(l1Bot*1000)/iz_bot_mm;
  const lambdaBotLim=250;
  const etaVibBot=lambdaBot/lambdaBotLim;
  const ltb=computeLTB(sec,MyEd,MzEd,fy,Lcr_m*1000,{C1,C2,railType,hRail_mm:hRail});
  const maxEta=Math.max(etaTop,vmActive?etaTopVM:0,etaBot,etaV,etaLoc,etaDefl,etaDeflY,etaVibBot,ltb?.etaLT??0);
  // Reakcje podporowe (belka wolnopodparta, 2 koła w pozycji ekstremalnej)
  const Qrmin_d=Qrmin*gQ;
  const RAmax_d=VEd,RAmax_c=(ac<l?Qrmax*(2*l-ac)/l:Qrmax)+q_total*l/2;
  const RAmin_d=(ac<l?Qrmin_d*(2*l-ac)/l:Qrmin_d)+gG*q_total*l/2;
  const RAmin_c=(ac<l?Qrmin*(2*l-ac)/l:Qrmin)+q_total*l/2;
  const RHmax_d=HTd,RHmax_c=HT;
  const RHext_d=HextR_d,RHext_c=HextR_c;
  const RL_d=HL*gQ,RL_c=HL;
  return{phi1,phi2,phi5,Qrmin,Qrmin_c,Qrmax,Qrmax_c,HL,HT,HT1,HT2,
    MyEd,MzEd,MzCrane,MzExt,VEd,sigma_top,sigma_bot,sigmaRd,VplRd,McRd_kNm,
    tors,torsionOK,sigma_w,sigma_w_pct,sigma_My,sigma_Mz,
    etaV,rhoVM,etaTopVM,vmActive,FzEd,FRd,etaLoc,
    kFval,ly_web,lambdaF_web,chiF_web,Leff_web,
    deflZ,deflGr,etaDefl,
    deflY_HT,deflY_ext,deflY_mm,deflYGr,etaDeflY,
    iz_bot_mm,lambdaBot,lambdaBotLim,etaVibBot,
    etaTop,etaBot,ltb,maxEta,cls,
    RAmax_d,RAmax_c,RAmin_d,RAmin_c,RHmax_d,RHmax_c,RHext_d,RHext_c,RL_d,RL_c};
}

// ── Generator raportu HTML ────────────────────────────────────────────────────
function makeReport(p){
  const{Qc,Qh,Lc,ac,nW,emin,vh,hcCl,nr,l,steel,fy,q_total,Lcr_m,C1,secMode,profFam,profName,profile,sec,R,kRail,useHext,hExtType,l1Bot}=p;
  const d=new Date().toLocaleDateString('pl-PL');
  const n=(x,dp=2)=>(!isFinite(x)||x===null)?'—':x.toLocaleString('pl-PL',{minimumFractionDigits:dp,maximumFractionDigits:dp});
  const ok=v=>v<=1.0;
  const clr=v=>ok(v)?'#1a7a1a':'#b00000';
  const lbl=v=>ok(v)?'✓ OK':'✗ NIE';
  const bar=v=>{const w=Math.min(v*100,100);const c=ok(v)?v>0.9?'#e08800':'#1a9a1a':'#b00000';
    return `<span style="display:inline-block;width:60px;height:8px;background:#e0e0e0;vertical-align:middle;border-radius:2px;margin-left:4px"><span style="display:block;height:8px;width:${w}%;background:${c};border-radius:2px"></span></span>`;};
  const rowN=(lb,eta,formula)=>`<tr><td>${lb}</td>
    <td style="text-align:right;font-family:monospace">${n(eta,3)}${bar(eta)}</td>
    <td style="text-align:center;color:${clr(eta)};font-weight:bold">${lbl(eta)}</td>
    <td style="font-family:monospace;font-size:8.5pt;color:#444">${formula||''}</td></tr>`;
  const secDesc=secMode==='rolled'
    ?`${profFam} ${profName}  (h=${profile?.h}, b=${profile?.b}, tw=${profile?.tw}, tf=${profile?.tf} mm)`
    :`Spawany: bₓ₁=${sec.bf1}/tₓ₁=${sec.tf1}, hₓ=${sec.hw}/tₓ=${sec.tw}, bₓ₂=${sec.bf2}/tₓ₂=${sec.tf2} mm`;
  const css=`@page{size:A4;margin:18mm 15mm 18mm 20mm}
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:10pt;color:#111;line-height:1.4;margin:0;padding:12px}
    h1{font-size:13pt;margin:0 0 2px;border-bottom:2px solid #333;padding-bottom:6px}
    h2{font-size:10pt;background:#f0f0f0;padding:3px 8px;margin:14px 0 5px;border-left:3px solid #b07020;color:#333}
    table{width:100%;border-collapse:collapse;font-size:9.5pt;margin-bottom:6px}
    th{background:#e8e8e8;border:1px solid #bbb;padding:3px 7px;text-align:left}
    td{border:1px solid #ccc;padding:3px 7px}
    .note{font-size:8pt;color:#666;font-style:italic;margin:3px 0}
    .foot{font-size:7.5pt;color:#888;border-top:1px solid #ccc;padding-top:6px;margin-top:18px}
    .hi{background:#fffbe6}.sum{background:#f5f5f5;font-weight:bold}
    @media print{.np{display:none}}`;
  return `<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8">
<title>Belka podsuwnicowa — wyciąg obliczeń</title><style>${css}</style></head><body>
<button class="np" onclick="window.print()" style="background:#e07000;color:#fff;border:none;padding:9px 22px;border-radius:4px;cursor:pointer;font-size:11pt;font-weight:bold;margin-bottom:14px">
  🖨️  Drukuj / Zapisz jako PDF</button>
<h1>Wyciąg z obliczeń — Belka podsuwnicowa natorowa</h1>
<table style="margin-bottom:10px"><tr>
  <td style="border:none;font-size:8.5pt;color:#666">Data: <b>${d}</b></td>
  <td style="border:none;font-size:8.5pt;color:#666;text-align:right">Program: Belka podsuwnicowa v3.0 | PN-EN 1991-3 · PN-EN 1993-6 · EC3-1-1</td>
</tr></table>

<h2>1. Dane wejściowe</h2>
<table><tr><th colspan="2">Suwnica</th><th colspan="2">Belka i przekrój</th></tr>
<tr><td>Ciężar własny Q_c</td><td><b>${n(Qc,0)} kN</b></td><td>Rozpiętość belki l</td><td><b>${n(l,2)} m</b></td></tr>
<tr><td>Udźwig nominalny Q_h</td><td><b>${n(Qh,0)} kN</b></td><td>Gatunek stali</td><td><b>${steel}  (f_y = ${fy} MPa)</b></td></tr>
<tr><td>Rozpiętość mostu L</td><td>${n(Lc,2)} m</td><td>Ciężar belki + szyna q</td><td>${n(q_total,3)} kN/m</td></tr>
<tr><td>Rozstaw kół a</td><td>${n(ac,2)} m</td><td>Długość wyboczeniowa L_cr</td><td>${n(Lcr_m,2)} m</td></tr>
<tr><td>Liczba kół / tor n</td><td>${nW}</td><td>Wsp. momentowy C₁</td><td>${n(C1,2)}</td></tr>
<tr><td>e_min (hak – oś toru)</td><td>${n(emin,2)} m</td><td rowspan="3">Przekrój</td><td rowspan="3">${secDesc}</td></tr>
<tr><td>Prędkość podnoszenia v_h</td><td>${n(vh,2)} m/s</td></tr>
<tr><td>Klasa podnoszenia</td><td>${hcCl}</td></tr></table>

<h2>2. Współczynniki dynamiczne i reakcje kół</h2>
<table><tr><th>φ₁</th><th>φ₂</th><th>φ₅</th><th>Q_r,min [kN]</th><th>Q_r,(min) [kN]</th>
  <th>Q_r,max [kN]</th><th>Q_r,(max) [kN]</th><th>H_L [kN]</th><th>H_T [kN]</th></tr>
<tr style="font-family:monospace">
  <td>${n(R.phi1,2)}</td><td>${n(R.phi2,3)}</td><td>1,05</td>
  <td>${n(R.Qrmin,1)}</td><td>${n(R.Qrmin_c,1)}</td>
  <td><b>${n(R.Qrmax,1)}</b></td><td>${n(R.Qrmax_c,1)}</td>
  <td>${n(R.HL,2)}</td><td><b>${n(R.HT,2)}</b></td></tr></table>

<h2>3. Siły przekrojowe (ULS: γ_G=1,35; γ_Q=1,50)</h2>
<table><tr><th>Składowa</th><th>Wartość</th><th>Wzór (formuła obwiedni 2 kół)</th></tr>
<tr><td>M_y,Ed</td><td><b>${n(R.MyEd,1)} kNm</b></td><td style="font-family:monospace">Q_d·(2l−a)²/(8l) + γ_G·q·l²/8</td></tr>
<tr><td>M_z,Ed</td><td><b>${n(R.MzEd,1)} kNm</b></td>
  <td style="font-family:monospace">H_T,d·(2l−a)²/(8l)${R.MzExt>0?' + M_z,zewn.='+n(R.MzExt,1)+' kNm':''}</td></tr>
<tr><td>V_Ed</td><td><b>${n(R.VEd,1)} kN</b></td><td style="font-family:monospace">Q_d·(2l−a)/l + γ_G·q·l/2</td></tr></table>

<h2>4. Charakterystyki przekroju poprzecznego</h2>
<table><tr><th>A [cm²]</th><th>I_y [cm⁴]</th><th>I_z [cm⁴]</th><th>I_t [cm⁴]</th>
  <th>I_w [×10³cm⁶]</th><th>W_y,top [cm³]</th><th>W_y,bot [cm³]</th><th>W_z,pełny [cm³]</th></tr>
<tr style="font-family:monospace;text-align:right">
  <td>${n(sec.A_mm2/100,1)}</td><td>${n(sec.Iy_mm4/1e4,0)}</td><td>${n(sec.Iz_mm4/1e4,0)}</td>
  <td>${n(sec.It_mm4/1e4,1)}</td><td>${n(sec.Iw_mm6/1e9,0)}</td>
  <td>${n(sec.Wy_top_mm3/1e3,0)}</td><td>${n(sec.Wy_bot_mm3/1e3,0)}</td><td>${n(sec.Wz_mm3/1e3,1)}</td></tr></table>

<h2>4b. Klasyfikacja przekroju (EN 1993-1-1 Tab. 5.2)</h2>
<table>
<tr><th>Element</th><th>c/t</th><th>Limit Kl.1</th><th>Limit Kl.3</th><th>Klasa</th></tr>
<tr><td>Pas górny</td><td>${n(R.cls.lamTop,1)}</td>
    <td>≤ ${n(9*R.cls.eps,1)}</td><td>≤ ${n(14*R.cls.eps,1)}</td>
    <td><b>Klasa ${R.cls.classTop}</b></td></tr>
<tr><td>Pas dolny</td><td>${n(R.cls.lamBot,1)}</td>
    <td>≤ ${n(9*R.cls.eps,1)}</td><td>≤ ${n(14*R.cls.eps,1)}</td>
    <td><b>Klasa ${R.cls.classBot}</b></td></tr>
<tr><td>Środnik (zginanie)</td><td>${n(R.cls.lamWeb,1)}</td>
    <td>≤ ${n(72*R.cls.eps,1)}</td><td>≤ ${n(124*R.cls.eps,1)}</td>
    <td><b>Klasa ${R.cls.classWeb}</b></td></tr>
<tr class="sum"><td colspan="4">KLASA PRZEKROJU</td><td><b>Klasa ${R.cls.secClass}</b></td></tr>
<tr><td colspan="4">W_y,eff (${R.cls.secClass<=2?"plastyczny":"sprężysty"})</td>
    <td>${n(R.cls.Weff_mm3/1e3,0)} cm³</td></tr>
</table>
${R.cls.secClass===4?'<p class="note" style="color:#b00000">⚠ Klasa 4 — wymagany przekrój efektywny wg EN 1993-1-5. Wyniki niezachowawcze.</p>':''}

<h2>5. Sprawdzenia stanu granicznego nośności (SGN)</h2>
<table><tr><th>Sprawdzenie</th><th style="width:110px">η [−]</th><th style="width:75px">Wynik</th><th>Obliczenie</th></tr>
${rowN('Pas górny — zginanie dwukierunkowe My+Mz',R.etaTop,`σ=${n(R.sigma_top,1)} / ${n(R.sigmaRd,0)} MPa = My/Wy,top + Mz/Wz`)}
${rowN('Pas dolny — zginanie jednokierunkowe My',R.etaBot,`σ=${n(R.sigma_bot,1)} / ${n(R.sigmaRd,0)} MPa`)}
${rowN('Środnik — ścinanie V_pl,Rd',R.etaV,`VEd=${n(R.VEd,1)} / Vpl,Rd=${n(R.VplRd,1)} kN`)}
${R.vmActive?`<tr class="hi"><td>⚠ V–M interakcja §6.2.8 (V_Ed > 0,5·V_pl,Rd)</td>
  <td style="text-align:right;font-family:monospace">${n(R.etaTopVM,3)}${bar(R.etaTopVM)}</td>
  <td style="text-align:center;color:${clr(R.etaTopVM)};font-weight:bold">${lbl(R.etaTopVM)}</td>
  <td style="font-family:monospace;font-size:8.5pt">ρ=${n(R.rhoVM,3)};  σ_Rd,red=${n(R.sigmaRd*(1-R.rhoVM),0)} MPa</td></tr>`:''}
${rowN('Środnik — lokalny docisk koła EC3-1-5 §6',R.etaLoc,`Fz,Ed=${n(R.FzEd,1)} / FRd=${n(R.FRd,1)} kN, kF=${n(R.kFval,2)}, ly=${n(R.ly_web,0)}mm, Leff=${n(R.Leff_web,0)}mm, FRd=${n(R.FRd,1)}kN`)}</table>

<h2>6. Zwichrzenie — PN-EN 1993-1-1 §6.3.2.2</h2>
${R.ltb?`<table><tr><th>M_cr [kNm]</th><th>C₁</th><th>L_cr [m]</th><th>λ̄_LT</th>
  <th>α_LT (krzywa)</th><th>χ_LT</th><th>M_b,Rd [kNm]</th><th>M_y,Rk [kNm]</th><th>M_z,Rk [kNm]</th></tr>
<tr style="font-family:monospace;text-align:right">
  <td>${n(R.ltb.Mcr_kNm,1)}</td><td>${n(C1,2)}</td><td>${n(Lcr_m,2)}</td>
  <td>${n(R.ltb.lambdaLT,3)}</td><td>${n(R.ltb.alphaLT,2)} (${R.ltb.curve})</td>
  <td><b>${n(R.ltb.chiLT,3)}</b></td><td><b>${n(R.ltb.MbRd_kNm,1)}</b></td>
  <td>${n(R.ltb.MyRk_kNm,1)}</td><td>${n(R.ltb.MzRk_kNm,1)}</td></tr></table>
<table style="margin-top:3px"><tr><th>Warunek LTB + interakcja</th><th style="width:110px">η [−]</th><th style="width:75px">Wynik</th><th>Składniki</th></tr>
${rowN('My/(χLT·My,Rk/γM1) + Mz/(Mz,Rk/γM1) ≤ 1',R.ltb.etaLT,
  `${n(R.ltb.term_My,3)} + ${n(R.ltb.term_Mz,3)}`)}
<tr><td>Typ szyny / poziom obciążenia</td><td colspan="3">${R.ltb.railType==="welded"
  ? "Szyna spawana bezpośrednio — z_g = 0 wg EN 1993-6 §5.4.1, brak redukcji Mcr"
  : `Szyna na podkładce elastomerowej — z_g = ${n(R.ltb.z_g,0)} mm, Mcr zredukowany`}</td></tr>
${R.torsionOK?`
<tr class="hi"><td colspan="4" style="font-size:8.5pt;color:#7a5a00">
  ⚠ Uwzględniono moment skręcający T_Ed i bimoment B_Ed wg EN 1993-6 §7.5
  (tylko dla HEA/HEB). Nie uwzględniono: naprężeń stycznych od skręcania
  swobodnego (St. Venant) ani pełnej interakcji M-B wg EN 1993-6 §6.3.2.
  Mcr wyznaczono bez redukcji od skręcania.
</td></tr>`:`
<tr class="hi"><td colspan="4" style="font-size:8.5pt;color:#7a5a00">
  ⚠ Ograniczenia: nie uwzględniono momentu skręcającego T_Ed (M_z ≠ T)
  ani bimomentu B_Ed wg EN 1993-6 §6.3.2. Dla belek z tężnikiem hamownym
  wymagana pełna weryfikacja skręcania nieswobodnego.
</td></tr>`}
</table>${R.ltb.noLTB?'<p class="note">λ̄_LT ≤ 0,2 — zwichrzenie pomijalne §6.3.2.2(4), χ_LT = 1,0</p>':''}
`:'<p class="note">Nie można wyznaczyć M_cr — sprawdź geometrię przekroju.</p>'}

<h2>6b. Skręcanie i bimoment (EN 1993-6 §7.5)</h2>
${R.torsionOK?`
<table>
<tr><th>Wielkość</th><th>Wartość</th><th>Opis</th></tr>
<tr><td>e_z</td><td>${n(R.tors.e_z,0)} mm</td>
    <td>Ramię siły poziomej: h/2 + h_szyny (poziom kontaktu koło–szyna)</td></tr>
<tr><td>e_y</td><td>${n(R.tors.e_y,1)} mm</td>
    <td>${R.tors.e_y>0
       ? "Mimośród koła = k/4 (EN 1993-6 §9.3.3), k = "+n(kRail,0)+" mm"
       : "Mimośród koła pominięty przez użytkownika"}</td></tr>
<tr><td>T_A</td><td>${n(R.tors.T_A_kNm,2)} kNm</td><td>Od siły poziomej suwnicy: H_T,Ed · e_z</td></tr>
<tr><td>T_B</td><td>${n(R.tors.T_B_kNm,2)} kNm</td><td>Od mimośrodu koła: F_z,Ed · e_y</td></tr>
<tr><td>T_C</td><td>${n(R.tors.T_C_kNm,2)} kNm</td>
    <td>${useHext&&hExtType==="conc"
       ? "Od zewnętrznej siły poziomej H_ext,d · e_z (przyjęta na tej samej wysokości co H_T)"
       : "Zewnętrzna siła pozioma nieaktywna lub nie jest siłą skupioną — brak wkładu"}</td></tr>
<tr class="sum"><td>T_Ed</td><td><b>${n(R.tors.T_Ed_kNm,2)} kNm</b></td>
    <td>Moment skręcający całkowity</td></tr>
${useHext&&hExtType==="udl"?`
<tr><td colspan="3" style="font-size:8.5pt;color:#7a5a00">
  ⚠ Obciążenie „Równomierne" (q_h,ext) nie jest wliczone do T_Ed — siła rozłożona wzdłuż belki
  daje moment skręcający zmienny na długości (jak siła poprzeczna), niezgodny z uproszczonym
  modelem Własowa dla torsji skupionej w środku rozpiętości. Wymaga osobnej analizy.
</td></tr>`:''}
${useHext&&hExtType==="moment"?`
<tr><td colspan="3" style="font-size:8.5pt;color:#7a5a00">
  ⚠ Mz,ext podany bezpośrednio jako moment — bez zdefiniowanego punktu przyłożenia siły
  nie wlicza się do T_Ed.
</td></tr>`:''}
<tr><td>k</td><td>${n(R.tors.k*1000,4)} ×10⁻³/mm</td>
    <td>Parametr skręcania: √(G·I_t/(E·I_w))</td></tr>
<tr><td>B_Ed</td><td>${n(R.tors.B_Ed_kNm2,1)} kNm²</td>
    <td>Bimoment (Własow, siła skupiona w środku rozpiętości)</td></tr>
<tr><td>σ_ω</td><td><b>${n(R.sigma_w,1)} MPa</b></td>
    <td>Naprężenie od skręcania nieswobodnego, narożnik pasa górnego</td></tr>
</table>
<table style="margin-top:4px">
<tr><th colspan="4">Rozkład naprężeń w pasie górnym</th></tr>
<tr><td>σ_My = ${n(R.sigma_My,1)} MPa</td>
    <td>σ_Mz = ${n(R.sigma_Mz,1)} MPa</td>
    <td>σ_ω = ${n(R.sigma_w,1)} MPa</td>
    <td class="sum"><b>σ_x = ${n(R.sigma_top,1)} MPa</b></td></tr>
<tr><td colspan="4" style="font-size:8.5pt">
    Udział skręcania nieswobodnego w naprężeniu całkowitym:
    <b>${n(R.sigma_w_pct,1)}%</b></td></tr>
</table>
`:`
<p class="note">Sprawdzenie bimomentu niedostępne dla wybranego przekroju
(${secMode==="welded" ? "przekrój spawany — środek ścinania wymaga oddzielnego wyznaczenia" : "profile "+profFam+" — moduł zaimplementowano wyłącznie dla HEA/HEB"}).
Zalecana weryfikacja w programie MES z analizą 7-stopniową swobody.</p>
`}

<h2>7. SGU — ugięcia (obciążenia charakterystyczne)</h2>
<table><tr><th>Warunek</th><th style="width:110px">η [−]</th><th style="width:75px">Wynik</th><th>Obliczenie</th></tr>
${rowN(`δz ≤ min(l/600, 25mm) = ${n(R.deflGr,1)} mm`,R.etaDefl,`δz = ${n(R.deflZ,1)} mm`)}
${rowN(`δy ≤ l/600 = ${n(R.deflYGr,1)} mm (H_T,char + H_ext,char, bez φ₅ i γQ)`,R.etaDeflY,`δy = ${n(R.deflY_mm,1)} mm (H_T: ${n(R.deflY_HT*1000,1)} + H_ext: ${n(R.deflY_ext*1000,1)} mm)`)}</table>

<h2>7b. Pas dolny — ochrona przed nadmiernymi drganiami</h2>
<p class="note">Warunek nienormowy (spoza EC3) — ogranicza smukłość pasa dolnego, który — w przeciwieństwie
do pasa górnego usztywnionego szyną — nie ma bocznego podparcia od obciążeń stałych.</p>
<table><tr><th>Warunek</th><th style="width:110px">η [−]</th><th style="width:75px">Wynik</th><th>Obliczenie</th></tr>
${rowN(`λ = l₁/iz ≤ ${R.lambdaBotLim}`,R.etaVibBot,`l₁=${n(l1Bot,2)} m, iz=${n(R.iz_bot_mm,1)} mm → λ=${n(R.lambdaBot,1)}`)}</table>

<h2>8. Zestawienie wytężeń — podsumowanie</h2>
<table><tr><th>Sprawdzenie</th><th style="width:110px">η [−]</th><th style="width:120px">Wynik</th></tr>
<tr><td>Pas górny My+Mz</td><td style="font-family:monospace;text-align:right">${n(R.etaTop,3)}${bar(R.etaTop)}</td>
  <td style="color:${clr(R.etaTop)};font-weight:bold;text-align:center">${lbl(R.etaTop)}</td></tr>
<tr><td>Pas dolny My</td><td style="font-family:monospace;text-align:right">${n(R.etaBot,3)}${bar(R.etaBot)}</td>
  <td style="color:${clr(R.etaBot)};font-weight:bold;text-align:center">${lbl(R.etaBot)}</td></tr>
<tr><td>Ścinanie V_Ed/V_pl,Rd</td><td style="font-family:monospace;text-align:right">${n(R.etaV,3)}${bar(R.etaV)}</td>
  <td style="color:${clr(R.etaV)};font-weight:bold;text-align:center">${lbl(R.etaV)}</td></tr>
${R.vmActive?`<tr><td>V–M interakcja §6.2.8</td><td style="font-family:monospace;text-align:right">${n(R.etaTopVM,3)}${bar(R.etaTopVM)}</td>
  <td style="color:${clr(R.etaTopVM)};font-weight:bold;text-align:center">${lbl(R.etaTopVM)}</td></tr>`:''}
<tr><td>Docisk koła F_Rd</td><td style="font-family:monospace;text-align:right">${n(R.etaLoc,3)}${bar(R.etaLoc)}</td>
  <td style="color:${clr(R.etaLoc)};font-weight:bold;text-align:center">${lbl(R.etaLoc)}</td></tr>
${R.ltb?`<tr><td>Zwichrzenie LTB</td><td style="font-family:monospace;text-align:right">${n(R.ltb.etaLT,3)}${bar(R.ltb.etaLT)}</td>
  <td style="color:${clr(R.ltb.etaLT)};font-weight:bold;text-align:center">${lbl(R.ltb.etaLT)}</td></tr>`:''}
<tr><td>Ugięcie δz</td><td style="font-family:monospace;text-align:right">${n(R.etaDefl,3)}${bar(R.etaDefl)}</td>
  <td style="color:${clr(R.etaDefl)};font-weight:bold;text-align:center">${lbl(R.etaDefl)}</td></tr>
<tr><td>Ugięcie δy</td><td style="font-family:monospace;text-align:right">${n(R.etaDeflY,3)}${bar(R.etaDeflY)}</td>
  <td style="color:${clr(R.etaDeflY)};font-weight:bold;text-align:center">${lbl(R.etaDeflY)}</td></tr>
<tr><td>Pas dolny — smukłość l₁/iz (drgania)</td><td style="font-family:monospace;text-align:right">${n(R.etaVibBot,3)}${bar(R.etaVibBot)}</td>
  <td style="color:${clr(R.etaVibBot)};font-weight:bold;text-align:center">${lbl(R.etaVibBot)}</td></tr>
<tr class="sum"><td>WYNIK OGÓLNY — η max</td>
  <td style="font-family:monospace;text-align:right;font-size:11pt">${n(R.maxEta,3)}</td>
  <td style="font-size:11pt;text-align:center;color:${R.maxEta<=1.0?'#1a7a1a':'#b00000'};font-weight:bold">
    ${R.maxEta<=1.0?'✓ NOŚNOŚĆ ZAPEWNIONA':'✗ NOŚNOŚĆ PRZEKROCZONA'}</td></tr></table>

<div class="foot">Narzędzie wspomagające obliczenia. Wyniki wymagają weryfikacji przez uprawnionego projektanta.<br>
Zastosowane normy: PN-EN 1991-3, PN-EN 1993-6, PN-EN 1993-1-1, PN-EN 1993-1-5.<br>
Wygenerowano: Belka podsuwnicowa v3.0 (${d})</div>
</body></html>`;
}

// ── UI helpers ────────────────────────────────────────────────────────────────
const fmt=(x,d=2)=>(!isFinite(x)||x===null)?'—':x.toLocaleString('pl-PL',{minimumFractionDigits:d,maximumFractionDigits:d});
function Field({label,unit,value,onChange,step="any",hint,disabled}){return(
  <label className="block">
    <span className="text-[11px] uppercase tracking-wide text-stone-500 font-semibold">{label}</span>
    <div className="flex items-center gap-1 mt-0.5">
      <input type="number" step={step} value={value} disabled={!!disabled}
        onChange={e=>onChange(parseFloat(e.target.value))}
        className={`w-full rounded-sm border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-600/40
          ${disabled?"bg-stone-100 text-stone-400 border-stone-200":"bg-white text-stone-800 border-stone-300"}`}/>
      {unit&&<span className="text-xs text-stone-400 w-10 shrink-0">{unit}</span>}
    </div>
    {hint&&<p className="text-[10px] text-stone-400 mt-0.5">{hint}</p>}
  </label>
);}
function Sel({label,value,onChange,options,wide}){return(
  <label className={`block${wide?" col-span-full":""}`}>
    <span className="text-[11px] uppercase tracking-wide text-stone-500 font-semibold">{label}</span>
    <select value={value} onChange={e=>onChange(e.target.value)}
      className="mt-0.5 w-full rounded-sm border border-stone-300 bg-white px-2 py-1.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600/40">
      {options.map(o=><option key={o.v??o} value={o.v??o}>{o.l??o}</option>)}
    </select>
  </label>
);}
function Card({title,no,children}){return(
  <div className="border border-stone-300 bg-stone-50/60 rounded-sm">
    <div className="flex items-baseline gap-2 px-3 py-2 border-b border-stone-300 bg-stone-100">
      <span className="font-mono text-amber-700 text-xs font-bold">{no}</span>
      <h3 className="text-sm font-semibold text-stone-700 tracking-wide">{title}</h3>
    </div>
    <div className="p-3 grid grid-cols-2 gap-3">{children}</div>
  </div>
);}
function Span({children}){return <div className="col-span-full">{children}</div>;}
function Btn({active,onClick,children,cls}){return(
  <button onClick={onClick}
    className={`px-2.5 py-1 text-xs rounded-sm border font-medium transition-colors ${cls||
      (active?"bg-amber-700 border-amber-700 text-white":"bg-white border-stone-300 text-stone-600 hover:border-amber-700")}`}>
    {children}
  </button>
);}
function UtilBar({label,value,formula,note,warn}){
  const ok=(value??0)<=1.0;
  const bar=warn?"bg-amber-500":ok?(value>0.9?"bg-amber-500":"bg-emerald-600"):"bg-red-600";
  return(
    <div className="py-1.5 border-b border-stone-200 last:border-0">
      <div className="flex justify-between items-baseline text-xs">
        <span className="text-stone-700 font-medium">{label}</span>
        <span className={`font-mono font-bold ${warn?"text-amber-700":ok?"text-emerald-700":"text-red-700"}`}>
          η={fmt(value,3)}&nbsp;{warn?"⚠":ok?"✓":"✗"}</span>
      </div>
      {formula&&<div className="text-[10px] text-stone-400 font-mono">{formula}</div>}
      {note&&<div className="text-[10px] text-amber-700 italic">{note}</div>}
      <div className="h-1.5 mt-1 bg-stone-200 rounded-full overflow-hidden">
        <div className={`h-full ${bar}`} style={{width:`${Math.min((value??0)*100,100)}%`}}/>
      </div>
    </div>
  );
}

// ── Główny komponent ─────────────────────────────────────────────────────────
export default function App(){
  const [secMode,setSecMode]=useState("rolled");
  const [profFam,setProfFam]=useState("HEB");
  const [profName,setProfName]=useState("HEB 300");
  const [bf1,setB1]=useState(400);const [tf1,setT1]=useState(25);
  const [bf2,setB2]=useState(300);const [tf2,setT2]=useState(16);
  const [hw,setHw]=useState(900); const [tw,setTw]=useState(10);
  const [Qc,setQc]=useState(120);const [Qh,setQh]=useState(100);
  const [Lc,setLc]=useState(16.5);const [ac,setAc]=useState(4.4);
  const [nW,setNw]=useState(2);const [emin,setEmin]=useState(1.0);
  const [vh,setVh]=useState(0.13);const [hcCl,setHcCl]=useState("HC2");
  const [mu,setMu]=useState(0.2);const [nr,setNr]=useState(2);
  const [l,setL]=useState(7.0);const [steel,setSt]=useState("S355");
  const [qAutoMode,setQAutoMode]=useState(true);
  const [qRail,setQRail]=useState(0.40);const [qManual,setQManual]=useState(1.2);
  const [useHext,setUseHext]=useState(false);
  const [hExtF,setHExtF]=useState(5.0);const [hExtQ,setHExtQ]=useState(0.5);
  const [hExtM,setHExtM]=useState(10.0);const [hExtType,setHExtType]=useState("conc");
  const [bMode,setBMode]=useState("none");const [bCust,setBCust]=useState(3.5);
  const [c1Idx,setC1Idx]=useState(0);
  const [aStiff,setAStiff]=useState(7.0);   // [m] rozstaw żeber poprzecznych, domyślnie = l
  const [ssMm,setSsMm]=useState(0);         // [mm] sztywna długość docisku ss; 0 = kontakt punktowy
  const [railType,setRailType]=useState("welded"); // "welded" | "pad"
  const [hRail,setHRail]=useState(50);      // [mm] wysokość szyny, aktywne tylko dla "pad"
  const [railName,setRailName]=useState("Kęs 50×50");
  const [kRail,setKRail]=useState(50);              // [mm] szerokość główki
  const [useEccentricity,setUseEccentricity]=useState(true); // mimośród koła e_y = k/4
  const [l1Bot,setL1Bot]=useState(7.0);      // [m] rozstaw stężeń bocznych pasa dolnego, domyślnie = l

  const handleRailChange=(name)=>{
    setRailName(name);
    const r=RAILS[name];
    if(r&&r.k!==null){setKRail(r.k);setHRail(r.h);}
  };

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast,setToast]=useState(null);
  const toastTimer=useRef(null);
  const showToast=(msg)=>{
    setToast(msg);
    if(toastTimer.current)clearTimeout(toastTimer.current);
    toastTimer.current=setTimeout(()=>setToast(null),3000);
  };

  const fy=STEEL[steel];
  const profile=secMode==="rolled"?PROFILES[profFam]?.[profName]:null;
  const sec=useMemo(()=>computeSection(secMode,profile,{bf1,tf1,bf2,tf2,hw,tw}),
    [secMode,profile,bf1,tf1,bf2,tf2,hw,tw]);
  const q_beam_auto=sec.A_mm2*rhoSteel*9.81e-3*1e-6;
  const q_total=qAutoMode?(q_beam_auto+qRail):qManual;
  const Lcr_m=useMemo(()=>{
    if(bMode==="half")return l/2;if(bMode==="third")return l/3;
    if(bMode==="quarter")return l/4;if(bMode==="custom")return Math.max(0.1,bCust);
    return l;
  },[bMode,bCust,l]);
  const C1=C1_CASES[c1Idx]?.C1??1.06;
  const C2=C1_CASES[c1Idx]?.C2??0;

  const paramsForChecks=useMemo(()=>({Qc,Qh,Lc,ac,nW,emin,vh,hcCl,mu,nr,l,q_total,fy,Lcr_m,C1,C2,secMode,profFam,
    useHext,hExtF,hExtQ,hExtM,hExtType,aStiff,ssMm,railType,hRail,kRail,useEccentricity,l1Bot}),
    [Qc,Qh,Lc,ac,nW,emin,vh,hcCl,mu,nr,l,q_total,fy,Lcr_m,C1,C2,secMode,profFam,
     useHext,hExtF,hExtQ,hExtM,hExtType,aStiff,ssMm,railType,hRail,kRail,useEccentricity,l1Bot]);

  const R=useMemo(()=>computeChecks(sec,paramsForChecks),[sec,paramsForChecks]);

  const ok=R.maxEta<=1.0;

  // ── Generuj raport — nakładka z iframe ────────────────────────────────────
  const [showReport,setShowReport]=useState(false);
  const [reportHtml,setReportHtml]=useState('');

  const handleReport=()=>{
    const html=makeReport({Qc,Qh,Lc,ac,nW,emin,vh,hcCl,nr,l,steel,fy,q_total,Lcr_m,C1,
      secMode,profFam,profName,profile,sec,R,kRail,useHext,hExtType,l1Bot});
    setReportHtml(html);
    setShowReport(true);
  };

  const doPrint=()=>{
    const fr=document.getElementById('__rptFrame');
    if(fr&&fr.contentWindow) fr.contentWindow.print();
  };

  // ── Zapis / odczyt projektu (JSON) ────────────────────────────────────────
  const snapshotInputs=()=>({secMode,profFam,profName,bf1,tf1,bf2,tf2,hw,tw,
    Qc,Qh,Lc,ac,nW,emin,vh,hcCl,mu,nr,l,steel,
    qAutoMode,qRail,qManual,
    useHext,hExtF,hExtQ,hExtM,hExtType,
    bMode,bCust,c1Idx,
    aStiff,ssMm,railType,hRail,railName,kRail,useEccentricity,l1Bot});

  const inputSetters={
    secMode:setSecMode,profFam:setProfFam,profName:setProfName,
    bf1:setB1,tf1:setT1,bf2:setB2,tf2:setT2,hw:setHw,tw:setTw,
    Qc:setQc,Qh:setQh,Lc:setLc,ac:setAc,nW:setNw,emin:setEmin,vh:setVh,hcCl:setHcCl,mu:setMu,nr:setNr,
    l:setL,steel:setSt,
    qAutoMode:setQAutoMode,qRail:setQRail,qManual:setQManual,
    useHext:setUseHext,hExtF:setHExtF,hExtQ:setHExtQ,hExtM:setHExtM,hExtType:setHExtType,
    bMode:setBMode,bCust:setBCust,c1Idx:setC1Idx,
    aStiff:setAStiff,ssMm:setSsMm,railType:setRailType,hRail:setHRail,
    railName:setRailName,kRail:setKRail,useEccentricity:setUseEccentricity,
    l1Bot:setL1Bot,
  };

  const applyInputs=(inp)=>{
    if(!inp)return;
    Object.entries(inputSetters).forEach(([k,fn])=>{
      if(inp[k]!==undefined)fn(inp[k]);
    });
  };

  const [showProjectMenu,setShowProjectMenu]=useState(false);
  const fileInputRef=useRef(null);

  const handleSaveProject=()=>{
    const projectData={version:"3.0",savedAt:new Date().toISOString(),inputs:snapshotInputs()};
    const profilLabel=secMode==="rolled"?profName.replace(/\s+/g,''):"Spawany";
    const dateStr=new Date().toISOString().slice(0,10);
    const blob=new Blob([JSON.stringify(projectData,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`projekt-BP-${profilLabel}-${dateStr}.json`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowProjectMenu(false);
  };

  const handleLoadProjectClick=()=>{
    setShowProjectMenu(false);
    fileInputRef.current?.click();
  };

  const handleLoadProjectFile=(e)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      try{
        const data=JSON.parse(ev.target.result);
        const inp=data.inputs||{};
        applyInputs(inp);
        const profDesc=(inp.secMode??secMode)==="welded"?"Spawany":(inp.profName??profName);
        const lVal=inp.l??l;
        showToast(`✓ Projekt wczytany: ${profDesc}, l=${fmt(lVal,1)} m`);
      }catch(err){
        showToast("✗ Błąd wczytywania pliku projektu");
      }
    };
    reader.readAsText(file);
    e.target.value="";
  };

  // ── Dobór optymalnego profilu ──────────────────────────────────────────────
  const [showPicker,setShowPicker]=useState(false);
  const [profSearching,setProfSearching]=useState(false);
  const [pickerResults,setPickerResults]=useState([]);

  const handlePickProfile=()=>{
    if(secMode!=="rolled")return;
    setProfSearching(true);
    setTimeout(()=>{
      const results=[];
      for(const fam of Object.keys(PROFILES)){
        for(const name of Object.keys(PROFILES[fam])){
          const p=PROFILES[fam][name];
          const s=computeSection("rolled",p,{});
          const chk=computeChecks(s,paramsForChecks);
          const etaPasy=Math.max(chk.vmActive?chk.etaTopVM:chk.etaTop,chk.etaBot);
          const etaDeflMax=Math.max(chk.etaDefl,chk.etaDeflY);
          results.push({fam,name,A:p.A,Wy:p.Wy,etaPasy,etaLTB:chk.ltb?.etaLT??0,
            etaV:chk.etaV,etaLoc:chk.etaLoc,etaDefl:etaDeflMax,etaMax:chk.maxEta,
            pass:chk.maxEta<=1.0});
        }
      }
      results.sort((a,b)=>{
        if(a.pass!==b.pass)return a.pass?-1:1;
        return a.pass?a.A-b.A:a.etaMax-b.etaMax;
      });
      setPickerResults(results);
      setProfSearching(false);
      setShowPicker(true);
    },0);
  };

  const applyPickedProfile=(r)=>{
    setProfFam(r.fam);setProfName(r.name);setShowPicker(false);
  };

  // ── Tabela porównawcza wariantów ──────────────────────────────────────────
  const [variants,setVariants]=useState([]);
  const [showCompare,setShowCompare]=useState(false);

  const addVariant=()=>{
    if(variants.length>=6){showToast("Maksymalnie 6 wariantów — usuń jeden, aby dodać kolejny.");return;}
    const massKg=sec.A_mm2/1000*l*rhoSteel/1000;
    setVariants(vs=>[...vs,{
      id:Date.now()+Math.random(),
      label:secMode==="rolled"?profName:"Spawany",
      steel,l,
      etaTop:R.vmActive?R.etaTopVM:R.etaTop,
      etaLTB:R.ltb?.etaLT??0,
      etaV:R.etaV,etaLoc:R.etaLoc,
      etaDeflZ:R.etaDefl,etaDeflY:R.etaDeflY,
      etaMax:R.maxEta,massKg,
      MyEd:R.MyEd,MzEd:R.MzEd,
      inputs:snapshotInputs(),
    }]);
  };

  const removeVariant=(id)=>setVariants(vs=>vs.filter(v=>v.id!==id));

  const applyVariant=(v)=>{
    applyInputs(v.inputs);
    setShowCompare(false);
  };

  const handleCopyCompareTable=async()=>{
    const rows=[
      ["Parametr",...variants.map(v=>v.label)],
      ["Stal",...variants.map(v=>v.steel)],
      ["l [m]",...variants.map(v=>fmt(v.l,2))],
      ["η pas górny",...variants.map(v=>fmt(v.etaTop,3))],
      ["η LTB",...variants.map(v=>fmt(v.etaLTB,3))],
      ["η ścinanie",...variants.map(v=>fmt(v.etaV,3))],
      ["η docisk",...variants.map(v=>fmt(v.etaLoc,3))],
      ["η ugięcie pionowe",...variants.map(v=>fmt(v.etaDeflZ,3))],
      ["η ugięcie poziome",...variants.map(v=>fmt(v.etaDeflY,3))],
      ["η max",...variants.map(v=>fmt(v.etaMax,3))],
      ["Masa [kg]",...variants.map(v=>fmt(v.massKg,0))],
      ["My,Ed [kNm]",...variants.map(v=>fmt(v.MyEd,1))],
      ["Mz,Ed [kNm]",...variants.map(v=>fmt(v.MzEd,1))],
    ];
    const tsv=rows.map(r=>r.join("\t")).join("\n");
    try{await navigator.clipboard.writeText(tsv);showToast("✓ Tabela skopiowana (TSV) — wklej do Excela");}
    catch{showToast("✗ Nie udało się skopiować do schowka");}
  };

  // ── Eksport reakcji podporowych ────────────────────────────────────────────
  const handleExportReactions=async()=>{
    const n1=(x)=>Number(x).toFixed(1);
    const csv=`Reakcja;Obliczeniowa [kN];Charakterystyczna [kN];Uwaga\r\n`+
      `R_pionowa_max;${n1(R.RAmax_d)};${n1(R.RAmax_c)};ULS / SLS\r\n`+
      `R_pionowa_min;${n1(R.RAmin_d)};${n1(R.RAmin_c)};suwnica bez ładunku\r\n`+
      `R_pozioma_H_T;${n1(R.RHmax_d)};${n1(R.RHmax_c)};poprzeczna (ukosowanie/napęd)\r\n`+
      `R_pozioma_H_L;${n1(R.RL_d)};${n1(R.RL_c)};podłużna (hamowanie)\r\n`+
      (useHext&&hExtType!=="moment"?`R_pozioma_H_ext;${n1(R.RHext_d)};${n1(R.RHext_c)};zewnętrzna (wiatr/hamulce/sejsmika)\r\n`:'');
    try{
      await navigator.clipboard.writeText(csv);
      showToast("✓ Reakcje skopiowane do schowka");
    }catch{
      const blob=new Blob(["﻿"+csv],{type:"text/csv;charset=utf-8;"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;a.download="reakcje-podporowe.csv";
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("✓ Pobrano plik reakcje-podporowe.csv");
    }
  };

  return(
    <div className="min-h-screen bg-stone-100 text-stone-800" style={{fontFamily:"'Inter',ui-sans-serif,system-ui"}}>

      {/* ── Nakładka raportu ── */}
      {showReport&&(
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.65)',display:'flex',flexDirection:'column',padding:'12px'}}>
          <div style={{background:'#fff',borderRadius:'6px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
            {/* Pasek narzędziowy */}
            <div style={{padding:'8px 12px',background:'#1a1a1a',display:'flex',gap:'8px',alignItems:'center',borderRadius:'6px 6px 0 0'}}>
              <button onClick={doPrint}
                style={{background:'#e07000',color:'#fff',border:'none',padding:'8px 20px',borderRadius:'4px',cursor:'pointer',fontSize:'13px',fontWeight:'bold'}}>
                🖨️ Drukuj / Zapisz jako PDF
              </button>
              <button onClick={()=>setShowReport(false)}
                style={{background:'#444',color:'#fff',border:'none',padding:'8px 16px',borderRadius:'4px',cursor:'pointer',fontSize:'13px'}}>
                ✕ Zamknij
              </button>
              <span style={{color:'#aaa',fontSize:'12px',marginLeft:'6px'}}>
                W oknie drukowania wybierz „Zapisz jako PDF" → ustawienia: A4, marginesy normalne
              </span>
            </div>
            {/* Podgląd raportu w iframe */}
            <iframe
              id="__rptFrame"
              srcDoc={reportHtml}
              style={{flex:1,border:'none',width:'100%'}}
              title="Podgląd raportu"
            />
          </div>
        </div>
      )}

      {/* ── Nakładka doboru profilu ── */}
      {showPicker&&(
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.65)',display:'flex',flexDirection:'column',padding:'12px'}}>
          <div style={{background:'#fff',borderRadius:'6px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
            <div style={{padding:'8px 12px',background:'#1a1a1a',display:'flex',gap:'8px',alignItems:'center',borderRadius:'6px 6px 0 0'}}>
              <span style={{color:'#fff',fontSize:'13px',fontWeight:'bold'}}>🔍 Dobór optymalnego profilu</span>
              <span style={{color:'#aaa',fontSize:'12px',marginLeft:'8px'}}>
                {pickerResults.filter(r=>r.pass).length} / {pickerResults.length} profili spełnia warunki (η_max ≤ 1,0)
              </span>
              <button onClick={()=>setShowPicker(false)}
                style={{marginLeft:'auto',background:'#444',color:'#fff',border:'none',padding:'8px 16px',borderRadius:'4px',cursor:'pointer',fontSize:'13px'}}>
                ✕ Zamknij
              </button>
            </div>
            <div className="overflow-auto p-3 bg-stone-50">
              <table className="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-stone-200 text-stone-700">
                    {["Profil","A [cm²]","Wy [cm³]","η pasy","η LTB","η V","η docisk","η ugięcie","η max","Wynik"].map(h=>(
                      <th key={h} className="border border-stone-300 px-2 py-1 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pickerResults.map(r=>{
                    const isCurrent=secMode==="rolled"&&r.fam===profFam&&r.name===profName;
                    const barColor=r.etaMax<=1.0?(r.etaMax>0.9?"bg-amber-500":"bg-emerald-600"):"bg-red-600";
                    return(
                      <tr key={`${r.fam}-${r.name}`} onClick={()=>applyPickedProfile(r)}
                        className={`cursor-pointer hover:bg-amber-50 ${isCurrent?"bg-amber-100 font-bold":"bg-white"}`}>
                        <td className="border border-stone-200 px-2 py-1">{r.name}</td>
                        <td className="border border-stone-200 px-2 py-1 text-right">{fmt(r.A,1)}</td>
                        <td className="border border-stone-200 px-2 py-1 text-right">{fmt(r.Wy,0)}</td>
                        <td className="border border-stone-200 px-2 py-1 text-right">{fmt(r.etaPasy,3)}</td>
                        <td className="border border-stone-200 px-2 py-1 text-right">{fmt(r.etaLTB,3)}</td>
                        <td className="border border-stone-200 px-2 py-1 text-right">{fmt(r.etaV,3)}</td>
                        <td className="border border-stone-200 px-2 py-1 text-right">{fmt(r.etaLoc,3)}</td>
                        <td className="border border-stone-200 px-2 py-1 text-right">{fmt(r.etaDefl,3)}</td>
                        <td className="border border-stone-200 px-2 py-1">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span>{fmt(r.etaMax,3)}</span>
                            <span className="h-1.5 w-12 bg-stone-200 rounded-full overflow-hidden inline-block">
                              <span className={`h-full block ${barColor}`} style={{width:`${Math.min(r.etaMax*100,100)}%`}}/>
                            </span>
                          </div>
                        </td>
                        <td className={`border border-stone-200 px-2 py-1 text-center font-sans font-bold ${r.pass?"text-emerald-700":"text-red-700"}`}>
                          {r.pass?"✓ OK":"✗ NIE"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Nakładka porównania wariantów ── */}
      {showCompare&&(
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.65)',display:'flex',flexDirection:'column',padding:'12px'}}>
          <div style={{background:'#fff',borderRadius:'6px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
            <div style={{padding:'8px 12px',background:'#1a1a1a',display:'flex',gap:'8px',alignItems:'center',borderRadius:'6px 6px 0 0'}}>
              <span style={{color:'#fff',fontSize:'13px',fontWeight:'bold'}}>⚖ Porównanie wariantów</span>
              <button onClick={handleCopyCompareTable} disabled={variants.length===0}
                style={{background:variants.length===0?'#666':'#e07000',color:'#fff',border:'none',padding:'8px 16px',borderRadius:'4px',cursor:variants.length===0?'default':'pointer',fontSize:'13px',fontWeight:'bold'}}>
                📋 Kopiuj tabelę
              </button>
              <button onClick={()=>setShowCompare(false)}
                style={{marginLeft:'auto',background:'#444',color:'#fff',border:'none',padding:'8px 16px',borderRadius:'4px',cursor:'pointer',fontSize:'13px'}}>
                ✕ Zamknij
              </button>
            </div>
            <div className="overflow-auto p-3 bg-stone-50">
              {variants.length===0
                ? <p className="text-sm text-stone-500 p-4">Brak zapisanych wariantów. Użyj przycisku „+ Dodaj do porównania" w nagłówku.</p>
                : <table className="text-xs font-mono border-collapse">
                    <tbody>
                      <tr className="bg-stone-200 text-stone-700">
                        <th className="border border-stone-300 px-2 py-1 text-left sticky left-0 bg-stone-200 font-sans">Wariant</th>
                        {variants.map(v=>(
                          <th key={v.id} className="border border-stone-300 px-2 py-1">
                            <div className="flex flex-col items-center gap-1 font-sans">
                              <span>{v.label}</span>
                              <div className="flex gap-1">
                                <button onClick={()=>applyVariant(v)}
                                  className="px-1.5 py-0.5 text-[10px] rounded-sm bg-amber-700 text-white">Zastosuj</button>
                                <button onClick={()=>removeVariant(v.id)}
                                  className="px-1.5 py-0.5 text-[10px] rounded-sm bg-red-700 text-white">🗑 Usuń</button>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                      {[
                        ["Stal",v=>v.steel],
                        ["l [m]",v=>fmt(v.l,2)],
                        ["η pas górny",v=>fmt(v.etaTop,3)],
                        ["η LTB",v=>fmt(v.etaLTB,3)],
                        ["η ścinanie",v=>fmt(v.etaV,3)],
                        ["η docisk",v=>fmt(v.etaLoc,3)],
                        ["η ugięcie pionowe",v=>fmt(v.etaDeflZ,3)],
                        ["η ugięcie poziome",v=>fmt(v.etaDeflY,3)],
                        ["Masa [kg]",v=>fmt(v.massKg,0)],
                        ["My,Ed [kNm]",v=>fmt(v.MyEd,1)],
                        ["Mz,Ed [kNm]",v=>fmt(v.MzEd,1)],
                      ].map(([label,get])=>(
                        <tr key={label}>
                          <td className="border border-stone-200 px-2 py-1 font-sans sticky left-0 bg-stone-50 font-semibold text-stone-600">{label}</td>
                          {variants.map(v=>(
                            <td key={v.id} className="border border-stone-200 px-2 py-1 text-right">{get(v)}</td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td className="border border-stone-200 px-2 py-1 font-sans sticky left-0 bg-stone-50 font-bold text-stone-700">η max</td>
                        {variants.map(v=>(
                          <td key={v.id} className={`border border-stone-200 px-2 py-1 text-right font-bold ${v.etaMax<=1.0?"bg-emerald-100 text-emerald-800":"bg-red-100 text-red-800"}`}>
                            {fmt(v.etaMax,3)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast&&(
        <div style={{position:'fixed',bottom:20,right:20,zIndex:10000,background:'#1a1a1a',color:'#fff',
          padding:'10px 18px',borderRadius:'6px',fontSize:'13px',boxShadow:'0 4px 16px rgba(0,0,0,0.35)'}}>
          {toast}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".json" style={{display:'none'}}
        onChange={handleLoadProjectFile}/>

      <header className="border-b-2 border-stone-800 bg-stone-900 text-stone-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Belka podsuwnicowa — Arkusz wymiarowania</h1>
            <p className="text-[11px] text-stone-400">PN-EN 1991-3 · PN-EN 1993-6 · EC3-1-1 §6.3.2 · v3.0</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handlePickProfile} disabled={secMode!=="rolled"}
              title={secMode!=="rolled"?"Dobór działa wyłącznie w trybie profilu walcowanego":""}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-sm border transition-colors
                ${secMode!=="rolled"?"border-stone-600 bg-stone-700 text-stone-400 cursor-not-allowed":"border-stone-400 bg-stone-100 hover:bg-white text-stone-800"}`}>
              {profSearching?"⏳ Szukam...":"🔍 Dobierz profil"}
            </button>
            <button onClick={addVariant}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-sm border border-stone-400 bg-stone-100 hover:bg-white text-stone-800 transition-colors">
              + Dodaj do porównania
            </button>
            <button onClick={()=>setShowCompare(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-sm border border-stone-400 bg-stone-100 hover:bg-white text-stone-800 transition-colors">
              ⚖ Porównaj warianty{variants.length>0?` (${variants.length})`:""}
            </button>
            <div className="relative">
              <button onClick={()=>setShowProjectMenu(v=>!v)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-sm border border-stone-400 bg-stone-100 hover:bg-white text-stone-800 transition-colors">
                💾 Projekt ▾
              </button>
              {showProjectMenu&&(
                <div className="absolute right-0 mt-1 w-56 bg-white border border-stone-300 rounded-sm shadow-lg z-50 text-stone-800">
                  <button onClick={handleSaveProject}
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-amber-50">Zapisz projekt (.json)</button>
                  <button onClick={handleLoadProjectClick}
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-amber-50 border-t border-stone-200">Wczytaj projekt (.json)</button>
                </div>
              )}
            </div>
            <button onClick={handleReport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-sm border border-amber-500 bg-amber-600 hover:bg-amber-500 text-white transition-colors">
              📄 Generuj raport PDF/DOC
            </button>
            <div className={`px-4 py-2 rounded-sm text-sm font-bold font-mono ${ok?"bg-emerald-700":"bg-red-700"} text-white`}>
              η max={fmt(R.maxEta,3)}&nbsp;{ok?"✓ OK":"✗ PRZEKROCZONA"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 grid lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* 1. Przekrój */}
          <Card title="Przekrój poprzeczny belki" no="1">
            <Span>
              <div className="flex gap-2">
                {[["rolled","Profil walcowany"],["welded","Spawany — własny"]].map(([m,lab])=>(
                  <button key={m} onClick={()=>setSecMode(m)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-sm border transition-colors
                      ${secMode===m?"bg-amber-700 border-amber-700 text-white":"bg-white border-stone-300 text-stone-600 hover:border-amber-700"}`}>
                    {lab}</button>
                ))}
              </div>
            </Span>
            {secMode==="rolled"&&<>
              <Sel label="Rodzina" value={profFam}
                onChange={v=>{setProfFam(v);setProfName(Object.keys(PROFILES[v])[0]);}}
                options={Object.keys(PROFILES).map(v=>({v,l:v}))}/>
              <Sel label="Profil" value={profName} onChange={setProfName}
                options={Object.keys(PROFILES[profFam]||{}).map(v=>({v,l:v}))}/>
              {profile&&<Span>
                <div className="text-xs font-mono text-stone-600 bg-white border border-stone-200 rounded-sm p-2 grid grid-cols-3 gap-x-3 gap-y-0.5">
                  <span>h={profile.h}mm</span><span>b={profile.b}mm</span><span>tw={profile.tw}mm</span>
                  <span>tf={profile.tf}mm</span><span>A={profile.A}cm²</span><span>Iy={profile.Iy}cm⁴</span>
                  <span>Iz={profile.Iz}cm⁴</span><span>It={profile.It}cm⁴</span>
                  <span>Iw={fmt(profile.Iw/1000,0)}×10³cm⁶</span>
                </div>
              </Span>}
            </>}
            {secMode==="welded"&&<>
              <Field label="Pas górny b_f1" unit="mm" value={bf1} onChange={setB1} step="1"/>
              <Field label="Pas górny t_f1" unit="mm" value={tf1} onChange={setT1} step="1"/>
              <Field label="Pas dolny b_f2"  unit="mm" value={bf2} onChange={setB2} step="1"/>
              <Field label="Pas dolny t_f2"  unit="mm" value={tf2} onChange={setT2} step="1"/>
              <Field label="Środnik h_w"     unit="mm" value={hw}  onChange={setHw} step="1"/>
              <Field label="Środnik t_w"     unit="mm" value={tw}  onChange={setTw} step="0.5"/>
            </>}
          </Card>
          {/* 2. Suwnica */}
          <Card title="Dane suwnicy" no="2">
            <Field label="Ciężar własny Q_c" unit="kN" value={Qc} onChange={setQc}/>
            <Field label="Udźwig Q_h" unit="kN" value={Qh} onChange={setQh}/>
            <Field label="Rozpiętość mostu L" unit="m" value={Lc} onChange={setLc}/>
            <Field label="Rozstaw kół a" unit="m" value={ac} onChange={setAc}/>
            <Field label="Liczba kół / tor n" unit="-" value={nW} onChange={setNw} step="1"/>
            <Field label="e_min (hak–oś toru)" unit="m" value={emin} onChange={setEmin}/>
            <Field label="Prędkość podnoszenia v_h" unit="m/s" value={vh} onChange={setVh}/>
            <Sel label="Klasa podnoszenia" value={hcCl} onChange={setHcCl}
              options={Object.keys(HC).map(v=>({v,l:`${v} — ${HC[v].desc}`}))}/>
            <Field label="Wsp. tarcia koła μ" unit="-" value={mu} onChange={setMu}/>
            <Field label="Liczba torów n_r" unit="-" value={nr} onChange={setNr} step="1"/>
          </Card>
          {/* 3. Belka */}
          <Card title="Belka — dane, ciężar własny" no="3">
            <Field label="Rozpiętość l" unit="m" value={l} onChange={setL}/>
            <Sel label="Gatunek stali" value={steel} onChange={setSt}
              options={Object.keys(STEEL).map(v=>({v,l:`${v}  (fy=${STEEL[v]} MPa)`}))}/>
            <Span>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] uppercase tracking-wide text-stone-500 font-semibold">Ciężar własny belki</span>
                {[["auto","Auto (z A·ρ·g)"],["manual","Ręcznie"]].map(([m,lab])=>(
                  <Btn key={m} active={qAutoMode===(m==="auto")} onClick={()=>setQAutoMode(m==="auto")}>{lab}</Btn>
                ))}
              </div>
              {qAutoMode
                ? <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] uppercase text-stone-500 font-semibold">Belka (auto)</p>
                      <p className="text-sm font-mono text-stone-700">{fmt(q_beam_auto,3)} kN/m</p>
                    </div>
                    <Field label="Szyna + mocowanie" unit="kN/m" value={qRail} onChange={setQRail}/>
                    <div className="col-span-2">
                      <span className="text-[11px] uppercase text-stone-500 font-semibold">q łącznie </span>
                      <span className="font-mono font-bold text-amber-700">{fmt(q_total,3)} kN/m</span>
                    </div>
                  </div>
                : <Field label="q belka + szyna" unit="kN/m" value={qManual} onChange={setQManual}/>}
            </Span>
          </Card>
          {/* 4. Żebra środnika i docisk koła */}
          <Card title="Żebra środnika i docisk koła" no="4">
            <Field label="Rozstaw żeber poprzecznych a_stiff" unit="m" value={aStiff} onChange={setAStiff}
              hint="Dla belki bez żeber: wpisz rozpiętość l. Wpływa na kF i ly (EC3-1-5 §6.4)."/>
            <Field label="Sztywna długość docisku s_s" unit="mm" value={ssMm} onChange={setSsMm}
              hint="Kontakt koło–szyna bez podkładki: ss = 0. Z podkładką: ss ≈ h_szyny + 2·tf."/>
          </Card>
          {/* 5. Zewnętrzna H */}
          <Card title="Zewnętrzna siła pozioma" no="5">
            <Span>
              <div className="flex items-center gap-2 mb-2">
                <Btn active={useHext} onClick={()=>setUseHext(!useHext)}>
                  {useHext?"✓ Aktywna":"Włącz"}</Btn>
                <span className="text-xs text-stone-500">wiatr, hamulce, sejsmika itp.</span>
              </div>
              {useHext&&<>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[{v:"conc",l:"Skupiona [kN]"},{v:"udl",l:"Równomierne [kN/m]"},{v:"moment",l:"Moment [kNm]"}]
                    .map(o=><Btn key={o.v} active={hExtType===o.v} onClick={()=>setHExtType(o.v)}>{o.l}</Btn>)}
                </div>
                {hExtType==="conc"&&<Field label="H_ext (char.)" unit="kN" value={hExtF} onChange={setHExtF}
                  hint={`Mz,ext=H·γQ·l/4 = ${fmt(R.MzExt,1)} kNm`}/>}
                {hExtType==="udl"&&<Field label="q_h,ext (char.)" unit="kN/m" value={hExtQ} onChange={setHExtQ}
                  hint={`Mz,ext=q·γQ·l²/8 = ${fmt(R.MzExt,1)} kNm`}/>}
                {hExtType==="moment"&&<Field label="Mz,ext (oblicz.)" unit="kNm" value={hExtM} onChange={setHExtM}
                  hint="Bezpośrednio wartość obliczeniowa"/>}
                <div className="text-xs font-mono bg-white border border-stone-200 rounded-sm p-1.5 text-stone-700 mt-1">
                  Mz,suwnica={fmt(R.MzCrane,1)} + Mz,zewn.={fmt(R.MzExt,1)} → <b>Mz,Ed={fmt(R.MzEd,1)} kNm</b>
                </div>
              </>}
            </Span>
          </Card>
          {/* 6. Typ szyny / poziom obciążenia */}
          <Card title="Typ szyny / poziom obciążenia" no="6">
            <Span>
              <div className="flex gap-2 mb-2">
                {[["welded","Szyna spawana bezpośrednio"],["pad","Szyna na podkładce elastomerowej"]].map(([m,lab])=>(
                  <Btn key={m} active={railType===m} onClick={()=>setRailType(m)}>{lab}</Btn>
                ))}
              </div>
              {railType==="welded"
                ? <p className="text-[10px] text-stone-500">Szyna spawana: EN 1993-6 §5.4.1 zezwala przyjąć
                    punkt przyłożenia siły na poziomie środka ścinania → z_g = 0, brak redukcji Mcr.</p>
                : <p className="text-[10px] text-amber-700">Podkładka elastomerowa: siła działa
                    destabilizująco (z_g = h/2 + h_rail). Mcr zostanie zredukowany.</p>}
            </Span>
            <Span><Sel label="Typ szyny" value={railName} onChange={handleRailChange}
              options={Object.keys(RAILS).map(v=>({v,l:v}))}/></Span>
            <Field label="Szerokość główki szyny k" unit="mm" value={kRail} onChange={setKRail}
              disabled={railName!=="Własna"}/>
            <Field label="Wysokość szyny h_rail" unit="mm" value={hRail} onChange={setHRail}
              disabled={railName!=="Własna"}
              hint="Mierzona od górnej powierzchni pasa górnego do wierzchu szyny."/>
            <Span>
              <Btn active={useEccentricity} onClick={()=>setUseEccentricity(!useEccentricity)}>
                {useEccentricity?"✓ Mimośród koła e_y = k/4":"Mimośród koła pominięty"}
              </Btn>
              <p className="text-[10px] text-stone-500 mt-1">
                EN 1993-6 §9.3.3 — wymagane dla klasy uszkodzeniowej S3 i wyższej.
                e_y = {fmt(kRail/4,1)} mm.
              </p>
            </Span>
          </Card>
          {/* 7. LTB */}
          <Card title="Zwichrzenie — parametry" no="7">
            <Span>
              <p className="text-[11px] uppercase tracking-wide text-stone-500 font-semibold mb-1">Stężenie pasa górnego</p>
              <div className="flex flex-wrap gap-1.5">
                {[{v:"none",l:"Bez stężeń"},{v:"half",l:"Co l/2"},{v:"third",l:"Co l/3"},
                  {v:"quarter",l:"Co l/4"},{v:"custom",l:"Własny"}].map(o=>(
                  <Btn key={o.v} active={bMode===o.v} onClick={()=>setBMode(o.v)}>{o.l}</Btn>
                ))}
              </div>
              <p className="text-xs font-mono text-stone-600 mt-1.5">L_cr=<b>{fmt(Lcr_m,2)}</b> m
                {bMode==="none"&&<span className="text-amber-700 ml-1">⚠ pełna rozpiętość</span>}
              </p>
            </Span>
            {bMode==="custom"&&<Span><Field label="Rozstaw stężeń" unit="m" value={bCust} onChange={setBCust}/></Span>}
            <Span>
              <Sel label="Rozkład momentów — C₁  (EC3-1-1 Zał. B)" wide
                value={String(c1Idx)} onChange={v=>setC1Idx(Number(v))}
                options={C1_CASES.map((c,i)=>({v:String(i),l:`C₁=${c.C1.toFixed(2)} — ${c.label}`}))}/>
            </Span>
            <Span>
              <Field label="Rozstaw stężeń bocznych pasa dolnego l₁" unit="m" value={l1Bot} onChange={setL1Bot}
                hint="Ochrona przed nadmiernymi drganiami: l₁/iz ≤ 250. Dla pasa bez stężeń: wpisz rozpiętość l."/>
            </Span>
          </Card>
        </div>

        {/* ════ PRAWA ════ */}
        <div className="space-y-4">
          <Card title="Współczynniki dynamiczne i reakcje kół" no="8">
            <Span>
              <div className="text-xs font-mono text-stone-700 space-y-1">
                <div>φ₁={fmt(R.phi1,2)} · φ₂={fmt(R.phi2,3)} · φ₅=1,05</div>
                <div>H_L={fmt(R.HL,2)} kN · H_T={fmt(R.HT,2)} kN</div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[["Bez ładunku (min)",`Qr,min=${fmt(R.Qrmin,1)} / ${fmt(R.Qrmin_c,1)} kN`],
                    ["Z ładunkiem (max)",`Qr,max=${fmt(R.Qrmax,1)} / ${fmt(R.Qrmax_c,1)} kN`]].map(([t,v])=>(
                    <div key={t} className="bg-white border border-stone-200 rounded-sm p-1.5 text-[11px]">
                      <div className="text-stone-400 uppercase text-[10px] mb-0.5">{t}</div>{v}
                    </div>
                  ))}
                </div>
              </div>
            </Span>
          </Card>
          <Card title="Siły przekrojowe (ULS)" no="9">
            <Span>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono text-stone-700">
                {[["My,Ed",R.MyEd,"kNm"],["Mz,Ed",R.MzEd,"kNm"],["VEd",R.VEd,"kN"]].map(([n,v,u])=>(
                  <div key={n} className="bg-white border border-stone-200 rounded-sm p-1.5">
                    <div className="text-stone-400 text-[10px] uppercase mb-0.5">{n}</div>
                    <b>{fmt(v,1)}</b> {u}
                  </div>
                ))}
              </div>
            </Span>
          </Card>
          <Card title="Reakcje podporowe" no="10">
            <Span>
              <table className="w-full text-xs font-mono text-stone-700 border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase text-stone-400 font-sans">
                    <th className="text-left font-semibold py-0.5">Reakcja</th>
                    <th className="text-right font-semibold py-0.5">Obliczeniowa [kN]</th>
                    <th className="text-right font-semibold py-0.5">Charakterystyczna [kN]</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["R_pionowa,max",R.RAmax_d,R.RAmax_c],
                    ["R_pionowa,min",R.RAmin_d,R.RAmin_c],
                    ["R_pozioma H_T",R.RHmax_d,R.RHmax_c],
                    ["R_podłużna H_L",R.RL_d,R.RL_c],
                    ...(useHext&&hExtType!=="moment"?[["R_pozioma zewn. (H_ext)",R.RHext_d,R.RHext_c]]:[]),
                  ].map(([lb,d,c])=>(
                    <tr key={lb} className="border-t border-stone-200">
                      <td className="py-1">{lb}</td>
                      <td className="py-1 text-right">{fmt(d,1)}</td>
                      <td className="py-1 text-right">{fmt(c,1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {useHext&&hExtType==="moment"&&
                <p className="text-[10px] text-amber-700 italic mt-1">
                  ⚠ Mz,ext podany bezpośrednio jako moment — bez zdefiniowanego punktu przyłożenia siły
                  nie da się wyznaczyć reakcji ani wkładu do ugięcia poziomego δy.
                </p>}
              <button onClick={handleExportReactions}
                className="mt-2 px-2.5 py-1 text-xs rounded-sm border font-medium bg-white border-stone-300 text-stone-600 hover:border-amber-700 transition-colors">
                📋 Eksportuj reakcje
              </button>
            </Span>
          </Card>
          <Card title="Sprawdzenia SGN" no="11">
            <Span>
              <UtilBar label={`Pas górny — zginanie My+Mz${R.torsionOK?"+σ_ω (skręcanie)":""}  [Klasa ${R.cls.secClass}, W_y,eff=${fmt(R.cls.Weff_mm3/1e3,0)}cm³]`}
                value={R.etaTop} formula={`σ=${fmt(R.sigma_top,1)}/${fmt(R.sigmaRd,0)} MPa`}/>
              <UtilBar label="Pas dolny — zginanie My"
                value={R.etaBot} formula={`σ=${fmt(R.sigma_bot,1)}/${fmt(R.sigmaRd,0)} MPa`}/>
              <UtilBar label={`Ścinanie (VEd/Vpl,Rd=${fmt(R.VEd/R.VplRd,3)})`}
                value={R.etaV} formula={`${fmt(R.VEd,1)}/${fmt(R.VplRd,1)} kN`}/>
              {R.vmActive&&<UtilBar label="⚠ V–M interakcja §6.2.8" value={R.etaTopVM} warn
                formula={`ρ=${fmt(R.rhoVM,3)}; σRd,red=${fmt(R.sigmaRd*(1-R.rhoVM),0)} MPa`}
                note="VEd > 0,5·Vpl,Rd — redukcja nośności na zginanie"/>}
              {!R.vmActive&&<div className="py-1 text-[10px] text-stone-400 font-mono">
                V–M: brak redukcji (VEd={fmt(R.VEd,1)} ≤ 0,5·Vpl,Rd={fmt(0.5*R.VplRd,1)} kN) ✓</div>}
              <UtilBar label="Środnik — docisk koła EC3-1-5"
                value={R.etaLoc} formula={`kF=${fmt(R.kFval,2)} | ly=${fmt(R.ly_web,0)}mm | λF=${fmt(R.lambdaF_web,3)} | χF=${fmt(R.chiF_web,3)} | Leff=${fmt(R.Leff_web,0)}mm | FRd=${fmt(R.FRd,1)} kN`}/>
            </Span>
          </Card>
          <Card title="Zwichrzenie PN-EN 1993-1-1 §6.3.2.2" no="12">
            <Span>
              {R.ltb?(<>
                <div className="text-xs font-mono text-stone-700 bg-white border border-stone-200 rounded-sm p-2 grid grid-cols-2 gap-x-3 gap-y-0.5 mb-2">
                  <span>Mcr={fmt(R.ltb.Mcr_kNm,1)} kNm</span><span>C₁={fmt(C1,2)} / Lcr={fmt(Lcr_m,2)} m</span>
                  <span>λ̄_LT={fmt(R.ltb.lambdaLT,3)}</span><span>χ_LT={fmt(R.ltb.chiLT,3)}</span>
                  <span>α_LT={fmt(R.ltb.alphaLT,2)} (krz.{R.ltb.curve})</span>
                  <span>{sec.isRolled?"walcowany":"spawany"} h/b={fmt(sec.h/sec.bf1,2)}</span>
                  <span>z_g = {railType==="pad"?fmt(R.ltb.z_g,0)+" mm (podkładka)":"0 mm (szyna spawana)"}</span>
                  <span className="font-semibold">Mb,Rd={fmt(R.ltb.MbRd_kNm,1)} kNm</span>
                </div>
                <UtilBar label="LTB — My/(χLT·MyRk/γM1) + Mz/(MzRk/γM1)"
                  value={R.ltb.etaLT}
                  formula={`${fmt(R.ltb.term_My,3)} + ${fmt(R.ltb.term_Mz,3)}`}
                  note={R.ltb.noLTB?"λ̄_LT≤0,2 — zwichrzenie pomijalne §6.3.2.2(4)":undefined}/>
                <div className="text-[10px] text-amber-700 italic mt-2 border-l-2 border-amber-400 pl-2 space-y-0.5">
                  <div>⚠ <b>Ograniczenia modelu LTB wg EN 1993-6:</b></div>
                  {R.torsionOK?(
                    <div>• Uwzględniono moment skręcający T_Ed i bimoment B_Ed wg EN 1993-6 §7.5
                      (tylko dla HEA/HEB). Nie uwzględniono naprężeń stycznych od skręcania
                      swobodnego (St. Venant) ani pełnej interakcji M-B wg EN 1993-6 §6.3.2.
                      Mcr wyznaczono bez redukcji od skręcania.</div>
                  ):(<>
                    <div>• Nie uwzględniono momentu skręcającego T_Ed = F_z·e_z + H_T·e_y
                      (moment zginający poziomy Mz ≠ moment skręcający T).</div>
                    <div>• Dla pełnej analizy wg EN 1993-6 §6.3.2 wymagany bimoment B_Ed
                      i weryfikacja naprężeń skręcania. Wynik η_LT może być
                      nieznacznie niekonserwatywny dla belek bez tężników hamownych.</div>
                  </>)}
                </div>
              </>):<p className="text-xs text-stone-400">Brak Mcr — sprawdź geometrię.</p>}
            </Span>
          </Card>
          <Card title="Skręcanie i bimoment (EN 1993-6 §7.5)" no="13">
            <Span>
              {R.torsionOK?(<>
                <div className="text-xs font-mono text-stone-700 bg-white border border-stone-200 rounded-sm p-2 grid grid-cols-2 gap-x-3 gap-y-0.5 mb-2">
                  <span>e_z = {fmt(R.tors.e_z,0)} mm</span>
                  <span>e_y = {fmt(R.tors.e_y,1)} mm {R.tors.e_y>0?"(k/4)":"(pominięty)"}</span>
                  <span>T_A (od H_T) = {fmt(R.tors.T_A_kNm,2)} kNm</span>
                  <span>T_B (od F_z·e_y) = {fmt(R.tors.T_B_kNm,2)} kNm</span>
                  <span>T_C (od H_ext, e_z jak H_T) = {fmt(R.tors.T_C_kNm,2)} kNm</span>
                  <span className="font-semibold">T_Ed = {fmt(R.tors.T_Ed_kNm,2)} kNm</span>
                  <span>k = {fmt(R.tors.k*1000,4)} ×10⁻³/mm</span>
                  <span>B_Ed = {fmt(R.tors.B_Ed_kNm2,1)} kNm²</span>
                  <span>ω_max = {fmt(R.tors.omega/100,1)} cm²</span>
                  <span className="font-semibold text-amber-700">σ_ω = {fmt(R.sigma_w,1)} MPa</span>
                </div>
                {useHext&&hExtType==="udl"&&(
                  <p className="text-[10px] text-amber-700 italic mb-2">
                    ⚠ Obciążenie „Równomierne” (q_h,ext) nie jest wliczone do T_Ed — siła rozłożona
                    wzdłuż belki daje moment skręcający zmienny na długości (jak siła poprzeczna),
                    niezgodny z uproszczonym modelem Własowa dla torsji skupionej w środku rozpiętości.
                    Wymaga osobnej analizy.
                  </p>
                )}
                {useHext&&hExtType==="moment"&&(
                  <p className="text-[10px] text-amber-700 italic mb-2">
                    ⚠ Mz,ext podany bezpośrednio jako moment — bez zdefiniowanego punktu przyłożenia
                    siły nie wlicza się do T_Ed.
                  </p>
                )}
                <div className="text-xs text-stone-600 bg-amber-50 border border-amber-200 rounded-sm p-2">
                  Rozkład naprężeń w pasie górnym:<br/>
                  <span className="font-mono">
                    σ_My = {fmt(R.sigma_My,1)} + σ_Mz = {fmt(R.sigma_Mz,1)} + σ_ω = {fmt(R.sigma_w,1)}
                    &nbsp;→&nbsp;<b>σ_x = {fmt(R.sigma_top,1)} MPa</b>
                  </span><br/>
                  <span className="text-amber-700">
                    Udział skręcania nieswobodnego: <b>{fmt(R.sigma_w_pct,1)}%</b>
                  </span>
                </div>
              </>):secMode==="welded"?(
                <div className="text-xs text-stone-600 bg-stone-100 border border-stone-300 rounded-sm p-3">
                  <b>Sprawdzenie bimomentu niedostępne dla przekroju spawanego.</b><br/><br/>
                  Dla przekroju o niesymetrycznych pasach środek ścinania nie pokrywa się
                  ze środkiem ciężkości. Wyznaczenie jego położenia oraz wycinkowego momentu
                  bezwładności I_w wymaga oddzielnego modułu obliczeniowego.<br/><br/>
                  Dla przekroju o równych pasach (b_f1 = b_f2, t_f1 = t_f2) można przyjąć
                  wyniki jak dla profilu walcowanego — zweryfikuj ręcznie lub w MES.
                </div>
              ):(
                <div className="text-xs text-stone-600 bg-stone-100 border border-stone-300 rounded-sm p-3">
                  <b>Sprawdzenie bimomentu niedostępne dla profili {profFam}.</b><br/><br/>
                  Moduł skręcania nieswobodnego zaimplementowano wyłącznie dla profili
                  <b> HEA i HEB</b> — dwuosiowo symetrycznych, gdzie środek ścinania pokrywa się
                  ze środkiem ciężkości, a I_t oraz I_w są stablicowane.<br/><br/>
                  Profile IPE/IPN mają wąskie pasy i niską sztywność wichrzeniową — efekty
                  skręcania mogą być znaczące. Zalecana weryfikacja w programie MES
                  (np. LTBeamN, ConSteel, Autodesk Robot — analiza 7-stopniowa swobody).
                </div>
              )}
            </Span>
          </Card>
          <Card title="SGU — ugięcia" no="14">
            <Span>
              <UtilBar label="Ugięcie pionowe δz (char., bez φ i γQ)"
                value={R.etaDefl}
                formula={`δz=${fmt(R.deflZ,1)} mm ≤ min(l/600,25mm)=${fmt(R.deflGr,1)} mm`}/>
              <UtilBar label={`Ugięcie poziome δy (H_T,char${useHext&&hExtType!=="moment"?" + H_ext,char":""}, bez φ₅ i γQ)`}
                value={R.etaDeflY}
                formula={`δy=${fmt(R.deflY_mm,1)} mm (H_T: ${fmt(R.deflY_HT*1000,1)} + H_ext: ${fmt(R.deflY_ext*1000,1)} mm) ≤ l/600=${fmt(R.deflYGr,1)} mm`}
                note={useHext&&hExtType==="moment"?"Mz,ext podany jako moment — bez punktu przyłożenia siły nie wlicza się do δy":undefined}/>
            </Span>
          </Card>
          <Card title="Klasyfikacja przekroju (EN 1993-1-1 Tab. 5.2)" no="15">
            <Span>
              <div className="text-xs font-mono text-stone-700 grid grid-cols-2 gap-x-4 gap-y-0.5">
                <span>ε = √(235/fy) = {fmt(R.cls.eps,3)}</span>
                <span>Klasa przekroju: <b className={R.cls.secClass<=2?"text-emerald-700":R.cls.secClass===3?"text-amber-700":"text-red-700"}>
                  {R.cls.secClass}</b>
                </span>
                <span>Pas górny: c/t = {fmt(R.cls.lamTop,1)} → Klasa {R.cls.classTop}</span>
                <span>Pas dolny: c/t = {fmt(R.cls.lamBot,1)} → Klasa {R.cls.classBot}</span>
                <span>Środnik: c/t = {fmt(R.cls.lamWeb,1)} → Klasa {R.cls.classWeb}</span>
                <span>W_y,eff = {fmt(R.cls.Weff_mm3/1e3,0)} cm³
                  ({R.cls.secClass<=2?"plastyczny":"sprężysty"})</span>
              </div>
              {R.cls.secClass === 4 && (
                <div className="text-[10px] text-red-700 font-bold mt-1">
                  ⚠ Klasa 4 — wymagany przekrój efektywny wg EN 1993-1-5.
                  Program nie wyznacza Aeff/Weff. Wyniki niezachowawcze.
                </div>
              )}
            </Span>
          </Card>
          <Card title="Pas dolny — ochrona przed drganiami" no="16">
            <Span>
              <UtilBar label="Smukłość pasa dolnego λ = l₁/iz ≤ 250 (lit. — belki podsuwnicowe)"
                value={R.etaVibBot}
                formula={`l₁=${fmt(l1Bot,2)} m, iz=${fmt(R.iz_bot_mm,1)} mm → λ=${fmt(R.lambdaBot,1)} ≤ ${R.lambdaBotLim}`}
                note="Warunek nienormowy (nie z EC3) — ogranicza podatność pasa dolnego na drgania od dynamicznych oddziaływań suwnicy, przy braku usztywnienia szyną jak pas górny."/>
            </Span>
          </Card>
          <Card title="Charakterystyki przekroju" no="17">
            <Span>
              <div className="text-xs font-mono text-stone-700 grid grid-cols-3 gap-x-3 gap-y-0.5">
                <span>A={fmt(sec.A_mm2/100,1)} cm²</span>
                <span>h={fmt(sec.h,0)} mm</span><span>h/b={fmt(sec.h/sec.bf1,2)}</span>
                <span>Iy={fmt(sec.Iy_mm4/1e4,0)} cm⁴</span>
                <span>Iz={fmt(sec.Iz_mm4/1e4,0)} cm⁴</span>
                <span>It={fmt(sec.It_mm4/1e4,1)} cm⁴</span>
                <span>Iw={fmt(sec.Iw_mm6/1e9,0)}×10³cm⁶</span>
                <span>Wy,top={fmt(sec.Wy_top_mm3/1e3,0)} cm³</span>
                <span>Wy,bot={fmt(sec.Wy_bot_mm3/1e3,0)} cm³</span>
                <span>Wz(pełny)={fmt(sec.Wz_mm3/1e3,1)} cm³</span>
                <span>Lcr={fmt(Lcr_m,2)} m</span><span>fy={fy} MPa</span>
              </div>
            </Span>
          </Card>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-8 pt-2 text-[11px] text-stone-400 leading-relaxed border-t border-stone-200 mt-2">
        <b>v3.0:</b> HEB 600 It=1080 ✓ · Mz przez pełny Wz ✓ · Iw tabelaryczne ✓ · V–M §6.2.8 ✓ · Ciężar auto ✓ · Raport HTML→PDF ✓ · My z formuły obwiedni (2 koła, pozycja ekstremalna).
      </footer>
    </div>
  );
}
