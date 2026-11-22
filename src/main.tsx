import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main>
      <p>Open-source project · in development</p>
      <h1>RepairRelay</h1>
      <p>
        The development environment is ready. Product implementation is tracked
        in the repository.
      </p>
      <a href="https://github.com/ITJayasuriya/repairrelay">
        View source and contribute
      </a>
    </main>
  </React.StrictMode>,
);
