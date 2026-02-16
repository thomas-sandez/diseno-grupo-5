import React, { useState, useEffect } from 'react';
import MainContent from '../components/MainContent';


function HomePage() {
  const [nombre, setNombre] = useState('Usuario');

  useEffect(() => {
    const loadUserName = () => {
      try {
        const userData = localStorage.getItem('userData');
        console.log('userData raw:', userData);
        
        if (userData) {
          const parsedData = JSON.parse(userData);
          console.log('userData parsed:', parsedData);
          
          // Intentar obtener el nombre de diferentes campos posibles
          const userName = parsedData.nombre || 
                          parsedData.name || 
                          parsedData.nombres || 
                          parsedData.usuario || 
                          'Usuario';
          
          console.log('userName final:', userName);
          setNombre(userName);
        } else {
          console.log('No hay userData en localStorage');
          setNombre('Usuario');
        }
      } catch (error) {
        console.error('Error al cargar nombre de usuario:', error);
        setNombre('Usuario');
      }
    };

    // Cargar nombre inicial
    loadUserName();

    // Escuchar cambios en localStorage
    window.addEventListener('storage', loadUserName);
    
    // También crear un evento personalizado para cambios locales
    const handleLocalUpdate = () => loadUserName();
    window.addEventListener('userDataUpdated', handleLocalUpdate);

    return () => {
      window.removeEventListener('storage', loadUserName);
      window.removeEventListener('userDataUpdated', handleLocalUpdate);
    };
  }, []);

  return <MainContent userName={nombre} />;
}

export default HomePage;
