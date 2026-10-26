import { teardownMarkup, createTeardown } from './teardown.js?v=20261026-flow-1';
import { organizationScene } from './organization.js?v=20261026-flow-1';
import { createHardwareRenderer } from './hardware-renderer.js?v=20261026-flow-1';

let sceneSequence = 0;

const point = (x, y) => `${x},${y}`;
const text = (x, y, value, cls = 'scene-label', anchor = 'start') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${value}</text>`;
const line = (d, cls = 'scene-wire', attrs = '') => `<path d="${d}" class="${cls}" ${attrs}/>`;
const rect = (x, y, w, h, cls, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="${cls}"/>`;
const comp = (id, label, markup, extra = '') => `<g class="scene-component ${extra}" data-component="${id}" tabindex="-1" role="button" aria-label="${label}">${markup}</g>`;
const tag = (x, y, value) => `<g>${rect(x, y - 19, value.length * 8.1 + 22, 28, 'scene-tag', 3)}${text(x + 11, y, value, 'scene-mono scene-tag-label')}</g>`;
const dot = (x, y, r = 4, cls = 'scene-node') => `<circle cx="${x}" cy="${y}" r="${r}" class="${cls}"/>`;
const flow = (d, id = '', cls = '') => `${line(d, `scene-flow ${cls}`, id ? `id="__ID__-${id}"` : '')}${id ? `<circle r="5" class="scene-particle" data-path="__ID__-${id}"/>` : ''}`;
const arrow = (d, cls = 'scene-arrow') => line(d, cls, 'marker-end="url(#__ID__-arrow)"');
const hint = (x, y) => `<g class="scene-inspect-mark">${dot(x, y, 10, 'scene-inspect-dot')}${line(`M${x - 4} ${y}h8 M${x} ${y - 4}v8`, 'scene-inspect-plus')}</g>`;
const smallCells = (x, y, cols, rows, cellW, cellH, gap = 4, cls = 'scene-cell') => Array.from({ length: cols * rows }, (_, i) => rect(x + (i % cols) * (cellW + gap), y + Math.floor(i / cols) * (cellH + gap), cellW, cellH, `${cls} ${i % 9 === 2 ? 'scene-cell-accent' : ''}`, 1)).join('');

