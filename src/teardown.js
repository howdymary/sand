const assets = {
  rack: './assets/hardware/etched-rack.webp',
  tray: './assets/hardware/etched-tray.webp',
  chip: './assets/hardware/etched-chip.webp'
};

// These are crops of visible surfaces in the supplied photographs. The empty
// carrier outline is intentionally schematic: it does not depict hidden PCB detail.
export function teardownMarkup() {
  return `<g data-teardown-stage class="teardown-stage" aria-hidden="true" data-phase="rack">
    <defs>
      <image id="__ID__-td-rack-image" href="${assets.rack}" x="0" y="0" width="2525" height="3200" />
      <image id="__ID__-td-tray-image" href="${assets.tray}" x="0" y="0" width="3200" height="1800" />
      <image id="__ID__-td-chip-image" href="${assets.chip}" x="0" y="0" width="3200" height="2562" />
      <clipPath id="__ID__-td-rack-crop"><rect x="820" y="600" width="900" height="2370" /></clipPath>
      <clipPath id="__ID__-td-rack-bay-crop"><rect x="1010" y="1390" width="520" height="350" /></clipPath>
      <clipPath id="__ID__-td-tray-crop"><rect x="1190" y="275" width="820" height="1250" /></clipPath>
      <clipPath id="__ID__-td-chip-crop"><rect x="1120" y="750" width="980" height="1100" rx="12" /></clipPath>
      <clipPath id="__ID__-td-copper-crop">
        <path d="M1350 420H1548V610H1350Z M1655 420H1850V610H1655Z M1355 645H1548V835H1355Z M1655 645H1850V835H1655Z" />
      </clipPath>
      <clipPath id="__ID__-td-tubing-crop">
        <path d="M1260 349L1340 345L1373 392L1459 423L1554 367L1580 390L1500 471L1420 487L1373 590L1340 737L1307 927L1304 1210L1280 1395L1230 1383L1250 1187L1246 934L1275 735L1314 579L1360 462L1291 412Z" />
        <path d="M1940 349L1860 345L1827 392L1741 423L1646 367L1620 390L1700 471L1780 487L1827 590L1860 737L1893 927L1896 1210L1920 1395L1970 1383L1950 1187L1954 934L1925 735L1886 579L1840 462L1909 412Z" />
        <path d="M1375 722L1443 718L1510 741L1558 789L1587 876L1564 976L1470 1078L1412 1161L1390 1278L1364 1395L1299 1392L1335 1260L1360 1135L1417 1042L1500 951L1520 882L1502 823L1462 787L1380 772Z" />
        <path d="M1825 722L1757 718L1690 741L1642 789L1613 876L1636 976L1730 1078L1788 1161L1810 1278L1836 1395L1901 1392L1865 1260L1840 1135L1783 1042L1700 951L1680 882L1698 823L1738 787L1820 772Z" />
      </clipPath>
    </defs>
    <rect class="teardown-paper" x="0" y="110" width="1000" height="610" />
    <g class="teardown-breadcrumb" transform="translate(42 143)">
      <text data-td-crumb="rack" data-active="true" x="0">RACK</text><text class="teardown-separator" x="49">›</text>
      <text data-td-crumb="tray" x="72">TRAY</text><text class="teardown-separator" x="122">›</text>
      <text data-td-crumb="cooling" x="145">COOLING</text><text class="teardown-separator" x="220">›</text>
      <text data-td-crumb="package" x="244">PACKAGE</text>
    </g>
    <g data-td-rack>
      <g transform="translate(315 165) scale(.215) translate(-820 -600)">
        <use href="#__ID__-td-rack-image" clip-path="url(#__ID__-td-rack-crop)" />
        <rect data-td-bay class="teardown-bay" x="1030" y="1390" width="470" height="350" rx="7" />
      </g>
    </g>
    <g data-td-rack-label class="teardown-annotation">
      <path d="M530 367H586" /><text x="603" y="363">One delivered system</text>
      <text class="teardown-annotation-secondary" x="603" y="384">Compute, memory, power, cooling.</text>
    </g>
    <g data-td-compact-detail class="teardown-compact-detail" opacity="0">
      <path class="teardown-detail-link" d="M510 372H550L585 410" />
      <g transform="translate(585 225) scale(1.25) translate(-1010 -1390)">
        <use href="#__ID__-td-rack-image" clip-path="url(#__ID__-td-rack-bay-crop)" />
        <rect class="teardown-detail-frame" x="1010" y="1390" width="520" height="350" />
      </g>
    </g>
    <path data-td-rails class="teardown-rails" d="M450 350L640 430M450 390L640 470" opacity="0"/>
    <g data-td-tray transform="translate(412 372) rotate(90) scale(.105) translate(-1600 -910)" opacity="0">
      <g data-td-base><use href="#__ID__-td-tray-image" clip-path="url(#__ID__-td-tray-crop)" /></g>
      <g data-td-carrier opacity="0" class="teardown-carrier">
        <rect x="1208" y="294" width="774" height="1100" rx="7" />
        <path d="M1237 334H1953M1237 1350H1953" />
      </g>
      <g data-td-copper><use href="#__ID__-td-tray-image" clip-path="url(#__ID__-td-copper-crop)" /></g>
      <g data-td-tubing><use href="#__ID__-td-tray-image" clip-path="url(#__ID__-td-tubing-crop)" /></g>
    </g>
    <g data-td-package opacity="0" transform="translate(565 425) scale(.43) translate(-1600 -1280)">
      <use href="#__ID__-td-chip-image" clip-path="url(#__ID__-td-chip-crop)" />
    </g>
    <g data-td-layer-label class="teardown-annotation" opacity="0">
      <path data-td-layer-line d="M250 334H325" />
      <text data-td-layer-title x="42" y="326">Liquid cooling</text>
      <text data-td-layer-note class="teardown-annotation-secondary" x="42" y="348">Visible tubing and cold plates</text>
    </g>
    <text data-td-caption class="teardown-caption" x="42" y="697">Official hardware photography · explanatory sequence</text>
  </g>`;
}

