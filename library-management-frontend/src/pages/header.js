import React from "react";
import "./styles/header.css";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        📖 <span>MyLibrary</span>
      </div>
    </header>
  );
}
