import { BrowserRouter, Routes, Route } from "react-router-dom";
import Prototype from "./pages/Prototype";
import Tuner from "./pages/Tuner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Prototype />} />
        <Route path="/tuner" element={<Tuner />} />
      </Routes>
    </BrowserRouter>
  );
}
