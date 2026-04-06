---
name: ui-ux-flow-auditor
description: Expert UI/UX auditing and flow analysis. Use this skill to evaluate visual hierarchy, interaction design, and "heatmap scores" based on code structure and design heuristics.
---

# UI/UX Flow Auditor

This skill provides expert procedural guidance for auditing and polishing web applications to ensure "impeccable" design standards. It leverages code-based heuristics to estimate visual attention and flow efficiency.

## Core Mandates

- **Fight the Generic**: Actively identify and eliminate "AI default" tropes (purple gradients, Inter font, low-contrast grays).
- **Prioritize Flow**: Every screen must have a clear primary action and a logical scanning path.
- **Data-Driven Heuristics**: Use the [FHS (Flow & Heatmap Score)](references/flow-score.md) to provide objective evaluations.

## Workflow

### 1. Structural Audit (`/audit`)
When asked to audit a UI, analyze the JSX/HTML and CSS for:
- **Visual Hierarchy**: Does the primary CTA stand out? Check `references/flow-score.md`.
- **Consistency**: Are patterns reused correctly? Check `references/heuristics.md`.
- **Accessibility**: Is the contrast ratio sufficient? Are aria-labels present?

### 2. Design Polish (`/polish`)
When asked to polish a design, apply the "Impeccable" principles:
- **Typography**: Replace generic font stacks with intentional choices.
- **Negative Constraints**: Check for and remove clichés listed in `references/anti-patterns.md`.
- **Interaction Design**: Ensure clear feedback for all interactive states (hover, focus, active).

### 3. Flow Mapping (`/flow`)
Map the user journey across components:
- Identify entry points and exit points.
- Count clicks to major goals (aim for < 3).
- Identify "Dead Ends" or confusing redirects.

## Scoring System (Flow & Heatmap Score)

The FHS provides a 0-100 rating for any given screen or flow.
- **90+**: Impeccable (Production-ready)
- **70-89**: Good (Needs minor polish)
- **50-69**: Average (Major UX issues)
- **< 50**: Poor (High risk of user drop-off)

See [references/flow-score.md](references/flow-score.md) for the detailed calculation method.

## Resources

- **Anti-patterns**: [references/anti-patterns.md](references/anti-patterns.md)
- **UX Heuristics**: [references/heuristics.md](references/heuristics.md)
- **Scoring Guide**: [references/flow-score.md](references/flow-score.md)