function title(number, label, detail) {
  return `<g class="scene-topline">${text(55, 59, `${String(number).padStart(2, '0')} / ${label.toUpperCase()}`, 'scene-mono scene-eyebrow')}${text(55, 92, detail, 'scene-subtitle')}</g>`;
}
function bottom(left, right = 'CONCEPTUAL · NOT AN ETCHED FLOORPLAN') {
  return `<g class="scene-footline">${line('M55 731H945', 'scene-hairline')}${text(55, 760, left, 'scene-mono scene-caption')}${text(945, 760, right, 'scene-mono scene-caption', 'end')}</g>`;
}
function blade(x, y, w = 236, h = 38, index = 0) {
  return `<g>${rect(x, y, w, h, 'scene-rack-blade', 2)}${rect(x + 8, y + 8, 4, h - 16, index % 3 === 0 ? 'scene-accent-fill' : 'scene-sage-fill', 1)}${smallCells(x + 26, y + 9, 9, 2, 5, 7, 3, 'scene-vent')}${rect(x + w - 62, y + 10, 28, h - 20, 'scene-blade-port', 2)}${dot(x + w - 16, y + h / 2, 3, 'scene-status')}${line(`M${x + 15} ${y + h - 3}H${x + w - 12}`, 'scene-rack-seam')}</g>`;
}
function rack(x, y, scale = 1, options = {}) {
  const depth = options.depth ?? 42;
  const width = options.width ?? 280;
  const height = 490;
  const fill = options.muted ? 'scene-rack-side scene-rack-muted' : 'scene-rack-side';
  return `<g transform="translate(${x} ${y}) scale(${scale})" class="${options.muted ? 'scene-quiet-rack' : ''}">
    <path d="M0 0L${depth} -25H${width + depth}L${width} 0Z" class="scene-rack-top"/>
    <path d="M${width} 0L${width + depth} -25V${height - 25}L${width} ${height}Z" class="${fill}"/>
    ${rect(0, 0, width, height, 'scene-rack-frame', 3)}${rect(13, 17, width - 26, height - 35, 'scene-rack-face', 2)}
    ${Array.from({ length: 8 }, (_, i) => blade(22, 58 + i * 44, width - 44, 38, i)).join('')}
    ${rect(22, 22, width - 44, 26, 'scene-rack-header', 2)}${text(35, 41, 'INFERENCE SYSTEM', 'scene-mono scene-rack-small')}${dot(width - 38, 35, 3, 'scene-status')}
    ${Array.from({ length: 5 }, (_, i) => { const cx = 49 + i * 44; return `<circle cx="${cx}" cy="441" r="15" class="scene-fan-ring"/><path d="M${cx} 428v26 M${cx - 13} 441h26 M${cx - 9} 432l18 18 M${cx + 9} 432l-18 18" class="scene-fan-spokes"/>`; }).join('')}
    ${Array.from({ length: 9 }, (_, i) => `${dot(7, 36 + i * 49, 1.8, 'scene-rack-screw')}${dot(width - 7, 36 + i * 49, 1.8, 'scene-rack-screw')}`).join('')}
    ${rect(19, height, 25, 10, 'scene-rack-foot', 1)}${rect(width - 44, height, 25, 10, 'scene-rack-foot', 1)}
  </g>`;
}
function memoryStack(x, y, label = 'HBM', scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">${Array.from({ length: 5 }, (_, i) => { const yy = 16 - i * 5; return `<path d="M0 ${yy}L15 ${yy - 9}H82L67 ${yy}Z" class="scene-hbm-top"/><path d="M0 ${yy}H67V${yy + 16}H0Z" class="scene-hbm-front"/><path d="M67 ${yy}L82 ${yy - 9}V${yy + 7}L67 ${yy + 16}Z" class="scene-hbm-side"/>`; }).join('')}${text(33, 3, label, 'scene-mono scene-hbm-label', 'middle')}</g>`;
}
function die(x, y, width = 260, height = 260) {
  return `<g>${rect(x - 7, y - 7, width + 14, height + 14, 'scene-die-rim', 2)}${rect(x, y, width, height, 'scene-die', 1)}${smallCells(x + 18, y + 18, 5, 5, (width - 60) / 5, (height - 60) / 5, 6)}${rect(x + 70, y + 70, width - 105, height - 105, 'scene-compute-mini', 2)}${line(`M${x + 16} ${y + height - 34}H${x + width - 16} M${x + 34} ${y + 16}V${y + height - 16}`, 'scene-die-route')}</g>`;
}
function rackOpening() {
  return `${title(1, 'The system', 'A response starts with a system of decisions.')}
    <ellipse cx="544" cy="698" rx="271" ry="24" class="scene-ground"/>
    ${rack(158, 273, 0.66, { muted: true })}
    ${comp('rack', 'Explore the inference server rack', rack(397, 187, 1), '')}
    ${comp('cooling', 'Explore power and cooling', `<path d="M728 249V642M749 249V642" class="scene-cooling-pipe"/>${line('M728 272H706 M728 360H706 M728 448H706 M728 536H706 M728 624H706', 'scene-cooling-branch')}${text(774, 269, 'COOLING', 'scene-mono scene-muted')}${text(774, 295, '&amp; POWER', 'scene-mono scene-muted')}${hint(740, 658)}`)}
    ${comp('links', 'Explore the network and chip links', `${flow('M90 379H348Q370 379 370 402V413H419', 'request')}${text(86, 339, 'AI request', 'scene-large-label')}${text(86, 365, 'Application → serving system', 'scene-body-label')}${flow('M419 500H374Q352 500 352 524H90', 'response')}${text(86, 563, 'Generated tokens', 'scene-large-label')}${text(86, 589, 'The experience people see', 'scene-body-label')}`)}
    ${line('M543 158V127H807', 'scene-callout')}${text(814, 132, 'Many chips. One service.', 'scene-body-label')}
    ${hint(668, 214)}${bottom('EXPLORE THE RACK, THEN FOLLOW ONE CHIP', 'ILLUSTRATIVE SYSTEM')}`;
}
function packageScene() {
  return `${title(2, 'The package', 'Compute and memory meet at the package.')}
    <ellipse cx="500" cy="632" rx="368" ry="25" class="scene-ground"/>
    <path d="M125 273L205 223H870L790 273Z" class="scene-substrate-top"/>
    <path d="M125 273H790V587H125Z" class="scene-substrate"/>
    <path d="M790 273L870 223V537L790 587Z" class="scene-substrate-side"/>
    ${smallCells(143, 558, 31, 1, 13, 9, 7, 'scene-package-pad')}
    ${line('M183 303H753 M183 330H753 M183 503H753 M183 530H753', 'scene-package-trace')}
    ${comp('hbm', 'Explore high-bandwidth memory alongside the compute die', `${memoryStack(185, 329, 'HBM', 1.28)}${memoryStack(185, 443, 'HBM', 1.28)}${memoryStack(674, 329, 'HBM', 1.28)}${memoryStack(674, 443, 'HBM', 1.28)}${hint(225, 479)}`)}
    ${comp('compute', 'Explore the compute die', `${die(365, 292, 266, 238)}${text(498, 418, 'COMPUTE DIE', 'scene-mono scene-die-label', 'middle')}${hint(600, 506)}`)}
    ${flow('M291 352H349', 'hbm-in')}${flow('M654 465H647', 'hbm-out')}
    ${line('M234 286V176H86', 'scene-callout')}${text(85, 158, 'High-bandwidth memory', 'scene-large-label')}${text(85, 186, 'Separate stacks alongside the die', 'scene-body-label')}
    ${line('M516 553V653H726', 'scene-callout')}${text(735, 648, 'Package substrate', 'scene-large-label')}${text(735, 675, 'Connects the components', 'scene-body-label')}
    ${bottom('HBM HOLDS DATA · THE DIE PERFORMS COMPUTATION')}`;
}
function architectureScene() {
  const compute = `<g>${rect(441, 302, 339, 226, 'scene-compute', 5)}${smallCells(463, 365, 8, 4, 31, 26, 7, 'scene-compute-cell')}${text(462, 337, 'MATH / COMPUTE', 'scene-mono scene-block-label')}${hint(751, 330)}</g>`;
  const memory = `${rect(89, 245, 116, 338, 'scene-memory-block', 4)}${Array.from({ length: 6 }, (_, i) => rect(105, 286 + i * 43, 83, 29, 'scene-memory-layer', 2)).join('')}${text(147, 275, 'HBM', 'scene-mono scene-block-label', 'middle')}${hint(147, 561)}`;
  return `${title(3, 'Architecture', 'Organize the chip around the movement of data.')}
    ${rect(254, 198, 582, 432, 'scene-chip-boundary', 7)}${tag(271, 184, 'COMPUTE DIE')}
    ${comp('hbm', 'Explore HBM and memory capacity', memory)}
    ${comp('compute', 'Explore the math and compute units', compute)}
    ${comp('buffer', 'Explore buffers and on-chip storage', `${rect(278, 302, 120, 226, 'scene-storage', 5)}${text(338, 340, 'ON-CHIP', 'scene-mono scene-block-label', 'middle')}${text(338, 365, 'STORAGE', 'scene-mono scene-block-label', 'middle')}${smallCells(297, 389, 3, 4, 23, 22, 5, 'scene-storage-cell')}${hint(369, 501)}`)}
    ${comp('control', 'Explore control and scheduling', `${rect(278, 220, 502, 57, 'scene-control', 4)}${text(299, 255, 'CONTROL &amp; SCHEDULING', 'scene-mono scene-block-label')}${hint(751, 249)}`)}
    ${comp('conversion', 'Explore numeric conversion and data rearrangement', `${rect(278, 553, 502, 55, 'scene-conversion', 4)}${text(299, 587, 'NUMERIC CONVERSION / DATA REARRANGEMENT', 'scene-mono scene-block-label')}${hint(751, 580)}`)}
    ${comp('interconnect', 'Explore the on-chip interconnect and interfaces', `${line('M814 246V580 M206 415H254 M398 415H441 M529 277V302 M529 528V553 M780 415H899', 'scene-bus')}${dot(814, 415, 7)}${rect(865, 374, 70, 82, 'scene-interface', 3)}${text(900, 408, 'I/O', 'scene-mono scene-block-label', 'middle')}${text(900, 434, 'LINK', 'scene-mono scene-block-label', 'middle')}${hint(900, 476)}`)}
    ${flow('M206 415H254', 'arch-in')}${flow('M398 415H441', 'arch-compute')}${flow('M780 415H865', 'arch-output')}
    ${text(89, 670, 'Capacity → bandwidth → dataflow → useful computation', 'scene-large-label')}
    ${bottom('THE ARCHITECTURE DEFINES RESPONSIBILITIES & INTERFACES')}`;
}
function microScene() {
  const block = (id, label, x, symbol, detail, cls = '') => comp(id, `Explore ${label.toLowerCase()}`, `${rect(x, 305, 139, 165, `scene-datapath-block ${cls}`, 5)}${text(x + 69.5, 377, symbol, 'scene-operation-symbol', 'middle')}${text(x + 69.5, 418, label, 'scene-mono scene-block-label', 'middle')}${text(x + 69.5, 445, detail, 'scene-datapath-small', 'middle')}${hint(x + 118, 326)}`);
  return `${title(4, 'Microarchitecture', 'Turn the requirements into a cycle-by-cycle implementation.')}
    ${tag(61, 214, 'INSIDE THE MATH BLOCK')}
    ${comp('interface', 'Explore the 32-bit block input and output interfaces', `${text(67, 350, '32-bit', 'scene-large-label')}${text(67, 380, 'input', 'scene-body-label')}${text(868, 350, '32-bit', 'scene-large-label')}${text(868, 380, 'output', 'scene-body-label')}${dot(99, 411, 6)}${dot(901, 411, 6)}`)}
    ${block('register', 'REGISTER', 183, 'D', 'Hold a value')}${block('multiply', 'MULTIPLY', 431, '×', 'Compute', 'scene-math-block')}${block('add', 'ADD', 678, '+', 'Accumulate', 'scene-math-block')}
    ${flow('M106 411H183', 'micro-in')}${flow('M322 387H431', 'micro-mul')}${flow('M570 387H678', 'micro-add')}${flow('M817 411H895', 'micro-out')}
    ${line('M252 486V532 M500 486V532 M748 486V532 M140 532H861', 'scene-clock-wire')}${text(140, 568, 'CLOCK / PIPELINE BOUNDARIES', 'scene-mono scene-muted')}${line('M145 608h18v-20h26v20h26v-20h26v20h26v-20h26v20h26v-20h26v20h26v-20h26v20h26v-20h26v20h26v-20h26v20h26v-20h26v20h26v-20h26v20h26v-20h26v20h26v-20h26v20h26v-20h26v20h26v-20h26v20', 'scene-clock-wave')}
    ${text(500, 665, 'Interfaces must agree on width, timing, format, and flow control.', 'scene-body-label', 'middle')}
    ${bottom('RTL DESCRIBES THE LOGIC · PPA CONSTRAINS THE IMPLEMENTATION', 'SIMPLIFIED DATAPATH · ILLUSTRATIVE TIMING')}`;
}
function verificationScene() {
  return `${title(5, 'Design verification', 'Compare the implementation with independent architectural intent.')}
    ${comp('testbench', 'Explore the verification testbench and stimulus', `${rect(74, 174, 854, 445, 'scene-testbench-boundary', 7)}${text(96, 207, 'TESTBENCH', 'scene-mono scene-muted')}${rect(113, 337, 160, 112, 'scene-test-source', 4)}${text(193, 376, 'STIMULUS', 'scene-mono scene-block-label', 'middle')}${text(193, 406, 'Inputs + edge cases', 'scene-body-label', 'middle')}${hint(250, 357)}`)}
    ${comp('reference', 'Explore the independent expected behavior derived from the specification', `${rect(375, 235, 253, 116, 'scene-reference', 4)}${text(501, 277, 'REFERENCE MODEL', 'scene-mono scene-block-label', 'middle')}${text(501, 310, 'Architectural specification', 'scene-body-label', 'middle')}${hint(607, 255)}`)}
    ${comp('compute', 'Explore the RTL implementation under test', `${rect(375, 424, 253, 116, 'scene-compute', 4)}${text(501, 469, 'RTL IMPLEMENTATION', 'scene-mono scene-block-label', 'middle')}${text(501, 503, 'Design under test', 'scene-body-label', 'middle')}${hint(607, 445)}`)}
    ${comp('comparator', 'Explore comparison of actual and expected results', `<path d="M793 317L873 393L793 469L713 393Z" class="scene-comparator"/>${text(793, 401, '=', 'scene-compare-symbol', 'middle')}${text(793, 505, 'COMPARE', 'scene-mono scene-block-label', 'middle')}${text(793, 534, 'Expected vs. actual', 'scene-body-label', 'middle')}${hint(849, 346)}`)}
    ${flow('M273 372H315V293H375', 'dv-ref')}${flow('M273 412H315V482H375', 'dv-dut')}${flow('M628 293H688V370H737', 'dv-expected')}${flow('M628 482H688V417H737', 'dv-actual')}
    <g class="scene-dv-pass" aria-hidden="false">${tag(694, 578, 'MATCH / TEST PASSES')}${dot(903, 567, 5, 'scene-status')}</g>
    <g class="scene-dv-fault" aria-hidden="true">${tag(682, 578, 'MISMATCH / INVESTIGATE')}${line('M580 555V650H350V570', 'scene-feedback-wire')}${text(470, 681, 'Bug → RTL designer · Unclear intent → architecture', 'scene-body-label', 'middle')}</g>
    <g class="scene-dv-pass" aria-hidden="false">${text(500, 681, 'Coverage builds confidence across normal behavior and edge cases.', 'scene-body-label', 'middle')}</g>
    ${bottom('VERIFICATION STARTS FROM THE SPECIFICATION', 'PARALLEL WITH PHYSICAL DESIGN')}`;
}
function physicalScene() {
  const routes = [
    'M192 262H344V334H548V474H758', 'M192 281H315V355H570V500H758', 'M192 300H291V379H590V524H758',
    'M204 565H370V441H478V239', 'M226 565H390V462H499V239', 'M249 565H411V484H522V239',
    'M288 239V319H660V565', 'M310 239V301H683V565', 'M334 239V282H704V565',
    'M758 347H647V421H561V565', 'M758 368H625V401H538V565', 'M192 432H275V527H460',
  ];
  const cells = Array.from({ length: 15 * 12 }, (_, i) => { const col = i % 15; const row = Math.floor(i / 15); const skip = (col > 4 && col < 10 && row > 2 && row < 8); if (skip) return ''; return rect(195 + col * 37, 245 + row * 27, i % 4 === 0 ? 29 : 25, 18, `scene-placed-cell ${i % 11 === 0 ? 'scene-placed-cell-dark' : ''}`, 1); }).join('');
  return `${title(6, 'Physical design', 'Make the logic fit, connect, and meet its constraints.')}
    ${rect(154, 204, 651, 406, 'scene-chip-boundary', 5)}
    ${comp('cells', 'Explore standard cells and placement', `${cells}${rect(371, 322, 185, 211, 'scene-compute-physical', 3)}${smallCells(385, 337, 5, 7, 25, 21, 7, 'scene-physical-math-cell')}${hint(180, 229)}`)}
    ${comp('routing', 'Explore routing, congestion, and timing', `${routes.map((d, i) => line(d, `scene-layout-route scene-route-${i % 3}`)).join('')}<ellipse cx="594" cy="397" rx="63" ry="78" class="scene-congestion"/>${hint(618, 411)}${line('M628 391H859V305', 'scene-callout')}${text(833, 266, 'CONGESTION', 'scene-mono scene-accent-label')}${text(833, 292, 'Reroute or move cells', 'scene-body-label')}`)}
    ${comp('clock', 'Explore clock distribution and timing', `${line('M480 224V302 M480 264H295V309 M480 264H668V309 M295 287H228V317 M295 287H367V317 M668 287H601V317 M668 287H734V317', 'scene-clock-tree')}${dot(480, 224, 5, 'scene-clock-root')}${hint(486, 282)}`)}
    ${comp('power', 'Explore the power distribution network', `${[218, 288, 358, 428, 498, 568].map(y => line(`M170 ${y}H789`, 'scene-power-grid')).join('')}${[176, 270, 364, 458, 552, 646, 740].map(x => line(`M${x} 219V594`, 'scene-power-grid')).join('')}${hint(777, 577)}`)}
    ${tag(152, 664, 'PLACEMENT')}${tag(325, 664, 'ROUTING')}${tag(477, 664, 'TIMING')}${tag(618, 664, 'POWER')}
    ${bottom('PHYSICAL RESULTS FEED BACK INTO RTL & ARCHITECTURE', 'ILLUSTRATIVE ROUTES · NO ETCHED MEASUREMENTS')}`;
}
function racksFinal() {
  return `${title(9, 'Software to deployment', 'The complete system must deliver the intended experience.')}
    <ellipse cx="499" cy="673" rx="386" ry="29" class="scene-ground"/>
    ${comp('rack', 'Explore the deployed multi-rack inference system', `${rack(84, 300, .68, { muted: true })}${rack(391, 237, .84)}${rack(716, 300, .68, { muted: true })}`)}
    ${comp('links', 'Explore multi-chip communication and latency', `${flow('M267 374H350Q368 374 368 359V346H409', 'rack-link-a')}${flow('M617 346H658Q674 346 674 364V374H732', 'rack-link-b')}${flow('M267 466H340Q358 466 358 478V499H409', 'rack-link-c')}${flow('M617 499H666Q684 499 684 483V466H732', 'rack-link-d')}${text(500, 180, 'MODEL → EXECUTION SOFTWARE → CUSTOMER INFERENCE', 'scene-mono scene-accent-label', 'middle')}${hint(680, 413)}`)}
    ${comp('cooling', 'Explore sustained power and cooling requirements', `${line('M73 646H925', 'scene-cooling-manifold')}${line('M131 646V619 M438 646V630 M763 646V619', 'scene-cooling-branch')}${text(501, 705, 'Power and cooling set the operating envelope.', 'scene-body-label', 'middle')}${hint(922, 646)}`)}
    ${bottom('LATENCY · THROUGHPUT · RELIABILITY · EFFICIENCY', 'ILLUSTRATIVE SYSTEM')}`;
}
function aiScene() {
  const nodes = [
    { x: 94, y: 206, w: 226, h: 118, label: 'ARCHITECTURE', sub: 'Intent + interfaces', id: 'specification', cls: 'scene-control' },
    { x: 680, y: 206, w: 226, h: 118, label: 'MICROARCH / RTL', sub: 'Logic within PPA budgets', id: 'rtl', cls: 'scene-compute' },
    { x: 94, y: 488, w: 226, h: 118, label: 'VERIFICATION', sub: 'Tests + coverage', id: 'testbench', cls: 'scene-reference' },
    { x: 680, y: 488, w: 226, h: 118, label: 'PHYSICAL DESIGN', sub: 'Area + timing + power', id: 'cells', cls: 'scene-control' },
  ];
  return `${title(8, 'AI across the process', 'Connect a proposed change to the evidence it needs.')}
    ${nodes.map(n => comp(n.id, `Explore ${n.label.toLowerCase()} and cross-team coordination`, `${rect(n.x, n.y, n.w, n.h, n.cls, 5)}${text(n.x + 20, n.y + 42, n.label, 'scene-mono scene-block-label')}${text(n.x + 20, n.y + 75, n.sub, 'scene-body-label')}${hint(n.x + n.w - 22, n.y + n.h - 22)}`)).join('')}
    ${comp('ai', 'Explore AI assistance and proposed coordination tools', `<circle cx="500" cy="406" r="100" class="scene-ai-ring"/><circle cx="500" cy="406" r="86" class="scene-ai-core"/>${text(500, 391, 'AI ASSISTANCE', 'scene-mono scene-block-label', 'middle')}${text(500, 423, 'Trace a format change', 'scene-body-label', 'middle')}${text(500, 449, 'Keep evidence connected', 'scene-body-label', 'middle')}${hint(568, 346)}`)}
    ${flow('M320 265H373V347H420', 'ai-spec')}${flow('M580 347H627V265H680', 'ai-rtl')}${flow('M320 548H373V465H420', 'ai-dv')}${flow('M580 465H627V548H680', 'ai-pd')}
    ${text(500, 677, 'AI for RTL and performance analysis. Coordination is an opportunity.', 'scene-body-label', 'middle')}
    ${bottom('PROPOSALS STILL NEED ENGINEERING REVIEW & VALIDATION', 'CURRENT FOCUS & PROPOSED USES DISTINGUISHED IN THE STORY')}`;
}


