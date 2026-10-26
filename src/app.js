import { chapters, components, sources } from './content.js?v=20261026-join-1';
import { createScene } from './scene.js?v=20261026-join-1';
import { essay } from './essay.js?v=20261026-join-1';

const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const smallScreen = matchMedia('(max-width: 760px)');
const state = { chapter:-1, selected:null, paused:reducedMotion.matches, fault:false, hardware:true, progress:0, lastTrigger:null };
const escapeHTML = (s) => String(s).replace(/[&<>"']/g,(c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const originalPhotos = {
  0:'https://cdn.sanity.io/images/rwbees58/production/f1facc083ac390c9607940c12b1eb64d3e387544-2525x3200.png',
  1:'https://cdn.sanity.io/images/rwbees58/production/5465c0a1c0301168e9aa18acb49febce0dc7c358-3200x1800.png',
  2:'https://cdn.sanity.io/images/rwbees58/production/144906a8cf416b08acc145128d2bdd4900b42783-13700x10969.jpg',
  8:'https://www.etched.com/media-kit'
};
const sectionLabels = ['Workload','Requirements','Architecture','RTL','Verification','Layout','Organization','AI tools','Deployment'];

const paragraphHTML = paragraphs => paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('');
$('essay').innerHTML = `<header class="essay-intro"><div class="eyebrow">${escapeHTML(essay.kicker)}</div><h1 class="essay-title" id="essay-title">${escapeHTML(essay.title)}</h1><p class="essay-deck">${escapeHTML(essay.deck)}</p>${paragraphHTML(essay.introduction)}</header>` + essay.sections.map(section => `<section class="essay-section" id="${escapeHTML(section.id)}" data-essay-chapter="${section.chapter}" aria-labelledby="essay-heading-${section.chapter}"><div class="eyebrow">${String(section.chapter+1).padStart(2,'0')} / ${escapeHTML(sectionLabels[section.chapter])}</div><h2 id="essay-heading-${section.chapter}">${escapeHTML(section.title)}</h2>${paragraphHTML(section.paragraphs)}</section>`).join('');
// The closing deployment section leaves the illustrated two-column reading flow.
const deploymentSection = document.getElementById('rack-scale');
deploymentSection.classList.add('essay-deployment', 'essay-column');
const deploymentCopy = document.createElement('div');
deploymentCopy.className='deployment-copy';
deploymentCopy.append(...deploymentSection.childNodes);
deploymentSection.append(deploymentCopy);
const joinSection=document.createElement('section');
joinSection.id=essay.join.id;
joinSection.className='essay-join';
joinSection.setAttribute('aria-labelledby','join-title');
joinSection.innerHTML=`<div class="eyebrow">${escapeHTML(essay.join.kicker)}</div><h2 id="join-title">${escapeHTML(essay.join.title)}</h2><div class="join-copy">${paragraphHTML(essay.join.paragraphs)}</div><a class="join-action" href="${escapeHTML(essay.join.action.url)}" target="_blank" rel="noopener noreferrer" aria-label="Explore open roles at Etched">${escapeHTML(essay.join.action.label)}<span aria-hidden="true">↗</span></a>`;
deploymentCopy.append(joinSection);
document.querySelector('.essay-layout').append(deploymentSection);
document.title = essay.title;
const essaySections = [...document.querySelectorAll('[data-essay-chapter]')];
const compactLayout = matchMedia('(max-width: 900px)');

$('source-links').innerHTML = sources.map((source) => `<li><a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.label)}</a></li>`).join('');

const scene = createScene($('scene'),{onSelect:selectComponent,onHover:showTooltip,onLeave:hideTooltip});
// The explorer supplies its own chapter labels; frame the actual diagram more closely.
scene.setPlaying(!state.paused);

function hideTooltip() { $('component-tooltip').hidden = true; }
function showTooltip(id,event) {
  if (smallScreen.matches || state.selected || !components[id]) return;
  const item=components[id];
  $('tooltip-title').textContent=item.name;
  $('tooltip-description').textContent=item.description;
  const tooltip=$('component-tooltip'); tooltip.hidden=false;
  const target=event?.target?.closest?.('[data-component]') || event?.target;
  const rect=target?.getBoundingClientRect?.();
  const x=event?.clientX || rect?.right || innerWidth/2;
  const y=event?.clientY || rect?.top || innerHeight/2;
  const box=tooltip.getBoundingClientRect();
  let left=x+19,top=y-box.height-14;
  if (left+box.width>innerWidth-12) left=x-box.width-19;
  if (top<85) top=y+22;
  tooltip.style.left=`${Math.max(12,Math.min(left,innerWidth-box.width-12))}px`;
  tooltip.style.top=`${Math.max(84,Math.min(top,innerHeight-box.height-12))}px`;
}

function selectComponent(id) {
  const item=components[id]; if (!item) return;
  state.lastTrigger=document.activeElement;
  state.selected=id; hideTooltip();
  $('inspector-type').textContent=item.type;
  $('inspector-title').textContent=item.name;
  $('inspector-description').textContent=item.description;
  $('inspector-facts').replaceChildren();
  for (const [label,key] of [['Purpose','why'],['Inputs','inputs'],['Outputs','outputs'],['Tradeoff','tradeoff']]) {
    if (!item[key]) continue;
    const dt=document.createElement('dt'); dt.textContent=label;
    const dd=document.createElement('dd'); dd.textContent=item[key];
    $('inspector-facts').append(dt,dd);
  }
  $('inspector').hidden=false;
  $('visual-explorer').classList.add('has-inspector');
  scene.selectComponent(id);
  $('inspector').focus({preventScroll:true});
  document.querySelectorAll('[data-component-link]').forEach((button) => button.setAttribute('aria-pressed',String(button.dataset.componentLink===id)));
  $('view-announcement').textContent=`Selected ${item.name}. Component details are open.`;
}

function closeInspector(restore=false) {
  $('inspector').hidden=true;
  $('visual-explorer').classList.remove('has-inspector');
  state.selected=null; scene.selectComponent(null);
  document.querySelectorAll('[data-component-link]').forEach((button) => button.setAttribute('aria-pressed','false'));
  if (restore && state.lastTrigger?.isConnected) state.lastTrigger.focus({preventScroll:true});
}

function activateChapter(index,progress=0) {
  if (state.chapter!==index) {
    state.chapter=index; closeInspector(); hideTooltip();
    if (index===8) {
      $('view-announcement').textContent=essay.sections[index].title;
      state.progress=progress;
      return;
    }
    const chapter=chapters[index];
    $('view-kicker').textContent=chapter.kicker.replace(/^\d+\s*\/\s*/,'');
    $('view-title').textContent=chapter.title;
    $('view-caption').textContent=chapter.caption;
    $('fault-toggle').hidden=index!==4;
    updateViewMode();
    $('component-strip').innerHTML=chapter.componentIds.map((id) => `<button type="button" class="component-chip" data-component-link="${id}" aria-pressed="false">${escapeHTML(components[id]?.name || id)}</button>`).join('');
    $('component-strip').scrollLeft=0;
    $('view-announcement').textContent=`${chapter.title}. ${chapter.caption}`;
  }
  state.progress = progress;
  if (index!==8) scene.setChapter(index,progress);
}

let scrollFrame=0;
function readingTop() {
  return document.querySelector('.site-header').getBoundingClientRect().height + (compactLayout.matches ? 24 : 55);
}
function updateOnScroll() {
  scrollFrame=0;
  const readingLine = readingTop();
  let active = 0;
  for (const section of essaySections) {
    if (section.getBoundingClientRect().top <= readingLine + 25) active=Number(section.dataset.essayChapter);
  }
  const section = essaySections[active];
  const rect = section.getBoundingClientRect();
  const progress = Math.max(0,Math.min(1,(readingLine-rect.top)/Math.max(1,rect.height)));
  activateChapter(active,progress);
  // Measure the section shell, which stays fixed in document flow while its
  // inner copy settles into place. The same scroll position reverses the exit.
  const closingTop=deploymentSection.getBoundingClientRect().top;
  const fadeStart=innerHeight*(compactLayout.matches ? .88 : .82);
  const fadeEnd=compactLayout.matches ? Math.max(readingLine+25,innerHeight*.56) : readingLine+40;
  const linear=Math.max(0,Math.min(1,(fadeStart-closingTop)/Math.max(1,fadeStart-fadeEnd)));
  const exit=reducedMotion.matches ? Number(closingTop<=fadeEnd) : linear*linear*(3-2*linear);
  const visual=$('visual-column');
  const hideVisual=exit>=1;
  const visibilityChanged=visual.hidden!==hideVisual;
  visual.hidden=hideVisual;
  visual.inert=hideVisual;
  visual.setAttribute('aria-hidden',String(hideVisual));
  visual.style.setProperty('--visual-opacity',String(1-exit));
  visual.style.setProperty('--visual-offset',`${-24*exit}px`);
  visual.dataset.closingProgress=exit.toFixed(3);
  // Keep the outgoing panel above the closing section instead of allowing its
  // sticky/fixed canvas to overlap the full-width copy during the fade.
  const panelRect=visual.getBoundingClientRect();
  const clip=hideVisual ? 0 : Math.min(panelRect.height,Math.max(0,panelRect.bottom-closingTop));
  visual.style.setProperty('--visual-clip',`${clip}px`);
  deploymentSection.style.setProperty('--deployment-opacity',String(reducedMotion.matches ? 1 : .6+.4*exit));
  deploymentSection.style.setProperty('--deployment-offset',`${16*(1-exit)}px`);
  if (visibilityChanged) scene.setPlaying(!state.paused && !hideVisual);
  const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
  $('journey-progress').style.transform=`scaleX(${Math.min(1,scrollY/max)})`;
}
function scheduleScroll() { if (!scrollFrame) scrollFrame=requestAnimationFrame(updateOnScroll); }
function goToSection(section,instant=false) {
  window.scrollTo({top:Math.max(0,scrollY+section.getBoundingClientRect().top-readingTop()),behavior:instant || reducedMotion.matches?'instant':'smooth'});
  history.replaceState(null,'',`#${section.id}`);
}
window.addEventListener('scroll',scheduleScroll,{passive:true});
window.addEventListener('resize',scheduleScroll,{passive:true});
document.addEventListener('click',(event) => {
  const componentButton=event.target.closest('[data-component-link]');
  if (componentButton) selectComponent(componentButton.dataset.componentLink);
});
$('inspector-close').addEventListener('click',() => closeInspector(true));
document.addEventListener('keydown',(event) => { if (event.key==='Escape') { hideTooltip(); closeInspector(true); } });

function updateMotionButton() {
  $('motion-toggle').disabled=reducedMotion.matches;
  $('motion-label').textContent=reducedMotion.matches?'Motion off':state.paused?'Play':'Pause';
  $('motion-icon').textContent=reducedMotion.matches?'○':state.paused?'▷':'Ⅱ';
  $('motion-toggle').setAttribute('aria-label',reducedMotion.matches?'Animation is off to respect your reduced motion preference':state.paused?'Play diagram animation':'Pause diagram animation');
  $('motion-toggle').setAttribute('aria-pressed',String(state.paused));
}
$('motion-toggle').addEventListener('click',() => { state.paused=!state.paused; scene.setPlaying(!state.paused && !$('visual-column').hidden); updateMotionButton(); });
reducedMotion.addEventListener('change',() => { state.paused=reducedMotion.matches; scene.setPlaying(!state.paused && !$('visual-column').hidden); updateMotionButton(); scheduleScroll(); });
function hasHardwareView() { return [0,1,2,8].includes(state.chapter); }
function updateViewMode() {
  const hardware = hasHardwareView() && state.hardware;
  $('view-mode-switch').hidden = !hasHardwareView();
  $('hardware-mode').setAttribute('aria-pressed',String(state.hardware));
  $('diagram-mode').setAttribute('aria-pressed',String(!state.hardware));
  $('view-medium').textContent = hardware ? state.chapter<3 ? 'PHOTO-REFERENCED 3D RECONSTRUCTION' : 'HARDWARE PHOTOGRAPHY · ETCHED' : 'CONCEPTUAL DIAGRAM';
  $('motion-toggle').hidden = hardware;
  $('photo-original').hidden = !hardware;
  if (originalPhotos[state.chapter]) $('photo-original').href = originalPhotos[state.chapter];
  $('photo-original').textContent = state.chapter===8 ? 'Original photos ↗' : 'View original ↗';
  scene.setHardwareMode(state.hardware);
  updateHint();
}
function updateHint() {
  const hardware = hasHardwareView() && state.hardware;
  $('explore-hint').textContent = hardware ? state.chapter<3 ? 'Scroll to move inward · reverse to retrace' : 'Select a component below to inspect' : smallScreen.matches?'Tap a component to inspect':'Hover to inspect · click to focus';
}
for (const [id,value] of [['hardware-mode',true],['diagram-mode',false]]) {
  $(id).addEventListener('click',() => {
    closeInspector(); hideTooltip(); state.hardware=value; updateViewMode();
    $('view-announcement').textContent = value ? 'Scroll-controlled reconstruction using official hardware photographs.' : 'Conceptual engineering diagram.';
  });
}
smallScreen.addEventListener('change',updateHint);
$('components-toggle').addEventListener('click',() => {
  const open=$('visual-explorer').classList.toggle('components-open');
  $('components-toggle').setAttribute('aria-expanded',String(open));
  $('components-toggle').textContent=open?'Inspect −':'Inspect +';
  scheduleScroll();
});
$('fault-toggle').addEventListener('click',() => {
  state.fault=!state.fault; scene.setVerificationFault(state.fault);
  $('fault-toggle').setAttribute('aria-pressed',String(state.fault));
  $('fault-toggle').textContent=state.fault?'Restore expected behavior':'Introduce a mismatch';
  $('view-announcement').textContent=state.fault?'Illustrative mismatch detected.':'The illustrative implementation matches expected behavior.';
});
$('sources-open').addEventListener('click',() => { hideTooltip(); $('sources-dialog').showModal(); });
$('sources-close').addEventListener('click',() => $('sources-dialog').close());
$('sources-dialog').addEventListener('click',(event) => { if (event.target===$('sources-dialog')) { const r=$('sources-dialog').getBoundingClientRect(); if (event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) $('sources-dialog').close(); } });
document.addEventListener('visibilitychange',() => scene.setPlaying(!state.paused && !$('visual-column').hidden && !document.hidden));
updateMotionButton(); updateHint(); updateOnScroll();
function sectionForHash(hash) {
  const sectionHash=hash==='#quantization'?'#architecture':hash;
  return [...essaySections,joinSection].find(section=>`#${section.id}`===sectionHash);
}
window.addEventListener('hashchange',() => {
  const section=sectionForHash(location.hash);
  if (section) { goToSection(section,true); updateOnScroll(); }
});
if (location.hash) {
  const initialSection=sectionForHash(location.hash);
  const alignInitialSection=() => {
    if (initialSection && sectionForHash(location.hash)===initialSection) { goToSection(initialSection,true); updateOnScroll(); }
  };
  alignInitialSection();
  // The browser can restore its fragment position after module initialization.
  if (document.readyState!=='complete') window.addEventListener('load',alignInitialSection,{once:true});
}
