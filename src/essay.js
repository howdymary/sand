export const essay = {
  "title": "Sand to Silicon: How Etched Designs Chips",
  "deck": "How customer workloads become silicon—and how we connect four engineering disciplines to move better ideas into production.",
  "kicker": "Engineering / From workload to production",
  "introduction": [
    "Long before a design reaches a wafer, someone has to decide what experience the hardware should make possible. An inference chip begins with a model, a customer, and a set of constraints. Its architecture turns those constraints into a machine; its development process determines how effectively engineers can improve that machine.",
    "At Etched, we treat chips, packages, racks, software, and manufacturing as parts of the same problem. Following that path reveals two connected design challenges: rethink the hardware assumptions that limit inference, and rethink the organizational assumptions that slow a good idea on its way to production."
  ],
  "sections": [
    {
      "chapter": 0,
      "id": "experience",
      "title": "Start with the experience the customer needs",
      "paragraphs": [
        "A person asking a model a question experiences the hardware as a pause before the answer, a stream of tokens, and a service that remains responsive as demand grows. Behind those observations are different requirements: time to first token, generation latency, aggregate throughput, availability, and cost.",
        "We design frontier inference systems for both prefill and decode. The objective is to connect customer requirements to the machine that serves them. A model’s arithmetic is one part of the problem. Memory, communication, scheduling, power, and cooling determine how much of the hardware’s capability becomes a useful customer experience."
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
      "title": "Translate tokens and latency into engineering requirements",
      "paragraphs": [
        "A target such as tokens per second needs a workload attached to it: model, numerical precision, context lengths, request mix, and concurrency. From there, engineers estimate the arithmetic rate, memory capacity and bandwidth, communication, and power required. A model divided across chips brings link latency and bandwidth into the token-generation path.",
        "Those requirements are coupled. More arithmetic helps only if operands arrive fast enough. Additional memory capacity may require communication that changes latency. Power delivery and cooling limit the operating point the rack can sustain.",
        "Customer conversations and performance models help make these dependencies explicit before they become physical commitments. The result is a set of budgets and assumptions that architecture, implementation, and evaluation can share—and challenge."
      ],
      "sourceLinks": []
    },
    {
      "chapter": 2,
      "id": "architecture",
      "title": "Architecture: decide what the chip must do",
      "paragraphs": [
        "The architecture team converts system requirements into block responsibilities, interfaces, budgets, specifications, and performance models. Its objective is a chip organization that can meet the workload goals. It needs implementation feedback early enough to distinguish an attractive model from a realizable design.",
        "Open the package into a conceptual dataflow. Memory supplies values; buffering, conversion, and layout transformations prepare them; arithmetic produces results that must move onward. At every boundary, architecture commits to a representation, a rate, and a way to coordinate the work.",
        "Our low-voltage inference work illustrates the scope of these decisions: math-array organization and scheduling connect to power delivery and cooling. Our Cluster Scale Memory joins an HBM/SRAM design with a shared memory pool and interconnect across the scale-up domain. The architectural question reaches beyond one block, and often beyond one die."
      ],
      "sourceLinks": [
        {
          "label": "Etched: Low-voltage inference and Cluster Scale Memory",
          "url": "https://www.etched.com/progress/frontier-inference-clusters"
        }
      ]
    },
    {
      "chapter": 3,
      "id": "quantization",
      "title": "Quantization: make an architectural choice concrete",
      "paragraphs": [
        "Numerical formats show how a workload requirement becomes hardware. In the accompanying visual, 32 eight-bit values occupy 256 raw bits; at four bits, their payload occupies 128 bits before scales and other metadata. That reduction can change memory traffic, storage, and arithmetic opportunities.",
        "The architectural work is deciding what else must change. Where does conversion happen? Which representation does the consumer accept? What numerical behavior must be preserved, and can the conversion path sustain the required rate?",
        "Quantization belongs inside these architectural decisions. Its effects reach RTL, verification, performance modeling, and physical implementation. The example is illustrative; it does not specify Etched’s formats or package layout. The useful outcome is a complete requirement whose numerical and implementation consequences can be evaluated together."
      ],
      "sourceLinks": []
    },
    {
      "chapter": 4,
      "id": "microarchitecture",
      "title": "Microarchitecture and RTL: implement the contract",
      "paragraphs": [
        "Microarchitecture turns a block’s requirements into cycle-by-cycle behavior. RTL designers choose datapaths, storage, control, sequencing, and interfaces while meeting power, performance, and area constraints. Several implementations can compute the same answer and place very different demands on the rest of the chip.",
        "Consider a block expected to accept a new value each cycle under defined conditions. Pipeline stages, intermediate widths, valid-data handling, and backpressure determine whether that rate is achievable. Its receiving block has to agree on the contract.",
        "The touchpoints are continuous: architecture supplies intent and budgets; verification challenges behavior; physical design exposes timing and implementation costs. Experienced judgment matters because a local improvement can move work, latency, or power into a neighboring block."
      ],
      "sourceLinks": []
    },
    {
      "chapter": 5,
      "id": "verification",
      "title": "Design verification: test an independent understanding",
      "paragraphs": [
        "The verification team determines whether the implementation satisfies its intended behavior. Its reference must come from an independent understanding of the specification, including numerical rules, interface conditions, sequencing, and progress. A test that simply repeats the RTL’s assumption can reproduce the same mistake.",
        "When expected and observed behavior disagree, verification and RTL engineers investigate together. An implementation defect calls for a fix and continued testing. An ambiguous requirement brings the discussion back to architecture. Performance-oriented checks also examine whether implemented behavior supports the assumed rates.",
        "Verification therefore contributes more than a final gate. It improves the shared description of the design while changes are still possible. Its independence becomes especially valuable when tools make it easier to generate additional candidate implementations."
      ],
      "sourceLinks": []
    },
    {
      "chapter": 6,
      "id": "physical-design",
      "title": "Physical design: make the circuit realizable",
      "paragraphs": [
        "Synthesis maps RTL into cells and connections. Physical design gives that circuit an arrangement, routing, clocks, and power delivery that can meet timing and manufacturing constraints. The apparent efficiency of a logical description has to survive those physical conditions.",
        "A floorplan can expose congestion or long paths that require moving a block, revising its microarchitecture, or reconsidering an architectural budget. That finding needs to reach the engineer who can act on it, with the constraints and analysis that explain the tradeoff.",
        "Physical implementation and verification proceed in parallel as usable RTL becomes available. They produce different evidence about the same design. Keeping both connected to architecture and block owners makes their discoveries useful before the manufacturing release."
      ],
      "sourceLinks": []
    },
    {
      "chapter": 7,
      "id": "tapeout",
      "title": "From idea to manufacturing: design the organization too",
      "paragraphs": [
        "After the relevant checks and signoff, tapeout releases the completed layout and manufacturing data to the foundry. Fabrication, packaging, test, bring-up, and system validation follow. Reaching that boundary requires evidence to remain connected as the design changes.",
        "The four teams have distinct responsibilities, but their work does not fit a sequence of isolated handoffs. When information stops at a team boundary, a problem can wait for another review or be rediscovered downstream. The organization needs explicit paths for changing an assumption as well as implementing it.",
        "Our math-block designers work alongside inference engineers, and co-design extends into manufacturing. We put twenty years of inherited chip-design habits back on the table, including how we organize the work. First-principles reasoning applies to who needs to see a result, who can change the decision, and which tools remove avoidable waiting. The goal is an efficient workplace where deep experience can carry an idea through to production."
      ],
      "sourceLinks": [
        {
          "label": "Etched: System co-design and engineering organization",
          "url": "https://www.etched.com/progress/frontier-inference-clusters"
        }
      ]
    },
    {
      "chapter": 8,
      "id": "ai-and-coordination",
      "title": "AI-native engineering: improve implementation and coordination",
      "paragraphs": [
        "One focus is using AI to examine RTL and assist with performance analysis. The engineering test is concrete: does a proposed change improve the resulting implementation while preserving required behavior and physical constraints? Fewer lines of code are insufficient evidence. A promising candidate still needs independent functional checks and the relevant implementation analysis.",
        "There is a second opportunity in coordination. Connecting a requirement to its RTL, tests, performance assumptions, and physical findings would make the consequences of a change easier to trace. AI could help locate inconsistent interfaces, identify affected checks, or assemble a reproducible failure for the responsible engineers. Building that connected workflow is an engineering problem in its own right.",
        "Self-improving kernel agents are also part of the work ahead. Across these efforts, experienced engineers help define the search space and the evidence standard. Faster exploration remains valuable only when the accepted result deserves trust."
      ],
      "sourceLinks": [
        {
          "label": "Etched: The work ahead",
          "url": "https://www.etched.com/progress/from-zero-to-one"
        }
      ]
    },
    {
      "chapter": 9,
      "id": "rack-scale",
      "title": "Software and deployment: return to the customer’s model",
      "paragraphs": [
        "The design becomes useful when software turns a customer’s model into correct, efficient execution. Our inference software work spans model porting, abstractions and tests, multi-node runtime, communication, and profiling. Firmware and drivers connect the physical machine to that execution. Hardware capability has to survive the complete path to a running model.",
        "Operating a fleet adds staged software and firmware rollouts, recovery, and telemetry. Deployment failures and performance observations need to return as engineering priorities. We have tested racks in representative deployments, and in August 2026 we announced our first rack shipment to Jane Street. Each customer environment brings the design back to the conditions it was built to serve.",
        "The process returns to its starting question: what experience does the customer need? We want engineers who have shipped difficult silicon to bring that judgment to both the machine and the way it is built. Reconsidering hardware and organizational assumptions together can give a useful idea a shorter, better-informed path to production."
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
