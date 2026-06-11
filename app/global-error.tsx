"use client";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body
        style={{
          backgroundColor: "#0f0e0d",
          color: "#f5f0e8",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "sans-serif",
          gap: "12px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Something went wrong</h1>
        <p style={{ color: "#8a8480", fontSize: "14px" }}>
          {error?.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "8px",
            padding: "8px 20px",
            backgroundColor: "#d4a853",
            color: "#1a1917",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}