const clamp = value => Math.max(0, Math.min(1, Number(value) || 0));
const mix = (a, b, progress) => a + (b - a) * progress;
const smooth = (start, end, value) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};
const nearest = (value, stops) => stops.reduce((best, stop) => Math.abs(value - stop) < Math.abs(value - best) ? stop : best, stops[0]);
const fixed = value => Number(value.toFixed(3));
const defaultFrame = { x:0, y:110, width:1000, height:610 };
const rectangle = (x,y,width,height) => ({x,y,width,height});
const union = boxes => {
  const x=Math.min(...boxes.map(box=>box.x)), y=Math.min(...boxes.map(box=>box.y));
  return rectangle(x,y,Math.max(...boxes.map(box=>box.x+box.width))-x,Math.max(...boxes.map(box=>box.y+box.height))-y);
};
const blendFrame = (a,b,t) => Object.fromEntries(['x','y','width','height'].map(key=>[key,mix(a[key],b[key],t)]));
const fitFrame = (box,aspect,padding=28) => {
  let width=box.width+padding,height=box.height+padding;
  if (width/height<aspect) width=height*aspect; else height=width/aspect;
  return rectangle(box.x+box.width/2-width/2,box.y+box.height/2-height/2,width,height);
};
// Transform the crop corners, rather than getBBox(): SVG use/image bounding
// boxes include the entire native photograph even when it has a clip path.
const cropBounds = (crop, parent, child={}) => {
  const radians=degrees=>degrees*Math.PI/180;
  const turn=radians(parent.rotate), childTurn=radians(child.rotate||0), skew=Math.tan(radians(parent.skew||0));
  const points=[];
  for (const x of [crop.x,crop.x+crop.width]) for (const y of [crop.y,crop.y+crop.height]) {
    let px=x,py=y;
    if (child.rotate) {
      const ox=child.ox??1600,oy=child.oy??910,dx=px-ox,dy=py-oy;
      px=ox+dx*Math.cos(childTurn)-dy*Math.sin(childTurn);
      py=oy+dx*Math.sin(childTurn)+dy*Math.cos(childTurn);
    }
    px+=(child.x||0); py+=(child.y||0);
    let dx=(px-1600)*parent.sx,dy=(py-910)*parent.sy;
    dx+=skew*dy;
    points.push({x:parent.x+dx*Math.cos(turn)-dy*Math.sin(turn),y:parent.y+dx*Math.sin(turn)+dy*Math.cos(turn)});
  }
  const left=Math.min(...points.map(point=>point.x)),top=Math.min(...points.map(point=>point.y));
  return rectangle(left,top,Math.max(...points.map(point=>point.x))-left,Math.max(...points.map(point=>point.y))-top);
};

