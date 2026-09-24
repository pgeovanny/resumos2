const SUPABASE_URL = "https://cceglrxtatwtdgdfhmgr.supabase.co";
const SUPABASE_KEY = "sb_publishable_4vQ9xxVoZ83a0NeBXZVivA_nFCn5IVH";

const DEMO_SOURCE = `[[H1_LEI]]
LEI Nº 9.784/1999
[[/H1_LEI]]

[[H2_DIVISAO]]
CONTROLE DOS ATOS ADMINISTRATIVOS
[[/H2_DIVISAO]]

[[TEXTO_LEGAL]]
Art. 54. O direito da Administração de anular os atos administrativos de que decorram efeitos favoráveis para os destinatários decai em [[CHAVE]]cinco anos[[/CHAVE]], contados da data em que foram praticados, salvo comprovada [[NEG]]má-fé[[/NEG]].
[[/TEXTO_LEGAL]]

[[PONTO_PROVA]]
TITULO=Prazo que muda o gabarito
TEXTO=Em atos favoráveis ao destinatário, o prazo decadencial é de cinco anos. A comprovada má-fé afasta a proteção temporal da regra.
[[/PONTO_PROVA]]

[[H3_SECAO]]
Anulação, revogação e convalidação
[[/H3_SECAO]]

[[ESQUEMA:MAPA_TATICO]]
TITULO=Três respostas possíveis da Administração
LAYOUT=CHUVEIRO
RAIZ=CONTROLE DOS ATOS ADMINISTRATIVOS
ITEM=Anulação|Retirada do ato em razão de ilegalidade.|REGRA
ITEM=Revogação|Retirada de ato válido por conveniência e oportunidade.|CONCEITO
ITEM=Convalidação|Correção do ato quando o vício admitir saneamento.|CONSEQUENCIA
[[/ESQUEMA]]

[[H3_SECAO]]
Regra e ressalva
[[/H3_SECAO]]

[[ESQUEMA:MAPA_TATICO]]
TITULO=Decadência do direito de anular
LAYOUT=CONTRASTE
RAIZ=ATO FAVORÁVEL AO DESTINATÁRIO
ITEM=REGRA|O direito de anular decai em cinco anos, contados da prática do ato.|REGRA
ITEM=EXCEÇÃO|A comprovada má-fé impede a incidência da proteção prevista na regra decadencial.|EXCECAO
[[/ESQUEMA]]

[[TABELA]]
TIPO=COMPARATIVA
TITULO=Anulação x revogação
COLUNAS=Critério|Anulação|Revogação
LINHA=Fundamento|Ilegalidade|Conveniência e oportunidade
LINHA=Objeto|Ato inválido|Ato válido
LINHA=Natureza do controle|Legalidade|Mérito administrativo
[[/TABELA]]

[[ATENCAO]]
TITULO=Não trate os institutos como sinônimos
TEXTO=Anulação e revogação partem de fundamentos distintos. A primeira se relaciona à legalidade; a segunda, ao mérito administrativo.
[[/ATENCAO]]
`;

const CLASS_OPTIONS = ["REGRA","CONCEITO","COMPETENCIA","ESTRUTURA","FINALIDADE","OBJETIVO","META","CRITERIO","APLICACAO","PROCESSO","TEORIA","CLASSIFICACAO","ROL","CONSEQUENCIA","EFEITO","EXCECAO","ESPECIAL","TEMPORAL","LIMITE","ALERTA","OBSERVACAO","ERRO","NEUTRO"];
const LAYOUT_OPTIONS = ["LATERAL","VERTICAL","CHUVEIRO","FLUXO","DECISAO","CONTRASTE"];
const SCHEME_TYPES = ["MAPA_TATICO","CONCEITO_CHAVES","FLUXO_HORIZONTAL","FLUXO_VERTICAL","ETAPAS_COM_FUNCAO","FLUXOGRAMA_DECISAO","FLUXO_RAMIFICADO","LINHA_DO_TEMPO","REGRA_EXCECOES","ESCADA","PRAZOS_ENCADEADOS","EQUACAO_VISUAL","ARVORE","RAMIFICACAO","LINHA_LATERAL","DIVERGENCIA","CONVERGENCIA","CICLO","CADEIA_NORMATIVA","CAMADAS","CONEXAO_ARTIGOS","REGRA_MEMBROS","LISTA_NUMERADA","PIRAMIDE","HIERARQUIA_ANINHADA","COMPARACAO_MULTIPLA","TAXONOMIA","CAMADAS_HORIZONTAIS"];

const state = {
  projectId: null,
  projectName: "Novo material",
  source: "",
  blocks: [],
  selectedId: null,
  dirty: false,
  zoom: 1,
  document: {
    title: "Lei nº 9.784/1999",
    subtitle: "Processo Administrativo Federal · Legislação Estratégica",
    edition: "Pós-edital 2026",
    brand: "BLACK BELT · LEGISLAÇÃO ESTRATÉGICA",
    meta: "Material de estudo · revisão orientada para prova",
    theme: "ponto",
    showCover: true,
    showHeader: true,
    economy: false
  }
};

const $ = (id) => document.getElementById(id);
const esc = (value="") => String(value)
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "b-"+Date.now()+"-"+Math.random().toString(36).slice(2));
const norm = (s="") => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().trim();
const debounce = (fn,ms=220)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}};

function toast(message, type="ok"){
  const el=$("toast");
  el.textContent=message;
  el.className="toast show"+(type==="error"?" error":"");
  clearTimeout(toast._t);
  toast._t=setTimeout(()=>el.className="toast",2200);
}

function markDirty(){
  state.dirty=true;
  $("saveStatus").textContent="alterações não salvas";
  $("saveStatusDot").className="status-dot dirty";
  persistLocal();
}
function markSaved(){
  state.dirty=false;
  $("saveStatus").textContent="salvo";
  $("saveStatusDot").className="status-dot saved";
  persistLocal();
}
const persistLocal = debounce(()=>{
  localStorage.setItem("resumo-studio-autobackup-v3", JSON.stringify({
    ...state,
    dirty:true
  }));
},250);

function formatInline(text=""){
  let h=esc(text);
  const rules=[
    [/\[\[NEG\]\]([\s\S]*?)\[\[\/NEG\]\]/gi,'<span class="inline-neg">$1</span>'],
    [/\[\[POSS\]\]([\s\S]*?)\[\[\/POSS\]\]/gi,'<span class="inline-poss">$1</span>'],
    [/\[\[CHAVE\]\]([\s\S]*?)\[\[\/CHAVE\]\]/gi,'<span class="inline-key">$1</span>'],
    [/\[\[REM\]\]([\s\S]*?)\[\[\/REM\]\]/gi,'<span class="inline-rem">$1</span>'],
    [/\[\[COBRADO\]\]([\s\S]*?)\[\[\/COBRADO\]\]/gi,'<span class="inline-cobrado">$1</span>'],
    [/\*\*(.+?)\*\*/g,'<strong>$1</strong>'],
    [/==(.+?)==/g,'<span class="inline-key">$1</span>']
  ];
  rules.forEach(([re,r])=>h=h.replace(re,r));
  h=h.replace(/^(Art\.?\s*\d+[º°]?(?:-[A-Z])?\.?)/i,'<span class="article-prefix">$1</span>');
  return h;
}

function readFields(lines){
  const o={};
  lines.forEach(line=>{
    const p=line.indexOf("=");
    if(p<1)return;
    const k=norm(line.slice(0,p)),v=line.slice(p+1).trim();
    (o[k]||(o[k]=[])).push(v);
  });
  return o;
}

function paragraphsFrom(lines){
  const out=[];let p=[];
  const flush=()=>{const s=p.join(" ").replace(/\s+/g," ").trim();if(s)out.push(s);p=[]};
  lines.forEach(line=>{if(!line.trim())flush();else p.push(line.trim())});
  flush();return out;
}

