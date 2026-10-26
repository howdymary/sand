export const essay = {
  "title": "Sand to Silicon: How Etched Designs Chips",
  "deck": "How architecture, RTL, verification and physical design work together to build an inference system.",
  "kicker": "Engineering / Chip development",
  "introduction": [
    "A chip specification cannot settle every implementation question. RTL exposes gaps in the interfaces, verification uncovers different readings of the requirements, and physical design puts costs on connections that looked straightforward in a block diagram. The work depends on engineers being able to resolve those disagreements across team boundaries.",
    "At Etched, four disciplines share this responsibility: architecture, microarchitecture and RTL, design verification, and physical design. Their work extends into software and manufacturing because we build complete inference systems. The organization has to support that scope. A block owner needs access to the people who wrote the requirement and the people dealing with its consequences elsewhere in the machine."
  ],
  "sections": [
    {
      "chapter": 0,
      "id": "experience",
      "title": "Start with the workload",
      "paragraphs": [
        "A customer cares about the wait before an answer and how quickly the response arrives. Serving more users introduces another set of demands on the same hardware. The interaction between latency and throughput depends on the model and the traffic the system receives.",
        "We design for both prefill and decode, with software, memory and cooling developed alongside the silicon. This gives the teams a common reference during a technical disagreement. An improvement to a block has to be considered in the workload it serves, including the demands it places on neighboring hardware and the software that schedules it."
      ],
      "sourceLinks": [
        {
          "label": "Etched: Frontier Inference Clusters",
          "url": "https://www.etched.com/progress/frontier-inference-clusters"
        }
      ]
    },
    {
      "chapter": 1,
      "id": "requirements",
      "title": "Make the requirements usable",
      "paragraphs": [
        "Customer conversations and workload analysis establish the conditions behind a performance target. Model size, precision, context length and concurrency all affect the arithmetic rate and memory bandwidth required. Distributing a model across chips adds communication latency to the generation path.",
        "Architecture uses these requirements to allocate resources. RTL engineers need the corresponding behavior and rate assumptions; verification needs enough detail to derive expected results. Physical designers need operating conditions and budgets they can evaluate against an implementation.",
        "A bandwidth target that depends on unrealistic utilization deserves another look at the system model. Giving the block owner a larger target leaves the underlying problem unresolved. The review needs the architect and the engineers familiar with the workload, along with the implementation results that exposed the discrepancy."
      ],
      "sourceLinks": []
    },
    {
      "chapter": 2,
      "id": "architecture",
      "title": "Architecture sets the specification",
      "paragraphs": [
        "Architects define the chip’s organization and write the specifications that connect its blocks. Performance models help them evaluate the design against customer workloads before the hardware exists. The specifications also give RTL designers and verifiers a common account of the intended behavior.",
        "Some choices reach well beyond the die. Our low-voltage inference architecture involves math-array organization and scheduling as well as power delivery, packaging and cold plates. The relevant specialists need to work through these constraints together.",
        "Other changes look local at first. A numerical format affects the representation at an interface, the conversion logic and the corresponding checks. Implementation feedback can send the discussion back to architecture to revise the requirement or its budget. Keeping the specification current is part of that work."
      ],
      "sourceLinks": [
        {
          "label": "Etched: System architecture and low-voltage inference",
          "url": "https://www.etched.com/progress/frontier-inference-clusters"
        }
      ]
    },
    {
      "chapter": 3,
      "id": "microarchitecture",
      "title": "RTL designers work through the implementation",
      "paragraphs": [
        "Microarchitects choose the detailed organization of a block and express it in RTL. Power, performance and area constrain that work throughout development. Meeting the functional requirement still leaves choices about storage, control and the flow of data through the circuit.",
        "Much of the coordination happens at interfaces. The designer of a producing block and the designer of its consumer need the same understanding of ordering and backpressure. Changes to buffering or accepted rates affect both sides, even with the arithmetic unchanged.",
        "The block owner works with verification to investigate behavior and with physical design to understand implementation costs. Architecture remains involved in questions about the original allocation. A block that exceeds its area budget may need a different implementation, or the system may justify revising the budget. That discussion needs all the relevant constraints in view."
      ],
      "sourceLinks": []
    },
    {
      "chapter": 4,
      "id": "verification",
      "title": "Verification challenges the implementation",
      "paragraphs": [
        "Verifiers develop their own understanding of the specification before building the checks around it. Deriving expected behavior directly from the RTL risks copying an implementation mistake into the testbench. Independent interpretation is particularly useful for requirements with subtle numerical or interface behavior.",
        "A mismatch starts a conversation between verification and the RTL designer. Implementation errors lead to corrections and further testing; ambiguity in the specification brings the architect back into the discussion. Performance checks also examine the rates and stalls the architecture model assumed.",
        "This makes verification a regular participant in defining the design. Resolving an unclear requirement early saves the neighboring teams from carrying incompatible interpretations into their own work."
      ],
      "sourceLinks": []
    },
    {
      "chapter": 5,
      "id": "physical-design",
      "title": "Physical design brings the constraints back",
      "paragraphs": [
        "Physical designers arrange and connect the circuit under timing, power and manufacturing constraints. Routing congestion or a long path can make an otherwise attractive organization difficult to implement. The block diagram and RTL provide an incomplete picture of those costs.",
        "The response may involve moving logic, changing the RTL or reconsidering an architectural allocation. Reports need to reach the relevant owner with enough context to assess the alternatives. A timing result without its constraints is a poor starting point for that discussion.",
        "Verification and physical implementation proceed in parallel as usable RTL becomes available. Both can require changes to the design, so their findings need to remain visible to the block owners and architects throughout the work."
      ],
      "sourceLinks": []
    },
    {
      "chapter": 6,
      "id": "tapeout",
      "title": "Keep the work connected through manufacturing",
      "paragraphs": [
        "Clear responsibilities help engineers make progress. They also need a practical way to resolve problems that cross those responsibilities. A timing issue can involve a physical designer, an RTL owner and an architect; waiting for each group to reconstruct the history adds little to the solution.",
        "Our math-block designers work alongside inference engineers, and co-design extends into manufacturing. This gives engineers access to colleagues working on other parts of the same problem. The opportunity is to use that access well, including revisiting the division of work itself.",
        "We question inherited assumptions about the hardware, and the organization deserves the same scrutiny. A review should include the people able to change the relevant requirement. A specialist should be able to follow a finding into another part of the design without losing responsibility for the original problem. Tools and documentation should make the supporting work easy to find.",
        "These habits matter through tapeout, the release of the completed layout and manufacturing data after checks and signoff. Fabrication, packaging, test and bring-up follow. The engineers taking the product through those stages need to understand what changed during development and how the resulting design was checked."
      ],
      "sourceLinks": [
        {
          "label": "Etched: System co-design and engineering organization",
          "url": "https://www.etched.com/progress/frontier-inference-clusters"
        }
      ]
    },
    {
      "chapter": 7,
      "id": "ai-and-coordination",
      "title": "AI assistance in the engineering process",
      "paragraphs": [
        "One focus is using AI to examine RTL and assist with performance analysis. Proposed changes need the same functional and physical evaluation as other implementation work. Producing more candidates also puts more demands on the engineers selecting which ones deserve further analysis.",
        "Coordination offers another use for AI. Requirements, RTL, tests and physical reports contain related information that engineers often have to assemble themselves. A connected workflow could help locate a conflicting interface assumption or collect the relevant context around a failure. This remains an opportunity to develop, with expected behavior still derived independently of the implementation.",
        "Self-improving kernel agents are also part of the work ahead. Building these tools requires engineers who understand the constraints well enough to define what the tool may change and how its output will be evaluated."
      ],
      "sourceLinks": [
        {
          "label": "Etched: The work ahead",
          "url": "https://www.etched.com/progress/from-zero-to-one"
        }
      ]
    },
    {
      "chapter": 8,
      "id": "rack-scale",
      "title": "Software takes the hardware into deployment",
      "paragraphs": [
        "Our inference software work includes porting models and building the abstractions, tests and multi-node runtime needed to execute them. Communication and profiling sit close to this work. Firmware and drivers connect the machine’s physical behavior to the software using it.",
        "Deployment adds staged rollouts, recovery and telemetry. Observations from the fleet need to feed back into engineering priorities. We have tested racks in representative deployments, and in August 2026 we announced our first rack shipment to Jane Street. Customer environments continue to expose questions for the hardware and software teams.",
        "Engineers who have shipped silicon know how much of a product is settled between specialties. We want people who can follow a difficult problem across those boundaries and help improve how the work gets done. Their experience has a direct use here, from questioning an early requirement to understanding the behavior of a system in a customer’s data center."
      ],
      "sourceLinks": [
        {
          "label": "Etched: Inference software engineering",
          "url": "https://jobs.ashbyhq.com/Etched/0f9c0162-97c6-4be6-9cb7-d9afdcf0fa7c"
        },
        {
          "label": "Etched: Fleet software engineering",
          "url": "https://jobs.ashbyhq.com/etched/5726311f-4db2-4c95-8628-d9c8f0f9639d"
        },
        {
          "label": "Etched: Firmware engineering",
          "url": "https://jobs.ashbyhq.com/etched/8e280db7-f954-4467-b3ea-b9b4386d6632/"
        },
        {
          "label": "Etched: Customer testing and system design",
          "url": "https://www.etched.com/progress/frontier-inference-clusters"
        },
        {
          "label": "Etched: First rack shipment",
          "url": "https://www.etched.com/progress/from-zero-to-one"
        }
      ]
    }
  ]
};
