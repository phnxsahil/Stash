# UX Heuristics & Flow Principles

This reference guide provides the framework for auditing UI/UX flows based on Jakob Nielsen's 10 Usability Heuristics and modern flow-based design.

## Nielsen's 10 Usability Heuristics

1.  **Visibility of system status**: Keep the user informed about what's going on (e.g., loading spinners, progress bars).
2.  **Match between system and the real world**: Use common metaphors and language familiar to the user.
3.  **User control and freedom**: Provide "emergency exits" for mistakes (e.g., Undo, Cancel).
4.  **Consistency and standards**: Use established patterns; don't reinvent the wheel without a good reason.
5.  **Error prevention**: Eliminate error-prone conditions or check for them and present a confirmation option.
6.  **Recognition rather than recall**: Minimize memory load; make objects, actions, and options visible.
7.  **Flexibility and efficiency of use**: Provide accelerators (e.g., keyboard shortcuts) for expert users.
8.  **Aesthetic and minimalist design**: Remove irrelevant or rarely needed information.
9.  **Help users recognize, diagnose, and recover from errors**: Error messages should be clear, concise, and constructive.
10. **Help and documentation**: Provide easy-to-search documentation if the system is complex.

## Flow & Navigation Principles

- **Primary Action (Focal Point)**: Every screen should have one clear primary action.
- **Secondary Actions**: Distinguish them from the primary action via hierarchy (e.g., ghost buttons vs. solid buttons).
- **Navigation Depth**: Keep the user within 3 clicks of their goal.
- **Feedback Loops**: Every interaction (click, hover, submit) must provide visual or haptic feedback.
- **Micro-copy**: Button text should be action-oriented (e.g., "Connect Spotify" instead of "Submit").
- **State Management**: Clearly show Empty, Loading, Success, and Error states for every flow.
