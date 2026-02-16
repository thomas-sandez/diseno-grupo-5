import React from 'react';
import MemoriaAnual from '../components/MemoriaAnual';
import './Page.css';
import './MemoriaPage.css';

function MemoriaPage() {
  return (
    <div className="page-container memoria-page-container">
      <div className="page-content memoria-page-content">
        <MemoriaAnual />
      </div>
    </div>
  );
}

export default MemoriaPage;
