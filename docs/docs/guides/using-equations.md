---
sidebar_position: 2
---

# Using Equations

`mk-notes` allows you to seamlessly integrate mathematical equations into your Notion pages using LaTeX syntax. This feature is perfect for technical documentation, academic notes, or any content requiring mathematical notation.

## Inline Equations

To embed an equation within a line of text, wrap your LaTeX code with single dollar signs (`$`).

### Example

Here is a sentence with an inline equation: $E = mc^2$.

This will be rendered as: "Here is a sentence with an inline equation: E = mc²."

## Block Equations

For more complex equations that require their own line, use double dollar signs (`$$`) to enclose your LaTeX code.

### Example

```latex
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

This will be displayed as a centered equation block on your Notion page.

## Supported Functions

`mk-notes` uses KaTeX to render LaTeX, so most of the common LaTeX functions are supported. You can check the official [KaTeX documentation](https://katex.org/docs/supported.html) for a full list of supported functions and symbols.
