import React from "react";
import { createRoot } from "react-dom/client";
import AppWithAuth from "./AppWithAuth.jsx";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <AppWithAuth />
    </React.StrictMode>
);
