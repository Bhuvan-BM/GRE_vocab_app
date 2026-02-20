import React from "react";
import { createRoot } from "react-dom/client";
import GREApp from "./GRE_Vocab_Complete_App_FINAL.jsx";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <GREApp />
    </React.StrictMode>
);