export function createTeardown(svg) {
  const stage = svg.querySelector('[data-teardown-stage]');
  if (!stage) throw new Error('teardownMarkup() must be added to the SVG before createTeardown().');
  const find = part => stage.querySelector(`[data-td-${part}]`);
  const parts = Object.fromEntries(['rack', 'bay', 'rack-label', 'compact-detail', 'rails', 'tray', 'base', 'carrier', 'copper', 'tubing', 'package', 'layer-label', 'layer-title', 'layer-note', 'layer-line', 'caption'].map(part => [part, find(part)]));
  let visible = true;
  let compact = false;
  let canvasAspect = 1000/610;
  let state = { chapter: 0, progress: 0, phase: 'rack', architectureMix: 0 };
  const opacity = (part, value) => parts[part].setAttribute('opacity', fixed(clamp(value)));
  const transform = (part, value) => parts[part].setAttribute('transform', value);

  function setPosition(chapter, progress = 0, reducedMotion = false) {
    const chapterIndex = Number(chapter) || 0;
    let p = clamp(progress);
    if (reducedMotion) {
      p = chapterIndex <= 0 ? nearest(p, [0, .2, .55, 1]) : chapterIndex === 1 ? nearest(p, [0, .32, .72, 1]) : nearest(p, [0, .4, 1]);
    }
    const first = chapterIndex <= 0;
    const second = chapterIndex === 1;
    const extraction = first ? p : 1;
    const separation = first ? 0 : second ? p : 1;
    const slide = smooth(.18, .62, extraction);
    const turn = smooth(.58, .97, extraction);
    const rackRetreat = smooth(.32, .94, extraction);
    const cx = mix(mix(412, 635, slide), 565, turn);
    const cy = mix(mix(372, 455, slide), 425, turn);
    const scaleY = mix(mix(.08, .25, slide), .385, turn);
    const scaleX = mix(mix(.045, .12, slide), .385, turn);
    const rotate = mix(-90, compact ? -90 : 0, turn);
    const skew = mix(-12,0,turn);
    transform('rack', `translate(${fixed(-75 * rackRetreat)} 0)`);
    opacity('rack', 1 - (compact ? smooth(.30,.65,extraction) : rackRetreat));
    opacity('bay', smooth(.02, .16, extraction) * (1 - smooth(.43, .72, extraction)));
    opacity('rack-label', 1 - smooth(.12, .38, extraction));
    opacity('compact-detail', compact ? 1-smooth(.24,.5,extraction) : 0);
    opacity('rails', smooth(.18,.34,extraction) * (1-smooth(.58,.88,extraction)));
    const railStart = 460 - 75*rackRetreat;
    const railEnd = cx-635*scaleY;
    parts.rails.setAttribute('d',`M${fixed(railStart)} 348L${fixed(railEnd)} ${fixed(cy-410*scaleX)}M${fixed(railStart)} 392L${fixed(railEnd)} ${fixed(cy+410*scaleX)}`);
    transform('tray', `translate(${fixed(cx)} ${fixed(cy)}) rotate(${fixed(rotate)}) skewX(${fixed(skew)}) scale(${fixed(scaleX)} ${fixed(scaleY)}) translate(-1600 -910)`);
    opacity('tray', smooth(.16, .28, extraction) * (1 - smooth(compact ? .64 : .69, compact ? .82 : .96, separation)));

    const tubingLift = smooth(.04, .38, separation);
    const copperLift = smooth(.32, .73, separation);
    transform('tubing', `translate(${fixed(-365 * tubingLift)} ${fixed(-115 * tubingLift)}) rotate(${fixed(-8 * tubingLift)} 1600 910)`);
    opacity('tubing', 1 - smooth(.64, .88, separation));
    transform('copper', `translate(${fixed(330 * copperLift)} ${fixed(-115 * copperLift)}) rotate(${fixed(6 * copperLift)} 1600 680)`);
    opacity('copper', 1 - smooth(.73, .97, separation));
    opacity('base', (1 - .65*smooth(.04,.32,separation)) * (1-smooth(.64,.88,separation)));
    opacity('carrier', smooth(.07, .28, separation) * (1 - smooth(.61, .88, separation)) * .15);

    const packageReveal = smooth(compact ? .52 : .58, compact ? .82 : .97, separation);
    opacity('package', packageReveal);
    const packageScale = mix(.29, .43, packageReveal);
    transform('package', `translate(565 ${fixed(mix(460, 425, packageReveal))}) scale(${fixed(packageScale)}) translate(-1600 -1280)`);
    const layerLabel = smooth(.04, .16, separation) * (1 - smooth(.84, 1, separation));
    opacity('layer-label', layerLabel);
    const platePhase = separation > .38;
    parts['layer-title'].textContent = platePhase ? 'Heat leaves the package' : 'Liquid cooling';
    parts['layer-note'].textContent = platePhase ? 'Photographed cold-plate surfaces' : 'Photographed tubing surfaces';
    parts['layer-line'].setAttribute('d', platePhase ? 'M250 334H337' : 'M250 334H325');
    const phase = first ? (p < .22 ? 'rack' : 'tray') : second ? (p < .76 ? 'cooling' : 'package') : 'package';
    stage.setAttribute('data-phase', phase);
    stage.querySelectorAll('[data-td-crumb]').forEach(crumb => crumb.setAttribute('data-active', String(crumb.getAttribute('data-td-crumb') === phase)));
    parts.caption.textContent = first && p < .2 ? 'Official hardware photography · start at the delivered system' : separation > .05 && separation < .96 ? 'Visible photo regions separated for explanation; hidden board detail is not depicted.' : 'Official hardware photography · explanatory sequence';
    const architectureMix = chapterIndex < 2 ? 0 : chapterIndex === 2 ? smooth(.04, .38, p) : 1;
    let hardwareBounds=null,viewBox=null;
    const parent={x:cx,y:cy,sx:scaleX,sy:scaleY,rotate,skew};
    const trayBounds=cropBounds(rectangle(1190,275,820,1250),parent);
    const chipCrop=compact ? rectangle(1120,750,980,1100) : rectangle(1155,770,890,1030);
    const chipBounds=rectangle(565+(chipCrop.x-1600)*packageScale,mix(460,425,packageReveal)+(chipCrop.y-1280)*packageScale,chipCrop.width*packageScale,chipCrop.height*packageScale);
    if (compact) {
      const openingFrame=rectangle(225,150,1030,550);
      if (first) {
        // Rack and detail have disappeared before the camera closes around the
        // extracted tray, so zooming never clips the still-visible full rack.
        hardwareBounds=blendFrame(openingFrame,trayBounds,smooth(.65,1,p));
      } else if (second) {
        const coolingFrame=rectangle(270,180,550,570);
        const startFrame=blendFrame(trayBounds,coolingFrame,smooth(0,.38,p));
        hardwareBounds=p<.82 ? startFrame : blendFrame(coolingFrame,chipBounds,smooth(.82,1,p));
        const visibleBounds=[];
        if (p<.82) {
          if (p<.88) visibleBounds.push(trayBounds);
          if (p<.88) visibleBounds.push(cropBounds(rectangle(1230,345,740,1050),parent,{x:-365*tubingLift,y:-115*tubingLift,rotate:-8*tubingLift}));
          if (p<.97) visibleBounds.push(cropBounds(rectangle(1350,420,500,415),parent,{x:330*copperLift,y:-115*copperLift,rotate:6*copperLift,oy:680}));
        }
        if (packageReveal>0) visibleBounds.push(chipBounds);
        hardwareBounds=union([hardwareBounds,...visibleBounds]);
      } else hardwareBounds=chipBounds;
    } else {
      if (first) {
        const rackBounds=rectangle(315-75*rackRetreat,165,900*.215,2370*.215);
        const openingBounds=union([rackBounds,trayBounds]);
        // The complete rack stays inside the frame until it is invisible.
        // The last part of the pull-in then follows the tray alone.
        hardwareBounds=blendFrame(openingBounds,trayBounds,smooth(.94,1,p));
      } else if (second) {
        const tubingBounds=cropBounds(rectangle(1230,345,740,1050),parent,{x:-365*tubingLift,y:-115*tubingLift,rotate:-8*tubingLift});
        const copperBounds=cropBounds(rectangle(1350,420,500,415),parent,{x:330*copperLift,y:-115*copperLift,rotate:6*copperLift,oy:680});
        const assemblyBounds=union([trayBounds,tubingBounds,copperBounds,...(packageReveal>0 ? [chipBounds] : [])]);
        // Follow actual transformed photo regions during separation. Once the
        // tubing and base have faded, close the camera around the package;
        // still-visible cold plates remain included until their parent fades.
        const focus=blendFrame(assemblyBounds,chipBounds,smooth(.88,1,p));
        const plateFrame=p<.96 ? copperBounds : blendFrame(copperBounds,chipBounds,smooth(.96,1,p));
        hardwareBounds=union([focus,plateFrame,...(packageReveal>0 ? [chipBounds] : [])]);
      } else hardwareBounds=chipBounds;
    }
    const camera=blendFrame(fitFrame(hardwareBounds,canvasAspect,compact ? 28 : 16),defaultFrame,architectureMix);
    viewBox=['x','y','width','height'].map(key=>fixed(camera[key])).join(' ');
    stage.setAttribute('data-compact',String(compact));
    stage.setAttribute('data-framed','true');
    stage.setAttribute('opacity', fixed(1 - architectureMix));
    stage.setAttribute('data-reduced-motion', String(Boolean(reducedMotion)));
    stage.style.display = visible && architectureMix < 1 ? '' : 'none';
    state = { chapter: chapterIndex, progress: p, phase, architectureMix, viewBox, hardwareBounds };
    return { ...state };
  }

  function setVisible(value) {
    visible = Boolean(value);
    stage.style.display = visible && state.architectureMix < 1 ? '' : 'none';
  }
  function setCompact(value,aspect=1000/610) {
    compact=Boolean(value);
    const next=Number(aspect);
    canvasAspect=Number.isFinite(next) && next>0 ? Math.max(.2,Math.min(6,next)) : 1000/610;
  }
  setPosition(0, 0, false);
  return { setPosition, setVisible, setCompact, getState: () => ({ ...state }), element: stage };
}
