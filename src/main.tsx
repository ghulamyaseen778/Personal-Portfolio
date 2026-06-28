import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider  } from "react-router-dom";
import "./styles/globals.css";
import App from "./App";
import { router } from "./routes/routes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
     <div style={{width:"100%",height:60,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>Current In Development & Testing phase</div>
    <RouterProvider router={router} />
  </React.StrictMode>
);