"use client";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body
        style={{
          backgroundColor: "#080808",
          color: "#f0f0f0",
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
        <p style={{ color: "#666666", fontSize: "14px" }}>
          {error?.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "8px",
            padding: "8px 20px",
            backgroundColor: "#a855f7",
            color: "#fff",
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