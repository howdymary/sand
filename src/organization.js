/** Engineering relationships, rather than a reporting hierarchy or service flow. */
export function organizationScene({ comp, rect, text, hint, flow, arrow, title, bottom }) {
  const disciplines = [
    { id: 'specification', x: 70, y: 220, label: 'ARCHITECTURE', detail: 'Intent, budgets, specifications', cls: 'scene-control' },
    { id: 'rtl', x: 660, y: 220, label: 'MICROARCHITECTURE / RTL', detail: 'Logic, storage, interfaces', cls: 'scene-compute' },
    { id: 'testbench', x: 70, y: 470, label: 'DESIGN VERIFICATION', detail: 'Independent checks, coverage', cls: 'scene-reference' },
    { id: 'cells', x: 660, y: 470, label: 'PHYSICAL DESIGN', detail: 'Timing, area, power, routing', cls: 'scene-control' }
  ];

  const feedback = [
    'M340 255H395V345', 'M425 345V287H340',
    'M660 255H605V345', 'M575 345V287H660',
    'M340 500H395V450', 'M425 450V535H340',
    'M660 500H605V450', 'M575 450V535H660'
  ].map(path => arrow(path, 'scene-feedback-wire')).join('');

  return `${title(7, 'Design the organization too', 'Keep the people who can change a decision connected.')}
    ${text(500, 183, 'Let findings change the decision', 'scene-subtitle', 'middle')}
    ${feedback}
    ${rect(370, 345, 260, 105, 'scene-interface', 5)}
    ${text(500, 373, 'Shared requirements', 'scene-label', 'middle')}
    ${text(500, 402, 'Interfaces + budgets', 'scene-body-label', 'middle')}
    ${text(500, 430, 'Decisions stay revisable', 'scene-muted', 'middle')}
    ${disciplines.map(node => comp(node.id, `Inspect ${node.label.toLowerCase()} and its feedback with the other disciplines`, `${rect(node.x, node.y, 270, 100, node.cls, 5)}${text(node.x + 20, node.y + 34, node.label, 'scene-mono scene-block-label')}${text(node.x + 20, node.y + 65, node.detail, 'scene-body-label')}${hint(node.x + 248, node.y + 80)}`)).join('')}
    ${text(500, 594, 'Verification and physical design proceed in parallel.', 'scene-body-label', 'middle')}
    ${flow('M205 570V617H350V650H355', 'organization-verification-release')}
    ${arrow('M355 650H375')}
    ${flow('M795 570V617H650V650H645', 'organization-physical-release')}
    ${arrow('M645 650H625')}
    ${text(500, 617, 'Converging evidence', 'scene-accent-label', 'middle')}
    ${comp('tapeout', 'Inspect signoff, tapeout, and the path to production', `${rect(375, 631, 250, 46, 'scene-conversion', 5)}${text(394, 659, 'Tapeout → production', 'scene-mono scene-block-label')}${hint(605, 654)}`)}
    ${bottom('FINDINGS RETURN TO THE ENGINEER WHO CAN ACT', 'CONCEPTUAL ENGINEERING RELATIONSHIPS')}`;
}