const hardwareImage = (file,x,y,width,height,label) => `<image class="scene-hardware-image" href="./assets/hardware/${file}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${label}"/>`;
const photoDetail = (file,x,y,w,h,viewBox,nativeWidth,nativeHeight,label) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${hardwareImage(file,0,0,nativeWidth,nativeHeight,label)}</svg>`;
function hardwareScene(index) {
  if (index === 0) return `${hardwareImage('etched-rack-detail.webp',40,140,920,500,'The exact rack photograph displayed on Etched’s current homepage, showing a compute tray and rack cabling')}${text(500,689,'Etched’s current rack hardware · official homepage photography','scene-hardware-caption','middle')}`;
  if (index === 1) return `${photoDetail('etched-chip.webp',210,140,580,510,'900 500 1400 1600',3200,2562,'Photograph of Etched’s actual packaged chip, from its official media kit')}${text(500,687,'Packaged chip · official Etched photography','scene-hardware-caption','middle')}`;
  return `<g class="hardware-wide">${photoDetail('etched-tray.webp',90,140,395,510,'1190 275 820 1250',3200,1800,'Actual liquid-cooled Etched compute tray with copper cold plates and braided tubing')}${photoDetail('etched-rack.webp',565,140,335,510,'820 600 900 2370',2525,3200,'Actual current Etched inference rack, front view')}${text(285,684,'Compute tray','scene-hardware-label','middle')}${text(735,684,'Inference rack','scene-hardware-label','middle')}</g><g class="hardware-compact">${hardwareImage('etched-rack-detail.webp',40,140,920,438,'Etched’s actual rack and extracted compute tray, photographed from above')}</g>`;
}

const chapterBuilders = [rackOpening, packageScene, architectureScene, microScene, verificationScene, physicalScene, () => organizationScene({comp,rect,text,hint,flow,arrow,title,bottom}), aiScene, racksFinal];

/** Accessible diagrams paired with a continuous, scroll-controlled hardware scene. */
export function createScene(host, callbacks = {}) {
  const prefix = `etched-scene-${++sceneSequence}`;
  const svgMarkup = `<svg class="etched-scene" viewBox="0 110 1000 610" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Interactive diagrams of Etched’s chip design process">
    <title>From an AI request to silicon and back</title><desc>Official Etched hardware imagery and conceptual engineering diagrams. Use Hardware or Diagram to switch presentations. Select a labeled component to read its role and tradeoffs.</desc>
    <defs>
      <pattern id="__ID__-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".85" fill="#aeb5a8" opacity=".33"/></pattern>
      <marker id="__ID__-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#e95932" stroke-width="1.5"/></marker>
      <linearGradient id="__ID__-wafer" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e4e9e0"/><stop offset=".45" stop-color="#b4c0ae"/><stop offset="1" stop-color="#eff0e9"/></linearGradient>
    </defs>
    <rect width="1000" height="800" fill="#ffffff"/>
    <path d="M37 128v-11h11 M952 117h11v11 M37 706v11h11 M952 717h11v-11" class="scene-corner"/>
    ${chapterBuilders.map((builder, i) => `<g class="scene-layer ${i === 0 ? 'is-active' : ''}" data-scene="${i}" aria-hidden="${i !== 0}"><g class="scene-camera">${[0,1,8].includes(i) ? `<g class="scene-presentation" data-presentation="hardware" aria-hidden="false">${hardwareScene(i)}</g><g class="scene-presentation" data-presentation="diagram" aria-hidden="true">${builder()}</g>` : builder()}</g></g>`).join('')}
    ${teardownMarkup()}
  </svg>`;
  host.innerHTML = svgMarkup.replaceAll('__ID__', prefix);
  host.classList.add('scene-host', 'scene-is-playing');
  const svg = host.querySelector('svg');
  const teardown = createTeardown(svg);
  const hardwareHost = document.createElement('div');
  hardwareHost.className = 'hardware-renderer-host';
  hardwareHost.setAttribute('role','img');
  host.append(hardwareHost);
  const hardware = createHardwareRenderer(hardwareHost, {
    onReady: () => queueMicrotask(() => { if (!destroyed) syncTeardown(); })
  });
  let hardwareView = teardown.getState();
  const layers = [...host.querySelectorAll('[data-scene]')];
  let activeIndex = 0;
  let selected = '';
  let hardwareMode = true;
  let chapterProgress = 0;
  let playing = true;
  let frame = 0;
  let lastTime = 0;
  let travel = 0;
  let destroyed = false;
  let hovered = null;
  let transitionTimer = 0;
  let cameraResetTimer = 0;
  let focusedCamera = null;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactPreference = window.matchMedia('(max-width: 900px)');
  const particles = [...host.querySelectorAll('[data-path]')].map(node => {
    const path = host.querySelector(`#${node.dataset.path}`);
    return { node, path, length: path.getTotalLength(), chapter: Number(node.closest('[data-scene]').dataset.scene) };
  });
  const isVisibleComponent = node => !(hardwareMode && activeIndex <= 2 && hardwareView.architectureMix < .95) && node.closest('[data-presentation]')?.getAttribute('aria-hidden') !== 'true';
  const setTabStops = () => layers.forEach((layer, i) => layer.querySelectorAll('[data-component]').forEach(node => node.setAttribute('tabindex', i === activeIndex && isVisibleComponent(node) ? '0' : '-1')));
  setTabStops();
  function syncTeardown() {
    const show = hardwareMode && activeIndex <= 2;
    layers[8].querySelector('.hardware-wide').setAttribute('aria-hidden',String(compactPreference.matches));
    layers[8].querySelector('.hardware-compact').setAttribute('aria-hidden',String(!compactPreference.matches));
    const aspect = host.clientWidth / Math.max(1,host.clientHeight);
    const reduced = motionPreference.matches || !playing;
    const volume = hardware.getState().available && hardware.getState().loaded;
    hardware.setCompact(compactPreference.matches, aspect);
    hardware.setVisible(show);
    teardown.setCompact(compactPreference.matches, aspect);
    const view = volume ? hardware.setPosition(activeIndex, chapterProgress, reduced) : teardown.setPosition(activeIndex, chapterProgress, reduced);
    hardwareView = view;
    hardwareHost.hidden = !show || !volume || view.architectureMix >= 1;
    hardwareHost.setAttribute('aria-hidden', String(hardwareHost.hidden));
    hardwareHost.setAttribute('aria-label', {
      rack:'The complete Etched rack, viewed from the front. A compute tray is highlighted before extraction.',
      extract:'One compute tray slides along its rails while the camera moves from the front of the rack toward an overhead view. Photo-referenced reconstruction.',
      tray:'The extracted compute tray, shown overhead using Etched’s official photograph.',
      cooling:'The cooling lines and cold plates lift from the same tray. Explanatory reconstruction of their spatial relationship.',
      board:'The board beneath the cooling assembly is revealed. Hidden board details and component placement are illustrative.',
      package:'The camera approaches one package on the illustrative board. The package surface uses Etched’s official chip photograph.',
      anatomy:'An inferred package anatomy overlay identifies the central compute device and six flanking HBM locations.',
      storage:'A conceptual cutaway explains storage inside the compute device. It does not show an Etched floorplan.'
    }[view.phase] || 'A photo-referenced reconstruction of the hardware system.');
    host.dataset.hardwarePhase = view.phase;
    svg.setAttribute('viewBox',show && !volume && view.viewBox ? view.viewBox : compactPreference.matches && hardwareMode && activeIndex===8 ? '40 140 920 438' : hardwareMode && activeIndex===8 ? '110 140 725 565' : '0 110 1000 610');
    teardown.setVisible(show && !volume);
    teardown.element.setAttribute('aria-hidden', String(volume || !show || view.architectureMix >= 1));
    teardown.element.setAttribute('role','img');
    teardown.element.setAttribute('aria-label', {
      rack:'Photograph of the inference rack. One compute tray is selected.',
      tray:'The photographed compute tray slides out from the rack and turns to an overhead view.',
      cooling:'Photographed tubing and cold-plate surfaces separate to explain the cooling assembly.',
      package:'The actual packaged-chip photograph is isolated, then becomes a conceptual architecture view.'
    }[view.phase]);
    host.classList.toggle('scene-is-teardown',show && view.architectureMix < 1);
    for (const index of [0,1,2]) {
      layers[index].style.opacity = show ? (index === 2 ? String(view.architectureMix) : '0') : '';
      layers[index].setAttribute('aria-hidden', String(index !== activeIndex || show && view.architectureMix < .95));
      layers[index].style.animation = show ? 'none' : '';
      layers[index].style.pointerEvents = show && view.architectureMix < .95 ? 'none' : '';
    }
    setTabStops();
  }
  function updateComponentFocus() {
    clearTimeout(cameraResetTimer);
    if (focusedCamera) {
      const restoringCamera = focusedCamera;
      restoringCamera.style.transition = motionPreference.matches ? 'none' : 'transform 500ms cubic-bezier(.22,.65,.25,1)';
      restoringCamera.style.removeProperty('transform');
      restoringCamera.style.removeProperty('transform-origin');
      cameraResetTimer = setTimeout(() => restoringCamera.style.removeProperty('transition'), motionPreference.matches ? 0 : 520);
      focusedCamera = null;
    }
    if (!selected) return;
    const component = [...layers[activeIndex].querySelectorAll('[data-component]')].find(node => node.dataset.component === selected && isVisibleComponent(node));
    if (!component) return;
    const bounds = component.getBBox();
    if (!bounds.width || !bounds.height) return;
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const scale = Math.max(1, Math.min(mobile ? 1.9 : 1.65, 840 / bounds.width, 640 / bounds.height));
    // Wide system-level components already fill the diagram; keep their context visible.
    if (scale < 1.08) return;
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const camera = layers[activeIndex].querySelector('.scene-camera');
    clearTimeout(cameraResetTimer);
    camera.style.transition = motionPreference.matches ? 'none' : 'transform 600ms cubic-bezier(.22,.65,.25,1)';
    camera.style.transformOrigin = '500px 400px';
    camera.style.transform = `translate(${scale * (500 - centerX)}px, ${scale * (400 - centerY)}px) scale(${scale})`;
    focusedCamera = camera;
  }
  function animate(time) {
    frame = 0;
    if (destroyed || !playing || motionPreference.matches || document.hidden) return;
    travel += Math.min(time - (lastTime || time), 40) * .00018;
    lastTime = time;
    particles.forEach(({ node, path, length, chapter }, i) => {
      if (chapter !== activeIndex) return;
      const p = path.getPointAtLength(((travel + i * .17) % 1) * length);
      node.setAttribute('cx', p.x); node.setAttribute('cy', p.y);
    });
    frame = requestAnimationFrame(animate);
  }
  function updateMotion() {
    syncTeardown();
    host.classList.toggle('scene-is-playing', playing && !motionPreference.matches);
    host.classList.toggle('scene-reduced-motion', motionPreference.matches);
    if (frame) cancelAnimationFrame(frame);
    frame = 0; lastTime = 0;
    if (playing && !motionPreference.matches && !document.hidden) frame = requestAnimationFrame(animate);
  }
  function componentFromEvent(event) {
    const node = event.target.closest?.('[data-component]');
    return node && Number(node.closest('[data-scene]').dataset.scene) === activeIndex ? node : null;
  }
  function onClick(event) { const node = componentFromEvent(event); if (node) callbacks.onSelect?.(node.dataset.component); }
  function onKeydown(event) { if (event.key !== 'Enter' && event.key !== ' ') return; const node = componentFromEvent(event); if (node) { event.preventDefault(); callbacks.onSelect?.(node.dataset.component); } }
  function onHover(event) {
    const node = componentFromEvent(event);
    if (node === hovered) return;
    hovered?.classList.remove('is-hovered');
    hovered = node;
    if (node) { node.classList.add('is-hovered'); callbacks.onHover?.(node.dataset.component, event); }
    else callbacks.onLeave?.();
  }
  function onLeave() { hovered?.classList.remove('is-hovered'); hovered = null; callbacks.onLeave?.(); }
  svg.addEventListener('click', onClick);
  svg.addEventListener('keydown', onKeydown);
  svg.addEventListener('pointerover', onHover);
  svg.addEventListener('pointerleave', onLeave);
  svg.addEventListener('focusin', onHover);
  svg.addEventListener('focusout', onLeave);
  motionPreference.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateMotion);
  updateMotion();
  return {
    setHardwareMode(value) {
      hardwareMode = Boolean(value);
      layers.forEach(layer => layer.querySelectorAll('[data-presentation]').forEach(group => {
        const visible = group.dataset.presentation === (hardwareMode ? 'hardware' : 'diagram');
        group.setAttribute('aria-hidden', String(!visible));
      }));
      syncTeardown(); setTabStops(); onLeave();
    },
    setChapter(index, progress = 0) {
      const next = Math.max(0, Math.min(chapterBuilders.length - 1, Math.round(Number(index) || 0)));
      if (next !== activeIndex) {
        const leavingLayer = layers[activeIndex];
        const zoomingIn = next > activeIndex && next < 7;
        layers.forEach(layer => layer.classList.remove('is-leaving', 'is-arriving'));
        host.classList.toggle('scene-zooming-out', !zoomingIn);
        leavingLayer.classList.add('is-leaving');
        activeIndex = next;
        layers.forEach((layer, i) => { layer.classList.toggle('is-active', i === activeIndex); layer.setAttribute('aria-hidden', i !== activeIndex ? 'true' : 'false'); });
        layers[activeIndex].classList.add('is-arriving');
        clearTimeout(transitionTimer);
        transitionTimer = setTimeout(() => layers.forEach(layer => layer.classList.remove('is-leaving', 'is-arriving')), 700);
        setTabStops(); onLeave();
        if (selected) updateComponentFocus();
      }
      const p = Math.max(0, Math.min(1, Number(progress) || 0));
      chapterProgress = p;
      syncTeardown();
      layers[activeIndex].querySelector('.scene-camera').style.setProperty('--scene-pan', `${p * -4}px`);
      layers[activeIndex].querySelector('.scene-camera').style.setProperty('--scene-zoom', 1 + p * .009);
    },
    selectComponent(id) {
      selected = id || '';
      host.querySelectorAll('[data-component]').forEach(node => {
        const isSelected = node.dataset.component === selected;
        node.classList.toggle('is-selected', isSelected);
        node.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      });
      updateComponentFocus();
    },
    setPlaying(value) { playing = Boolean(value); updateMotion(); },
    setVerificationFault(value) {
      const fault = Boolean(value);
      host.classList.toggle('scene-has-fault', fault);
      host.querySelector('.scene-compare-symbol').textContent = fault ? '≠' : '=';
      host.querySelectorAll('.scene-dv-fault').forEach(node => node.setAttribute('aria-hidden', String(!fault)));
      host.querySelectorAll('.scene-dv-pass').forEach(node => node.setAttribute('aria-hidden', String(fault)));
    },
    destroy() {
      destroyed = true;
      clearTimeout(transitionTimer);
      clearTimeout(cameraResetTimer);
      cancelAnimationFrame(frame);
      hardware.dispose();
      motionPreference.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateMotion);
      svg.removeEventListener('click', onClick); svg.removeEventListener('keydown', onKeydown);
      svg.removeEventListener('pointerover', onHover); svg.removeEventListener('pointerleave', onLeave);
      svg.removeEventListener('focusin', onHover); svg.removeEventListener('focusout', onLeave);
      host.innerHTML = '';
    },
  };
}
