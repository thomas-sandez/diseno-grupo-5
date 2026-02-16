import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './AcercaDePage.css';

function AcercaDePage() {
  const navigate = useNavigate();

  return (
    <div className="acerca-de-page">
      <div className="acerca-de-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Volver
        </button>

        <div className="acerca-de-content">
          <h1>Acerca de Nosotros</h1>
          
          <section className="about-project">
            <h2>Acerca del Proyecto</h2>
            <p>
              Sistema de Gestión de Información para el GIDAS (Grupo de Investigación y Desarrollo 
              en Arquitectura de Software). Esta plataforma permite la administración integral de 
              proyectos de investigación, memorias anuales, publicaciones, patentes y actividades 
              académicas del grupo.
            </p>
          </section>

          <section className="contact-section">
            <h2>Contacto GIDAS</h2>
            <div className="contact-info">
              <p><strong>Email:</strong> gidas@frlp.utn.edu.ar</p>
              <p><strong>Dirección:</strong> Av. 60 y 124, B1900TAG La Plata, Buenos Aires, Argentina</p>
              <p><strong>Teléfono:</strong> +54 221 412-2871</p>
            </div>
          </section>

          <section className="team-section">
            <h2>Equipo de Desarrollo</h2>
            <div className="contact-info">
              <p><strong>Comisión:</strong> S32</p>
              <p><strong>Materia:</strong> Diseño de Sistemas de Información</p>
              <p><strong>Contacto:</strong> grupo5disenioutn@gmail.com</p>
            </div>
          </section>

          <section className="university-section">
            <h2>Universidad Tecnológica Nacional</h2>
            <div className="contact-info">
              <p><strong>Facultad Regional La Plata</strong></p>
              <p>www.frlp.utn.edu.ar</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AcercaDePage;