function parseAgentOutput(raw){
  const lines=String(raw||"").replace(/\r\n/g,"\n").split("\n");
  const blocks=[]; let i=0; let loose=[];
  const flushLoose=()=>{paragraphsFrom(loose).forEach(t=>blocks.push({id:uid(),type:"text",variant:"body",text:t}));loose=[]};
  const collect=(closeRe)=>{const a=[];i++;while(i<lines.length&&!closeRe.test(lines[i].trim()))a.push(lines[i++].trim());if(i<lines.length)i++;return a};

  while(i<lines.length){
    const line=lines[i].trim();
    if(!line){loose.push("");i++;continue}

    let m=line.match(/^\[\[(H1_LEI|H2_DIVISAO|H3_SECAO|H4_SUBSECAO|H5_TEMA)\]\]$/i);
    if(m){
      flushLoose(); const tag=norm(m[1]), content=collect(new RegExp("^\\[\\[\\/"+tag+"\\]\\]$","i"));
      const level=tag==="H1_LEI"?1:tag==="H2_DIVISAO"?2:tag==="H3_SECAO"?3:tag==="H4_SUBSECAO"?4:5;
      blocks.push({id:uid(),type:"heading",level,text:content.join(" ").trim()}); continue;
    }

    m=line.match(/^\[\[(TEXTO_LEGAL|CORPO|FONTE)\]\]$/i);
    if(m){
      flushLoose();const tag=norm(m[1]), content=collect(new RegExp("^\\[\\[\\/"+tag+"\\]\\]$","i"));
      const variant=tag==="TEXTO_LEGAL"?"legal":tag==="FONTE"?"source":"body";
      paragraphsFrom(content).forEach(text=>blocks.push({id:uid(),type:"text",variant,text}));continue;
    }

    m=line.match(/^\[\[(COMENTARIO|PONTO_PROVA|ATENCAO|CUIDADO|NAO_CONFUNDA|OLHO_PRAZO|OLHO_COMPETENCIA|VALE_DECORAR|LETRA_LEI|COMO_CAI|REVISAO_30S|EXEMPLO|VERIFICAR|ATUALIZACAO|JURISPRUDENCIA|CHECKPOINT|GABARITO_CHECKPOINT)\]\]$/i);
    if(m){
      flushLoose();const tag=norm(m[1]),content=collect(new RegExp("^\\[\\[\\/"+tag+"\\]\\]$","i")),f=readFields(content);
      const variants={
        COMENTARIO:"comment",PONTO_PROVA:"point",ATENCAO:"alert",CUIDADO:"care",NAO_CONFUNDA:"contrast",
        OLHO_PRAZO:"deadline",OLHO_COMPETENCIA:"competence",VALE_DECORAR:"memorize",LETRA_LEI:"lawletter",
        COMO_CAI:"exam",REVISAO_30S:"review",EXEMPLO:"example",VERIFICAR:"verify",ATUALIZACAO:"update",
        JURISPRUDENCIA:"juris",CHECKPOINT:"checkpoint",GABARITO_CHECKPOINT:"answer"
      };
      const rawText=(f.TEXTO||f.TESE||f.ALTERACAO||[]);
      blocks.push({id:uid(),type:"callout",variant:variants[tag]||"point",title:(f.TITULO||[""])[0],
        text:rawText.length?rawText.join(" "):content.filter(x=>!x.includes("=")).join(" "),
        meta:Object.fromEntries(Object.entries(f).filter(([k])=>!["TITULO","TEXTO"].includes(k)).map(([k,v])=>[k,v.join(" ")]))
      }); continue;
    }

    if(/^\[\[TABELA\]\]$/i.test(line)){
      flushLoose();const content=collect(/^\[\[\/TABELA\]\]$/i),f=readFields(content);
      const columns=((f.COLUNAS||[""])[0]||"").split("|").map(x=>x.trim()).filter(Boolean);
      blocks.push({id:uid(),type:"table",tableType:(f.TIPO||["BASE"])[0],title:(f.TITULO||[""])[0],
        columns,rows:(f.LINHA||[]).map(r=>r.split("|").map(x=>x.trim())),source:""});continue;
    }

    if(/^\[\[QUADRO_COMPARATIVO\]\]$/i.test(line)){
      flushLoose();const content=collect(/^\[\[\/QUADRO_COMPARATIVO\]\]$/i),f=readFields(content);
      blocks.push({id:uid(),type:"comparison",title:(f.TITULO||["Comparação"])[0],
        aTitle:(f.A_TITULO||["A"])[0],aText:(f.A_TEXTO||[""])[0],bTitle:(f.B_TITULO||["B"])[0],bText:(f.B_TEXTO||[""])[0]});continue;
    }

    m=line.match(/^\[\[ESQUEMA:([A-Z0-9_]+)\]\]$/i);
    if(m){
      flushLoose();const schemeType=norm(m[1]),content=collect(/^\[\[\/ESQUEMA\]\]$/i),f=readFields(content);
      if(schemeType==="MAPA_TATICO"){
        const items=[],notes=[];let currentGroup="";
        content.forEach(row=>{const p=row.indexOf("=");if(p<1)return;const k=norm(row.slice(0,p)),v=row.slice(p+1).trim();
          if(k==="GRUPO"){currentGroup=v;return}
          if(k==="ITEM"){const z=v.split("|");items.push({label:(z[0]||"").trim(),description:(z[1]||"").trim(),class:norm(z[2]||"NEUTRO"),group:currentGroup})}
          if(k==="NOTA_LIGADA"){const z=v.split("|");notes.push({target:(z[0]||"").trim(),text:(z[1]||"").trim(),type:norm(z[2]||"OBSERVACAO")})}
        });
        const requested=norm((f.LAYOUT||f.ORIENTACAO||["LATERAL"])[0]);
        blocks.push({id:uid(),type:"map",schemeType,title:(f.TITULO||["Mapa tático"])[0],
          layout:LAYOUT_OPTIONS.includes(requested)?requested:(requested==="VERTICAL"?"VERTICAL":"LATERAL"),
          root:(f.RAIZ||[""])[0],reference:(f.REFERENCIA||[""])[0],items,notes,raw:content.join("\n")});
      }else{
        blocks.push({id:uid(),type:"scheme",schemeType,title:(f.TITULO||[schemeType.replaceAll("_"," ")])[0],
          fields:f,raw:content.join("\n")});
      }
      continue;
    }

    if(/^\[\[/.test(line)){flushLoose();loose.push(line);i++;continue}
    loose.push(line);i++;
  }
  flushLoose();
  return blocks;
}

function renderHeading(b){
  return '<h'+b.level+' class="print-h'+b.level+'">'+formatInline(b.text)+'</h'+b.level+'>';
}
function renderText(b){
  if(b.variant==="source") return '<div class="source-note">'+formatInline(b.text)+'</div>';
  const cls=b.variant==="legal"?"legal-text":"body-text justified";
  return '<p class="'+cls+'">'+formatInline(b.text)+'</p>';
}
function renderCallout(b){
  const labels={
    point:"PONTO DE PROVA",alert:"ATENÇÃO",care:"CUIDADO",contrast:"NÃO CONFUNDA",deadline:"OLHO NO PRAZO",
    competence:"OLHO NA COMPETÊNCIA",memorize:"VALE DECORAR",lawletter:"LETRA DA LEI",exam:"COMO CAI",
    review:"REVISÃO 30S",comment:"COMENTÁRIO",example:"EXEMPLO",verify:"VERIFIQUE",update:"ATUALIZAÇÃO",
    juris:"JURISPRUDÊNCIA",checkpoint:"CHECKPOINT",answer:"GABARITO"
  };
  const meta=b.meta&&Object.keys(b.meta).length?'<div class="source-note">'+Object.entries(b.meta).map(([k,v])=>esc(k.replaceAll("_"," "))+' · '+esc(v)).join(" &nbsp; ")+'</div>':"";
  return '<aside class="callout callout-'+esc(b.variant)+'"><div class="callout-label">'+esc(labels[b.variant]||"DESTAQUE")+'</div>'+
    (b.title?'<h4 class="callout-title">'+formatInline(b.title)+'</h4>':'')+
    '<p class="callout-body">'+formatInline(b.text)+'</p>'+meta+'</aside>';
}
function renderTable(b){
  const columns=b.columns||[];
  return '<section class="editorial-table-wrap">'+
    (b.title?'<div class="table-title">'+formatInline(b.title)+'</div>':'')+
    '<table class="editorial-table"><thead><tr>'+columns.map(c=>'<th>'+formatInline(c)+'</th>').join("")+'</tr></thead>'+
    '<tbody>'+(b.rows||[]).map(r=>'<tr>'+columns.map((_,i)=>'<td>'+formatInline(r[i]||"")+'</td>').join("")+'</tr>').join("")+'</tbody></table>'+
    (b.source?'<div class="source-note">'+formatInline(b.source)+'</div>':'')+'</section>';
}
function mapCard(item, notes=[]){
  const klass=norm(item.class||"NEUTRO").toLowerCase();
  const special=["excecao","limite","temporal","alerta"].includes(klass)?" special-border":"";
  const noteHtml=notes.filter(n=>n.target===item.label).map(n=>'<div class="map-note">'+formatInline(n.text)+'</div>').join("");
  return '<div class="map-card class-'+esc(klass)+special+'" data-label="'+esc(norm(item.label))+'">'+
    '<div class="map-label">'+formatInline(item.label)+'</div>'+
    '<div class="map-desc">'+formatInline(item.description)+'</div>'+noteHtml+'</div>';
}
function groupItems(items){
  const groups=[];const index=new Map();
  items.forEach(item=>{
    const name=item.group||"";
    if(!index.has(name)){index.set(name,groups.length);groups.push({name,items:[]})}
    groups[index.get(name)].items.push(item);
  });
  return groups;
}
function renderMap(b){
  const layout=LAYOUT_OPTIONS.includes(norm(b.layout))?norm(b.layout):"LATERAL";
  const root='<div class="scheme-root">'+formatInline(b.root||"NÚCLEO")+'</div>';
  const title='<div class="map-title-row"><span class="map-title-filet"></span><div class="map-title">'+formatInline(b.title||"Mapa tático")+'</div></div>';
  const items=b.items||[], notes=b.notes||[];
  let body="";

  if(layout==="CHUVEIRO"){
    const cols=Math.max(2,Math.min(items.length,4));
    body=root+'<div class="chuveiro-grid" style="--cols:'+cols+'">'+items.map(x=>mapCard(x,notes)).join("")+'</div>';
  }else if(layout==="DECISAO"){
    body=root+'<div class="decision-grid">'+items.slice(0,2).map(x=>mapCard(x,notes)).join("")+'</div>';
  }else if(layout==="CONTRASTE"){
    const cols=Math.max(2,Math.min(items.length,4));
    body=root+'<div class="contrast-grid" style="--cols:'+cols+'">'+items.map(x=>mapCard(x,notes)).join("")+'</div>';
  }else if(layout==="FLUXO"){
    const vertical=items.length>4?" vertical":"";
    body=root+'<div class="flow-grid'+vertical+'">'+items.map(x=>'<div class="flow-step">'+mapCard(x,notes)+'</div>').join("")+'</div>';
  }else if(layout==="VERTICAL"){
    body=root+'<div class="vertical-groups">'+groupItems(items).map(g=>
      '<section class="vertical-group">'+(g.name?'<div class="vertical-group-title">'+formatInline(g.name)+'</div>':'')+
      '<div class="vertical-cards">'+g.items.map(x=>mapCard(x,notes)).join("")+'</div></section>'
    ).join("")+'</div>';
  }else{
    body='<div class="map-lateral"><div class="lateral-root-wrap">'+root+'</div><div class="lateral-groups">'+
      groupItems(items).map(g=>'<section class="lateral-group">'+(g.name?'<div class="group-label">'+formatInline(g.name)+'</div>':'')+
      g.items.map(x=>mapCard(x,notes)).join("")+'</section>').join("")+'</div></div>';
  }

  return '<section class="tactical-map map-'+layout.toLowerCase()+'">'+title+body+
    (b.reference?'<div class="source-note">'+formatInline(b.reference)+'</div>':'')+'</section>';
}
function renderComparison(b){
  return '<section class="draw-comparison"><div class="draw-title">'+formatInline(b.title||"Comparação")+'</div>'+
    '<div class="draw-comparison-grid"><div class="draw-pole"><strong>'+formatInline(b.aTitle)+'</strong><p>'+formatInline(b.aText)+'</p></div>'+
    '<div class="draw-vs">×</div><div class="draw-pole"><strong>'+formatInline(b.bTitle)+'</strong><p>'+formatInline(b.bText)+'</p></div></div></section>';
}
function vals(b,key){return (b.fields?.[key]||[])}
function splitPipe(v){return String(v||"").split("|").map(x=>x.trim())}
function drawTitle(b){return '<div class="draw-title">'+formatInline(b.title||b.schemeType.replaceAll("_"," "))+'</div>'}
function drawNode(label,desc="",extra=""){
  return '<div class="draw-node '+extra+'"><strong>'+formatInline(label)+'</strong>'+(desc?'<span>'+formatInline(desc)+'</span>':'')+'</div>';
}
function renderScheme(b){
  const t=norm(b.schemeType), f=b.fields||{}; let body="";
  if(t==="FLUXO_HORIZONTAL"||t==="FLUXO_VERTICAL"){
    const items=vals(b,"ITEM");
    body='<div class="draw-flow '+(t==="FLUXO_VERTICAL"?"vertical":"horizontal")+'">'+items.map((x,i)=>'<div class="draw-flow-step">'+drawNode(x)+'<i>'+(i<items.length-1?(t==="FLUXO_VERTICAL"?"↓":"→"):"")+'</i></div>').join("")+'</div>';
  }else if(t==="CONCEITO_CHAVES"){
    const concept=(f.CONCEITO||["CONCEITO"])[0], keys=vals(b,"CHAVE").map(splitPipe);
    body='<div class="concept-orbit"><div class="concept-center">'+formatInline(concept)+'</div><div class="concept-rays">'+keys.map(x=>'<div class="concept-ray">'+drawNode(x[0],x[1])+'</div>').join("")+'</div></div>';
  }else if(t==="ETAPAS_COM_FUNCAO"){
    const steps=vals(b,"ETAPA").map(splitPipe);
    body='<div class="draw-rail">'+steps.map((x,i)=>'<div class="rail-step"><b>'+(i+1)+'</b><div><strong>'+formatInline(x[0])+'</strong><span>'+formatInline(x[1]||"")+'</span></div></div>').join("")+'</div>';
  }else if(t==="FLUXOGRAMA_DECISAO"){
    const stages=[...(f.INICIO||[]),...vals(b,"ETAPA")];
    body='<div class="decision-drawing"><div class="decision-pre">'+stages.map(x=>drawNode(x)).join('<span class="arrow-down">↓</span>')+'</div>'+
      '<div class="decision-diamond">'+formatInline((f.DECISAO||["Decisão"])[0])+'</div>'+
      '<div class="decision-branches"><div><em>SIM</em>'+drawNode((f.SIM||[""])[0])+'</div><div><em>NÃO</em>'+drawNode((f.NAO||[""])[0])+'</div></div></div>';
  }else if(t==="FLUXO_RAMIFICADO"){
    const stages=[...(f.INICIO||[]),...vals(b,"ETAPA")],outs=vals(b,"SAIDA");
    body='<div class="branch-drawing"><div class="branch-stem">'+stages.map(x=>drawNode(x)).join('<span>↓</span>')+'</div><div class="branch-bar"></div><div class="branch-outs">'+outs.map(x=>drawNode(x)).join("")+'</div></div>';
  }else if(t==="LINHA_DO_TEMPO"){
    const marks=vals(b,"MARCO").map(splitPipe);
    body='<div class="timeline-drawing">'+marks.map((x,i)=>'<div class="timeline-point"><b>'+(i+1)+'</b><strong>'+formatInline(x[0])+'</strong><span>'+formatInline(x[1]||"")+'</span></div>').join("")+'</div>';
  }else if(t==="REGRA_EXCECOES"){
    const rule=(f.REGRA||["REGRA"])[0],ex=vals(b,"EXCECAO");
    body='<div class="rule-drawing"><div class="rule-main">'+formatInline(rule)+'</div><div class="rule-bracket"></div><div class="rule-exceptions">'+ex.map((x,i)=>'<div><small>EXCEÇÃO '+(i+1)+'</small>'+formatInline(x)+'</div>').join("")+'</div></div>';
  }else if(t==="ESCADA"){
    const axis=(f.EIXO||[""])[0],lv=vals(b,"NIVEL").map(splitPipe);
    body='<div class="stair-axis">'+formatInline(axis)+'</div><div class="staircase">'+lv.map((x,i)=>'<div class="stair" style="--step:'+i+'"><b>'+formatInline(x[0])+'</b><span>'+formatInline(x[1]||"")+'</span></div>').join("")+'</div>';
  }else if(t==="PRAZOS_ENCADEADOS"){
    const ev=vals(b,"EVENTO").map(splitPipe);
    body='<div class="deadline-chain">'+ev.map((x,i)=>'<div class="deadline-event"><div class="deadline-dot">'+(i+1)+'</div><div><strong>'+formatInline(x[0])+'</strong><b>'+formatInline(x[1]||"")+'</b><span>'+formatInline(x[2]||"")+'</span><em>'+formatInline(x[3]||"")+'</em></div></div>').join("")+'</div>';
  }else if(t==="EQUACAO_VISUAL"){
    body='<div class="equation-visual">'+vals(b,"LINHA").map(v=>{const x=splitPipe(v);return '<div><span>'+formatInline(x[0])+'</span><b>'+formatInline(x[1]||"")+'</b><span>'+formatInline(x[2]||"")+'</span></div>'}).join("")+'</div>';
  }else if(t==="ARVORE"){
    const root=(f.RAIZ||["RAIZ"])[0],children=vals(b,"FILHO");
    body='<div class="tree-drawing"><div class="tree-root">'+formatInline(root)+'</div><div class="tree-trunk"></div><div class="tree-children">'+children.map(x=>drawNode(x)).join("")+'</div></div>';
  }else if(t==="RAMIFICACAO"){
    const center=(f.CENTRO||["CENTRO"])[0],groups=[];let gi=-1;
    (b.raw||"").split("\n").forEach(line=>{const p=line.indexOf("=");if(p<1)return;const k=norm(line.slice(0,p)),v=line.slice(p+1).trim();if(k==="GRUPO"){groups.push({name:v,items:[]});gi++}if(k==="SUBITEM"&&gi>=0)groups[gi].items.push(v)});
    body='<div class="radial-drawing"><div class="radial-center">'+formatInline(center)+'</div><div class="radial-groups">'+groups.map(g=>'<div class="radial-group"><strong>'+formatInline(g.name)+'</strong>'+g.items.map(x=>'<span>'+formatInline(x)+'</span>').join("")+'</div>').join("")+'</div></div>';
  }else if(t==="LINHA_LATERAL"||t==="LISTA_NUMERADA"){
    const items=vals(b,"ITEM");
    body='<div class="side-line">'+items.map((x,i)=>'<div class="side-line-item"><b>'+String(i+1).padStart(2,"0")+'</b><span>'+formatInline(x)+'</span></div>').join("")+'</div>';
  }else if(t==="DIVERGENCIA"){
    const start=(f.ORIGEM||f.INICIO||f.RAIZ||["NÚCLEO"])[0],outs=vals(b,"SAIDA").concat(vals(b,"ITEM"));
    body='<div class="diverge"><div class="diverge-source">'+formatInline(start)+'</div><div class="branch-bar"></div><div class="branch-outs">'+outs.map(x=>drawNode(x)).join("")+'</div></div>';
  }else if(t==="CONVERGENCIA"){
    const ins=vals(b,"ENTRADA").concat(vals(b,"ITEM")),result=(f.RESULTADO||f.SAIDA||["RESULTADO"])[0];
    body='<div class="converge"><div class="branch-outs">'+ins.map(x=>drawNode(x)).join("")+'</div><div class="branch-bar"></div><div class="diverge-source">'+formatInline(result)+'</div></div>';
  }else if(t==="CICLO"){
    const items=vals(b,"ITEM").concat(vals(b,"ETAPA"));
    body='<div class="cycle-drawing">'+items.map((x,i)=>'<div class="cycle-item"><b>'+formatInline(x)+'</b><span>↻</span></div>').join("")+'</div>';
  }else if(t==="CADEIA_NORMATIVA"||t==="CAMADAS_HORIZONTAIS"){
    const items=vals(b,"ITEM").concat(vals(b,"CAMADA")).concat(vals(b,"NIVEL"));
    body='<div class="layer-chain">'+items.map((x,i)=>'<div style="--layer:'+i+'">'+formatInline(x)+'</div>').join("")+'</div>';
  }else if(t==="CAMADAS"||t==="HIERARQUIA_ANINHADA"){
    const items=vals(b,"CAMADA").concat(vals(b,"NIVEL")).concat(vals(b,"ITEM"));
    body='<div class="nested-layers">'+items.map((x,i)=>'<div style="--layer:'+i+'">'+formatInline(x)+'</div>').join("")+'</div>';
  }else if(t==="CONEXAO_ARTIGOS"){
    const items=vals(b,"ARTIGO").concat(vals(b,"ITEM"));
    body='<div class="article-links">'+items.map(x=>'<span>'+formatInline(x)+'</span>').join('<i>↔</i>')+'</div>';
  }else if(t==="REGRA_MEMBROS"){
    const rule=(f.REGRA||["REGRA"])[0],members=vals(b,"MEMBRO").concat(vals(b,"ITEM"));
    body='<div class="members-drawing"><div class="rule-main">'+formatInline(rule)+'</div><div class="member-brace">{</div><div class="member-list">'+members.map(x=>'<span>'+formatInline(x)+'</span>').join("")+'</div></div>';
  }else if(t==="PIRAMIDE"){
    const items=vals(b,"NIVEL").concat(vals(b,"ITEM"));
    body='<div class="pyramid">'+items.map((x,i)=>'<div style="--w:'+(52+i*(40/Math.max(items.length-1,1)))+'%">'+formatInline(x)+'</div>').join("")+'</div>';
  }else if(t==="COMPARACAO_MULTIPLA"){
    const items=vals(b,"ITEM").concat(vals(b,"POLO"));
    body='<div class="multi-compare">'+items.map(x=>{const z=splitPipe(x);return '<div><strong>'+formatInline(z[0])+'</strong><span>'+formatInline(z.slice(1).join(" · "))+'</span></div>'}).join("")+'</div>';
  }else if(t==="TAXONOMIA"){
    const root=(f.RAIZ||f.CENTRO||["CLASSIFICAÇÃO"])[0],items=vals(b,"CLASSE").concat(vals(b,"ITEM")).concat(vals(b,"FILHO"));
    body='<div class="taxonomy"><div class="tree-root">'+formatInline(root)+'</div><div class="taxonomy-list">'+items.map(x=>drawNode(x)).join("")+'</div></div>';
  }else{
    const pairs=Object.entries(f).filter(([k])=>k!=="TITULO");
    body='<div class="generic-drawing">'+pairs.map(([k,arr])=>'<section><b>'+esc(k.replaceAll("_"," "))+'</b>'+arr.map(x=>'<span>'+formatInline(x)+'</span>').join("")+'</section>').join("")+'</div>';
  }
  return '<section class="draw-scheme scheme-'+t.toLowerCase()+'">'+drawTitle(b)+body+'</section>';
}

function renderBlock(b){
  let inner="";
  if(b.type==="heading")inner=renderHeading(b);
  else if(b.type==="text")inner=renderText(b);
  else if(b.type==="callout")inner=renderCallout(b);
  else if(b.type==="table")inner=renderTable(b);
  else if(b.type==="map")inner=renderMap(b);
  else if(b.type==="scheme")inner=renderScheme(b);
  else if(b.type==="comparison")inner=renderComparison(b);
  return '<div class="render-block '+(state.selectedId===b.id?"selected":"")+'" data-block-id="'+b.id+'">'+inner+'</div>';
}

function renderDocument(){
  const d=state.document;
  const preview=$("documentPreview");
  preview.className="document-preview theme-"+d.theme+(d.economy?" economy":"");
  $("coverPage").style.display=d.showCover?"flex":"none";
  $("coverPage").innerHTML='<div class="cover-brandline">'+esc(d.brand)+'</div><div class="cover-rule"></div>'+
    '<div class="cover-center"><span class="cover-kicker">MATERIAL ESTRATÉGICO</span><h1 class="cover-title">'+esc(d.title)+'</h1>'+
    '<p class="cover-subtitle">'+esc(d.subtitle)+'</p></div>'+
    '<div class="cover-bottom"><span>'+esc(d.edition)+'</span><span>'+esc(d.meta)+'</span></div>';
  $("runningHeader").style.display=d.showHeader?"flex":"none";
  $("runningHeader").innerHTML='<span>'+esc(d.brand)+'</span><span>'+esc(d.title)+'</span>';
  $("footerBrand").textContent=d.brand;
  $("footerMeta").textContent=d.edition;
  $("blocksPreview").innerHTML=state.blocks.map(renderBlock).join("");
  $("documentPreview").style.transform="scale("+state.zoom+")";
  $("documentPreview").style.transformOrigin="top center";
  const scaledGap=(state.zoom-1)*$("documentPreview").offsetHeight;
  $("canvas-stage")?.style?.setProperty("--scaled-gap",scaledGap+"px");
}
function blockName(b){
  if(b.type==="heading")return b.text||"Título";
  if(b.type==="text")return (b.text||"Texto").slice(0,48);
  if(b.type==="callout")return b.title||"Destaque";
  if(b.type==="table")return b.title||"Tabela";
  if(b.type==="map")return b.title||"Mapa tático";
  if(b.type==="scheme")return b.title||b.schemeType;
  if(b.type==="comparison")return b.title||"Quadro comparativo";
  return "Bloco";
}
function blockTypeLabel(b){
  if(b.type==="heading")return "H"+b.level;
  if(b.type==="text")return b.variant==="legal"?"TEXTO LEGAL":b.variant==="source"?"FONTE":"CORPO";
  if(b.type==="callout")return b.variant.toUpperCase();
  if(b.type==="table")return "TABELA";
  if(b.type==="map")return "MAPA TÁTICO";
  if(b.type==="scheme")return b.schemeType;
  if(b.type==="comparison")return "QUADRO COMPARATIVO";
  return b.type.toUpperCase();
}
function renderBlockList(){
  $("blockCount").textContent=state.blocks.length;
  $("blockList").innerHTML=state.blocks.map((b,i)=>
    '<div class="block-row '+(b.id===state.selectedId?"active":"")+'" data-select-block="'+b.id+'">'+
    '<span class="block-index">'+(i+1)+'</span><div class="block-main"><div class="block-type">'+esc(blockTypeLabel(b))+'</div>'+
    '<div class="block-label">'+esc(blockName(b))+'</div></div>'+
    (b.type==="map"?'<span class="block-layout-chip">'+esc(b.layout)+'</span>':b.type==="scheme"?'<span class="block-layout-chip">'+esc(b.schemeType)+'</span>':'')+'</div>'
  ).join("");
}
function renderAll(){
  $("projectTitleTop").value=state.projectName;
  const d=state.document;
  $("docTitle").value=d.title;$("docSubtitle").value=d.subtitle;$("docEdition").value=d.edition;
  $("docBrand").value=d.brand;$("docMeta").value=d.meta;$("docTheme").value=d.theme;
  $("showCover").checked=d.showCover;$("showHeader").checked=d.showHeader;$("economyMode").checked=d.economy;
  renderBlockList();renderDocument();renderInspector();
}

function selectedBlock(){return state.blocks.find(b=>b.id===state.selectedId)}
function selectBlock(id){
  state.selectedId=id;
  renderBlockList();renderDocument();renderInspector();
}
function updateSelected(mutator){
  const b=selectedBlock();if(!b)return;
  mutator(b);markDirty();renderBlockList();renderDocument();
}

function textField(label,value,key,type="input"){
  if(type==="textarea")return '<div class="field"><label>'+esc(label)+'</label><textarea data-field="'+key+'">'+esc(value||"")+'</textarea></div>';
  return '<div class="field"><label>'+esc(label)+'</label><input data-field="'+key+'" value="'+esc(value||"")+'"></div>';
}
function selectField(label,value,key,options){
  return '<div class="field"><label>'+esc(label)+'</label><select data-field="'+key+'">'+options.map(o=>'<option value="'+esc(o)+'" '+(String(o)===String(value)?"selected":"")+'>'+esc(o)+'</option>').join("")+'</select></div>';
}
function fieldsToRaw(fields={}){return Object.entries(fields).flatMap(([k,v])=>(v||[]).map(x=>k+"="+x)).join("\n")}
function renderInspector(){
  const b=selectedBlock();
  $("inspectorEmpty").classList.toggle("hidden",!!b);
  $("inspector").classList.toggle("hidden",!b);
  if(!b)return;
  $("inspectorTitle").textContent=blockTypeLabel(b);
  let html="";

  if(b.type==="heading"){
    html='<div class="inspector-section"><div class="inspector-section-title">Conteúdo</div>'+
      selectField("Nível",b.level,"level",[1,2,3,4,5])+textField("Título",b.text,"text","textarea")+'</div>';
  }

  if(b.type==="text"){
    html='<div class="inspector-section"><div class="inspector-section-title">Texto</div>'+
      selectField("Estilo",b.variant,"variant",["legal","body","source"])+
      textField("Conteúdo",b.text,"text","textarea")+
      '<div class="panel-help">Você pode manter [[CHAVE]], [[NEG]], [[POSS]] e [[REM]] dentro do texto.</div></div>';
  }

  if(b.type==="callout"){
    html='<div class="inspector-section"><div class="inspector-section-title">Callout</div>'+
      selectField("Tipo",b.variant,"variant",["point","alert","example","verify","update","juris"])+
      textField("Título",b.title,"title")+textField("Texto",b.text,"text","textarea")+'</div>';
  }

  if(b.type==="table"){
    html='<div class="inspector-section"><div class="inspector-section-title">Tabela</div>'+
      textField("Título",b.title,"title")+textField("Colunas separadas por |",(b.columns||[]).join(" | "),"columns")+
      '<div class="mini-label">Linhas</div><div id="tableRowsEditor">'+(b.rows||[]).map((r,i)=>
        '<div class="row-editor"><div class="item-editor-top"><input data-table-row="'+i+'" value="'+esc(r.join(" | "))+'"><span></span><button class="small-remove" data-remove-row="'+i+'">×</button></div></div>'
      ).join("")+'</div><button class="add-mini" id="addTableRow">+ linha</button>'+
      textField("Fonte",b.source,"source")+'</div>';
  }

  if(b.type==="map"){
    html='<div class="inspector-section"><div class="inspector-section-title">Mapa tático</div>'+
      textField("Título",b.title,"title")+selectField("Layout",b.layout,"layout",LAYOUT_OPTIONS)+
      textField("Raiz",b.root,"root")+textField("Referência",b.reference,"reference")+'</div>'+
      '<div class="inspector-section"><div class="inspector-section-title">Itens</div><div id="mapItemsEditor">'+
      (b.items||[]).map((item,i)=>
        '<div class="item-editor"><div class="item-editor-top"><input data-item-label="'+i+'" value="'+esc(item.label)+'">'+
        '<select data-item-class="'+i+'">'+CLASS_OPTIONS.map(c=>'<option '+(c===norm(item.class)?"selected":"")+'>'+c+'</option>').join("")+'</select>'+
        '<button class="small-remove" data-remove-item="'+i+'">×</button></div>'+
        (b.layout==="LATERAL"?'<input data-item-group="'+i+'" placeholder="Grupo (opcional)" value="'+esc(item.group||"")+'" style="margin-bottom:6px">':'')+
        '<textarea data-item-desc="'+i+'">'+esc(item.description||"")+'</textarea></div>'
      ).join("")+'</div><button class="add-mini" id="addMapItem">+ item</button></div>'+
      '<div class="inspector-section"><div class="inspector-section-title">Notas ligadas</div><div id="mapNotesEditor">'+
      (b.notes||[]).map((n,i)=>
        '<div class="item-editor"><div class="item-editor-top"><input data-note-target="'+i+'" value="'+esc(n.target)+'" placeholder="Rótulo alvo">'+
        '<select data-note-type="'+i+'">'+["CONDICAO","EXCECAO","ALERTA","OBSERVACAO","EFEITO","CONSEQUENCIA"].map(c=>'<option '+(c===norm(n.type)?"selected":"")+'>'+c+'</option>').join("")+'</select>'+
        '<button class="small-remove" data-remove-note="'+i+'">×</button></div><textarea data-note-text="'+i+'">'+esc(n.text||"")+'</textarea></div>'
      ).join("")+'</div><button class="add-mini" id="addMapNote">+ nota ligada</button></div>';
  }

  if(b.type==="scheme"){
    html='<div class="inspector-section"><div class="inspector-section-title">Esquema da Macro</div>'+
      selectField("Tipo",b.schemeType,"schemeType",SCHEME_TYPES)+
      textField("Título",b.title,"title")+
      textField("Campos ABI",b.raw||fieldsToRaw(b.fields),"raw","textarea")+
      '<div class="panel-help">Edite os campos exatamente como na Macro. O desenho é reconstruído em tempo real.</div></div>';
  }
  if(b.type==="comparison"){
    html='<div class="inspector-section"><div class="inspector-section-title">Comparativo</div>'+
      textField("Título",b.title,"title")+textField("A · título",b.aTitle,"aTitle")+textField("A · texto",b.aText,"aText","textarea")+
      textField("B · título",b.bTitle,"bTitle")+textField("B · texto",b.bText,"bText","textarea")+'</div>';
  }
  $("inspectorFields").innerHTML=html;
  bindInspectorEvents();
}

function bindInspectorEvents(){
  const root=$("inspectorFields");
  root.querySelectorAll("[data-field]").forEach(el=>{
    el.addEventListener("input",()=>{
      const k=el.dataset.field;
      updateSelected(b=>{
        if(k==="level")b[k]=Number(el.value);
        else if(k==="columns")b.columns=el.value.split("|").map(x=>x.trim()).filter(Boolean);
        else if(k==="raw"){b.raw=el.value;b.fields=readFields(el.value.split("\n"));}
        else b[k]=el.value;
      });
    });
  });

  root.querySelectorAll("[data-table-row]").forEach(el=>el.addEventListener("input",()=>{
    const i=Number(el.dataset.tableRow);updateSelected(b=>b.rows[i]=el.value.split("|").map(x=>x.trim()));
  }));
  root.querySelectorAll("[data-remove-row]").forEach(el=>el.addEventListener("click",()=>{
    const i=Number(el.dataset.removeRow);updateSelected(b=>b.rows.splice(i,1));renderInspector();
  }));
  $("addTableRow")?.addEventListener("click",()=>{updateSelected(b=>b.rows.push((b.columns||["",""]).map(()=>'')));renderInspector()});

  root.querySelectorAll("[data-item-label]").forEach(el=>el.addEventListener("input",()=>{
    const i=Number(el.dataset.itemLabel);updateSelected(b=>b.items[i].label=el.value);
  }));
  root.querySelectorAll("[data-item-class]").forEach(el=>el.addEventListener("change",()=>{
    const i=Number(el.dataset.itemClass);updateSelected(b=>b.items[i].class=el.value);
  }));
  root.querySelectorAll("[data-item-group]").forEach(el=>el.addEventListener("input",()=>{
    const i=Number(el.dataset.itemGroup);updateSelected(b=>b.items[i].group=el.value);
  }));
  root.querySelectorAll("[data-item-desc]").forEach(el=>el.addEventListener("input",()=>{
    const i=Number(el.dataset.itemDesc);updateSelected(b=>b.items[i].description=el.value);
  }));
  root.querySelectorAll("[data-remove-item]").forEach(el=>el.addEventListener("click",()=>{
    const i=Number(el.dataset.removeItem);updateSelected(b=>b.items.splice(i,1));renderInspector();
  }));
  $("addMapItem")?.addEventListener("click",()=>{updateSelected(b=>b.items.push({label:"Novo item",description:"Descrição do conteúdo.",class:"NEUTRO",group:""}));renderInspector()});

  root.querySelectorAll("[data-note-target]").forEach(el=>el.addEventListener("input",()=>{
    const i=Number(el.dataset.noteTarget);updateSelected(b=>b.notes[i].target=el.value);
  }));
  root.querySelectorAll("[data-note-type]").forEach(el=>el.addEventListener("change",()=>{
    const i=Number(el.dataset.noteType);updateSelected(b=>b.notes[i].type=el.value);
  }));
  root.querySelectorAll("[data-note-text]").forEach(el=>el.addEventListener("input",()=>{
    const i=Number(el.dataset.noteText);updateSelected(b=>b.notes[i].text=el.value);
  }));
  root.querySelectorAll("[data-remove-note]").forEach(el=>el.addEventListener("click",()=>{
    const i=Number(el.dataset.removeNote);updateSelected(b=>b.notes.splice(i,1));renderInspector();
  }));
  $("addMapNote")?.addEventListener("click",()=>{updateSelected(b=>b.notes.push({target:b.items?.[0]?.label||"",text:"Observação ligada ao item.",type:"OBSERVACAO"}));renderInspector()});
}

function moveSelected(delta){
  const i=state.blocks.findIndex(b=>b.id===state.selectedId);if(i<0)return;
  const j=i+delta;if(j<0||j>=state.blocks.length)return;
  [state.blocks[i],state.blocks[j]]=[state.blocks[j],state.blocks[i]];markDirty();renderAll();
}
function deleteSelected(){
  const i=state.blocks.findIndex(b=>b.id===state.selectedId);if(i<0)return;
  if(!confirm("Excluir este bloco?"))return;
  state.blocks.splice(i,1);state.selectedId=state.blocks[Math.min(i,state.blocks.length-1)]?.id||null;markDirty();renderAll();
}
function duplicateSelected(){
  const i=state.blocks.findIndex(b=>b.id===state.selectedId);if(i<0)return;
  const copy=structuredClone(state.blocks[i]);copy.id=uid();
  state.blocks.splice(i+1,0,copy);state.selectedId=copy.id;markDirty();renderAll();
}

function addBlock(type){
  let b;
  if(type==="heading")b={id:uid(),type:"heading",level:3,text:"Novo tópico"};
  if(type==="text")b={id:uid(),type:"text",variant:"body",text:"Novo conteúdo."};
  if(type==="callout")b={id:uid(),type:"callout",variant:"point",title:"Ponto de prova",text:"Conteúdo do destaque.",meta:{}};
  if(type==="table")b={id:uid(),type:"table",tableType:"BASE",title:"Nova tabela",columns:["Critério","Conteúdo"],rows:[["Item","Descrição"]],source:""};
  if(type==="map")b={id:uid(),type:"map",title:"Novo mapa tático",layout:"CHUVEIRO",root:"NÚCLEO",reference:"",items:[
    {label:"Item 1",description:"Descrição.",class:"REGRA",group:""},
    {label:"Item 2",description:"Descrição.",class:"CONCEITO",group:""}
  ],notes:[]};
  if(!b)return;
  state.blocks.push(b);state.selectedId=b.id;markDirty();closeModal();switchPanel("blocks");renderAll();
}

function switchPanel(name){
  document.querySelectorAll(".panel-tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===name));
  document.querySelectorAll(".panel-view").forEach(x=>x.classList.toggle("active",x.dataset.view===name));
}
function processSource(){
  const raw=$("sourceInput").value;
  if(!raw.trim()){toast("Cole a saída do agente primeiro.","error");return}
  state.source=raw;state.blocks=parseAgentOutput(raw);state.selectedId=state.blocks[0]?.id||null;markDirty();
  switchPanel("blocks");renderAll();toast(state.blocks.length+" blocos formatados.");
}
function loadDemo(){
  $("sourceInput").value=DEMO_SOURCE;state.source=DEMO_SOURCE;state.blocks=parseAgentOutput(DEMO_SOURCE);
  state.selectedId=state.blocks.find(b=>b.type==="map")?.id||state.blocks[0]?.id||null;markDirty();renderAll();switchPanel("blocks");
}

function syncDocumentField(key,value){
  state.document[key]=value;markDirty();renderDocument();
}
function newProject(){
  if(state.dirty && !confirm("Há alterações não salvas. Criar um novo projeto mesmo assim?"))return;
  state.projectId=null;state.projectName="Novo material";state.source="";state.blocks=[];state.selectedId=null;
  state.document={title:"Título do material",subtitle:"Subtítulo estratégico",edition:"Edição 2026",brand:"BLACK BELT · LEGISLAÇÃO ESTRATÉGICA",meta:"Material de estudo · revisão orientada para prova",theme:"ponto",showCover:true,showHeader:true,economy:false};
  $("sourceInput").value="";markDirty();renderAll();switchPanel("import");
}

async function api(path,{method="GET",body=null,prefer=""}={}){
  const key=studioKey();
  if(!key)throw new Error("Chave não informada.");
  const headers={
    "apikey":SUPABASE_KEY,
    "Authorization":"Bearer "+SUPABASE_KEY,
    "X-Client-Info":key,
    "Content-Type":"application/json"
  };
  if(prefer)headers["Prefer"]=prefer;
  const res=await fetch(SUPABASE_URL+"/rest/v1/"+path,{method,headers,body:body==null?undefined:JSON.stringify(body)});
  const txt=await res.text();
  if(!res.ok){
    if(res.status===401||res.status===403||txt.toLowerCase().includes("row-level security")){
      localStorage.removeItem("resumo-studio-key");
      throw new Error("chave inválida ou sem permissão");
    }
    throw new Error(txt||("HTTP "+res.status));
  }
  if(!txt)return null;
  try{return JSON.parse(txt)}catch{return txt}
}
function studioKey(){
  let key=localStorage.getItem("resumo-studio-key");
  if(!key){
    key=prompt("Chave do Resumo Studio:")||"";
    if(key)localStorage.setItem("resumo-studio-key",key.trim());
  }
  return key.trim();
}
function dbProjectPayload(){
  return {
    title:state.projectName||"Sem título",
    subtitle:state.document.title||"",
    edition:state.document.edition||"",
    brand:state.document.brand||"",
    theme:state.document.theme||"ponto",
    source_text:state.source||"",
    blocks:state.blocks||[],
    settings:{document:state.document,zoom:state.zoom}
  };
}
async function saveProject(){
  try{
    $("saveBtn").textContent="Salvando…";
    let rows;
    if(!state.projectId){
      rows=await api("editor_projects?select=id",{method:"POST",body:dbProjectPayload(),prefer:"return=representation"});
    }else{
      rows=await api("editor_projects?id=eq."+encodeURIComponent(state.projectId)+"&select=id",{method:"PATCH",body:dbProjectPayload(),prefer:"return=representation"});
    }
    if(!rows?.[0]?.id)throw new Error("o banco não confirmou o salvamento");
    state.projectId=rows[0].id;markSaved();toast("Projeto salvo no banco.");
  }catch(err){toast("Falha ao salvar: "+friendlyError(err),"error")}
  finally{$("saveBtn").textContent="Salvar"}
}
function friendlyError(err){
  const s=String(err?.message||err);
  return s.length>180?s.slice(0,180)+"…":s;
}
async function loadProjectById(id){
  try{
    const rows=await api("editor_projects?id=eq."+encodeURIComponent(id)+"&select=*&limit=1");
    const data=rows?.[0];
    if(!data)throw new Error("Projeto não encontrado ou chave inválida.");
    state.projectId=data.id;
    state.projectName=data.title||"Sem título";
    state.source=data.source_text||"";
    state.blocks=Array.isArray(data.blocks)?data.blocks:[];
    state.document={...state.document,...(data.settings?.document||{}),title:data.settings?.document?.title||data.subtitle||state.document.title};
    state.zoom=data.settings?.zoom||1;
    state.selectedId=state.blocks[0]?.id||null;
    $("sourceInput").value=state.source;
    markSaved();closeModal();renderAll();toast("Projeto aberto.");
  }catch(err){toast("Falha ao abrir: "+friendlyError(err),"error")}
}
async function showProjects(){
  openModal("BIBLIOTECA","Projetos salvos",'<div class="empty-state">Carregando…</div>');
  try{
    const list=await api("editor_projects?select=id,title,subtitle,edition,theme,updated_at&order=updated_at.desc");
    $("modalBody").innerHTML=(list||[]).length?(list||[]).map(p=>
      '<div class="project-card"><div class="project-card-main"><strong>'+esc(p.title)+'</strong><span>'+
      esc(p.subtitle||"")+' · '+new Date(p.updated_at).toLocaleString("pt-BR")+'</span></div><div class="project-card-actions">'+
      '<button class="ui-btn secondary" data-open-project="'+p.id+'">Abrir</button><button class="ui-btn ghost" data-delete-project="'+p.id+'">Excluir</button></div></div>'
    ).join(""):'<div class="empty-state">Nenhum projeto encontrado. Se já houver projetos, confira a chave do Studio.</div>';
  }catch(err){$("modalBody").innerHTML='<div class="empty-state">Não foi possível carregar: '+esc(friendlyError(err))+'</div>'}
}
async function deleteProject(id){
  if(!confirm("Excluir o projeto e todas as versões?"))return;
  try{
    await api("editor_projects?id=eq."+encodeURIComponent(id),{method:"DELETE",prefer:"return=minimal"});
    if(state.projectId===id)newProject();
    toast("Projeto excluído.");showProjects();
  }catch(err){toast(friendlyError(err),"error")}
}
async function showHistory(){
  if(!state.projectId){toast("Salve o projeto primeiro.","error");return}
  openModal("VERSÕES","Histórico editável",'<div class="empty-state">Carregando…</div>');
  try{
    const list=await api("editor_versions?project_id=eq."+encodeURIComponent(state.projectId)+"&select=id,version_number,created_at&order=version_number.desc");
    $("modalBody").innerHTML=(list||[]).length?(list||[]).map(v=>
      '<div class="version-card"><div><strong>Versão '+v.version_number+'</strong><span>'+new Date(v.created_at).toLocaleString("pt-BR")+'</span></div>'+
      '<button class="ui-btn secondary" data-restore-version="'+v.id+'">Restaurar</button></div>'
    ).join(""):'<div class="empty-state">O histórico aparece depois do segundo salvamento.</div>';
  }catch(err){$("modalBody").innerHTML='<div class="empty-state">'+esc(friendlyError(err))+'</div>'}
}
async function restoreVersion(id){
  if(!confirm("Restaurar esta versão? O estado atual será guardado automaticamente como uma nova versão ao atualizar."))return;
  try{
    const rows=await api("editor_versions?id=eq."+encodeURIComponent(id)+"&select=snapshot&limit=1");
    const snap=rows?.[0]?.snapshot;
    if(!snap)throw new Error("Versão não encontrada.");
    const body={
      title:snap.title||"Sem título",subtitle:snap.subtitle||"",edition:snap.edition||"",brand:snap.brand||"",
      theme:snap.theme||"ponto",source_text:snap.source_text||"",blocks:snap.blocks||[],settings:snap.settings||{}
    };
    const updated=await api("editor_projects?id=eq."+encodeURIComponent(state.projectId)+"&select=id",{method:"PATCH",body,prefer:"return=representation"});
    if(!updated?.[0]?.id)throw new Error("Não foi possível restaurar.");
    await loadProjectById(state.projectId);toast("Versão restaurada.");
  }catch(err){toast(friendlyError(err),"error")}
}

function openModal(eyebrow,title,body){
  $("modalEyebrow").textContent=eyebrow;$("modalTitle").textContent=title;$("modalBody").innerHTML=body;
  $("modalBackdrop").classList.remove("hidden");
}
function closeModal(){$("modalBackdrop").classList.add("hidden")}
function showAddBlockModal(){
  openModal("NOVO BLOCO","Adicionar componente",
    '<div class="project-card"><div><strong>Título</strong><span>Hierarquia editorial H1–H5</span></div><button class="ui-btn secondary" data-add-block="heading">Adicionar</button></div>'+
    '<div class="project-card"><div><strong>Texto</strong><span>Lei seca, corpo ou fonte</span></div><button class="ui-btn secondary" data-add-block="text">Adicionar</button></div>'+
    '<div class="project-card"><div><strong>Destaque</strong><span>Ponto de prova, atenção, exemplo</span></div><button class="ui-btn secondary" data-add-block="callout">Adicionar</button></div>'+
    '<div class="project-card"><div><strong>Tabela</strong><span>Comparações e consolidações</span></div><button class="ui-btn secondary" data-add-block="table">Adicionar</button></div>'+
    '<div class="project-card"><div><strong>Mapa tático</strong><span>6 layouts da Macro V43.2</span></div><button class="ui-btn secondary" data-add-block="map">Adicionar</button></div>');
}

function exportPdf(){
  document.querySelectorAll(".render-block.selected").forEach(x=>x.classList.remove("selected"));
  setTimeout(()=>window.print(),60);
}
function restoreLocal(){
  try{
    const raw=localStorage.getItem("resumo-studio-autobackup-v3");if(!raw)return false;
    const data=JSON.parse(raw);
    if(data.blocks?.length && confirm("Há um rascunho local recente. Restaurar?")){
      Object.assign(state,data);$("sourceInput").value=state.source||"";renderAll();return true;
    }
  }catch{}
  return false;
}

function bind(){
  document.querySelectorAll(".panel-tab").forEach(x=>x.addEventListener("click",()=>switchPanel(x.dataset.tab)));
  $("processBtn").addEventListener("click",processSource);$("loadDemoBtn").addEventListener("click",loadDemo);
  $("sourceInput").addEventListener("input",()=>{$("saveStatus").textContent="conteúdo alterado · clique em Formatar";$("saveStatusDot").className="status-dot dirty";});
  $("newProjectBtn").addEventListener("click",newProject);$("projectsBtn").addEventListener("click",showProjects);
  $("historyBtn").addEventListener("click",showHistory);$("saveBtn").addEventListener("click",saveProject);$("exportBtn").addEventListener("click",exportPdf);
  $("addBlockBtn").addEventListener("click",showAddBlockModal);
  $("modalClose").addEventListener("click",closeModal);$("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))closeModal()});

  $("blockList").addEventListener("click",e=>{const row=e.target.closest("[data-select-block]");if(row)selectBlock(row.dataset.selectBlock)});
  $("blocksPreview").addEventListener("click",e=>{const block=e.target.closest("[data-block-id]");if(block)selectBlock(block.dataset.blockId)});

  $("modalBody").addEventListener("click",e=>{
    const add=e.target.closest("[data-add-block]");if(add)addBlock(add.dataset.addBlock);
    const open=e.target.closest("[data-open-project]");if(open)loadProjectById(open.dataset.openProject);
    const del=e.target.closest("[data-delete-project]");if(del)deleteProject(del.dataset.deleteProject);
    const restore=e.target.closest("[data-restore-version]");if(restore)restoreVersion(restore.dataset.restoreVersion);
  });

  $("moveUpBtn").addEventListener("click",()=>moveSelected(-1));$("moveDownBtn").addEventListener("click",()=>moveSelected(1));
  $("deleteBlockBtn").addEventListener("click",deleteSelected);$("duplicateBlockBtn").addEventListener("click",duplicateSelected);

  $("projectTitleTop").addEventListener("input",e=>{state.projectName=e.target.value;markDirty()});
  const docInputs={
    docTitle:"title",docSubtitle:"subtitle",docEdition:"edition",docBrand:"brand",docMeta:"meta"
  };
  Object.entries(docInputs).forEach(([id,key])=>$(id).addEventListener("input",e=>syncDocumentField(key,e.target.value)));
  $("docTheme").addEventListener("change",e=>syncDocumentField("theme",e.target.value));
  $("showCover").addEventListener("change",e=>syncDocumentField("showCover",e.target.checked));
  $("showHeader").addEventListener("change",e=>syncDocumentField("showHeader",e.target.checked));
  $("economyMode").addEventListener("change",e=>syncDocumentField("economy",e.target.checked));

  document.querySelectorAll(".zoom-btn").forEach(btn=>btn.addEventListener("click",()=>{
    state.zoom=Number(btn.dataset.zoom);document.querySelectorAll(".zoom-btn").forEach(x=>x.classList.toggle("active",x===btn));renderDocument();
  }));
  window.addEventListener("beforeunload",e=>{if(state.dirty){e.preventDefault();e.returnValue=""}});
}

bind();
if(!restoreLocal()){
  $("sourceInput").value=DEMO_SOURCE;
  state.source=DEMO_SOURCE;state.blocks=parseAgentOutput(DEMO_SOURCE);
  state.selectedId=state.blocks.find(b=>b.type==="map")?.id||state.blocks[0]?.id||null;
  state.dirty=false;renderAll();
  $("saveStatus").textContent="demonstração";$("saveStatusDot").className="status-dot";
}