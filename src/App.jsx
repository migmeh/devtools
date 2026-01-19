import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
// Placeholder imports for pages
import Home from './pages/Home';
import ColorConverter from './pages/ColorConverter';
import ImagePicker from './pages/ImagePicker';
import GradientGenerator from './pages/Gradients';
import Palettes from './pages/Palettes';
import Shadows from './pages/Shadows';
import QuickNotes from './pages/QuickNotes';
import SvgTools from './pages/SvgTools';
import ColorReference from './pages/ColorReference';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="colors" element={<ColorConverter />} />
          <Route path="color-names" element={<ColorReference />} />
          <Route path="image-picker" element={<ImagePicker />} />
          <Route path="gradients" element={<GradientGenerator />} />
          <Route path="palettes" element={<Palettes />} />
          <Route path="shadows" element={<Shadows />} />
          <Route path="notes" element={<QuickNotes />} />
          <Route path="svg-tools" element={<SvgTools />} />
          {/* Add more routes here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
