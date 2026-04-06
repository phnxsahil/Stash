# Heatmap & Attention Score Heuristic

This reference guide provides a method for estimating visual attention and flow efficiency without a real eye-tracking or heatmap tool. It uses code-based heuristics to calculate a **Flow & Heatmap Score (FHS)**.

## Attention Score Components

### 1. Element Weight (W)
Weight (W) is based on the element's visual prominence:
- **Hero Title (h1)**: 20 points
- **Primary Call to Action (CTA)**: 15 points
- **High-contrast Image/Graphic**: 10 points
- **Secondary Actions (ghost buttons)**: 5 points
- **Sub-headers (h2, h3)**: 5 points
- **Normal Text (p)**: 2 points
- **Navigation Links**: 2 points

### 2. Positioning Multiplier (P)
Position (P) multiplies the weight based on the standard F-pattern or Z-pattern:
- **Upper Left / Top Center**: x2.0 (High attention)
- **Middle Center (Above the Fold)**: x1.5
- **Lower Right / Footer**: x0.5 (Low attention)
- **Beyond the Fold**: x0.2

### 3. Whitespace & Clutter (C)
Clutter (C) penalizes the score if elements are too close:
- **Optimal Spacing (16px - 32px)**: +10 points (Bonus)
- **Tight Spacing (< 8px)**: -10 points (Penalty)
- **Information Density**: If a single 500x500px area contains more than 15 interactive elements, apply a 20% penalty.

## The Formula

The Total Attention Score (TAS) for a screen is:
`TAS = Σ (W * P) - C`

The **Flow & Heatmap Score (FHS)** is calculated as:
- **90-100**: Impeccable (Clear focus, minimal clutter)
- **70-89**: Good (Focus is clear but some clutter exists)
- **50-69**: Average (User might get lost)
- **< 50**: Poor (High cognitive load, unclear primary action)

## Visual Hierarchy Audit Checklist
- **Focal Point**: Does the primary action have the highest `(W * P)`?
- **Scanning Paths**: Does the attention flow naturally from top-left to bottom-right?
- **Distraction Analysis**: Are there any secondary elements that "steal" weight from the primary CTA?
