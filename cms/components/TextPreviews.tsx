import React, { type PropsWithChildren } from "react";

// Render custom content in Editor
export const TextLg = ({ children }: PropsWithChildren) => (
  <span
    style={{
      fontSize: "1.4rem",
      lineHeight: 1.1,
      fontWeight: "bold",
    }}
  >
    {children}
  </span>
);

export const TextBold = ({ children }: PropsWithChildren) => (
  <span
    style={{
      fontSize: "1rem",
      fontWeight: "bold",
    }}
  >
    {children}
  </span>
);

export const TextSm = ({ children }: PropsWithChildren) => (
  <span
    style={{
      fontSize: "0.7rem",
      lineHeight: "1rem",
    }}
  >
    {children}
  </span>
);

export const TextSpeaker = ({ children }: PropsWithChildren) => (
  <span
    style={{
      fontSize: "1.25rem",
      lineHeight: "1rem",
      textTransform: "uppercase",
    }}
  >
    {children}
  </span>
);

export const TextPullQuote = ({ children }: PropsWithChildren) => (
  <blockquote
    style={{ paddingLeft: "1em", borderLeft: "3px solid currentColor" }}
  >
    {children}
  </blockquote>
);
