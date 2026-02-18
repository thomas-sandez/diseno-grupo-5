from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import (
    MemoriaAnual, IntegranteMemoria, ActividadMemoria, 
    PublicacionMemoria, PatenteMemoria, ProyectoMemoria
)
from .serializers import MemoriaAnualSerializer


class MemoriaAnualViewSet(viewsets.ModelViewSet):
    queryset = MemoriaAnual.objects.all()
    serializer_class = MemoriaAnualSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Crear una memoria anual con todas sus relaciones
        """
        data = request.data
        
        print("=" * 80)
        print("CREANDO MEMORIA ANUAL")
        print("Datos recibidos:", data)
        print("=" * 80)
        
        # Crear la memoria anual
        memoria_data = {
            'ano': data.get('ano'),
            'titulo': data.get('titulo', ''),
            'fechaInicio': data.get('fechaInicio'),
            'fechaFin': data.get('fechaFin'),
            'director': data.get('director', ''),
            'vicedirector': data.get('vicedirector', ''),
            'objetivosGenerales': data.get('objetivosGenerales', ''),
            'objetivosEspecificos': data.get('objetivosEspecificos', ''),
            'actividadesRealizadas': data.get('actividadesRealizadas', ''),
            'resultadosObtenidos': data.get('resultadosObtenidos', ''),
            'GrupoInvestigacion': data.get('GrupoInvestigacion')
        }
        
        serializer = self.get_serializer(data=memoria_data)
        serializer.is_valid(raise_exception=True)
        memoria = serializer.save()
        
        print(f"Memoria creada con ID: {memoria.oidMemoriaAnual}")
        
        # Agregar integrantes
        if 'integrantes' in data:
            print(f"Procesando {len(data['integrantes'])} integrantes...")
            for integrante in data['integrantes']:
                print(f"  - Creando integrante: {integrante}")
                IntegranteMemoria.objects.create(
                    MemoriaAnual=memoria,
                    Persona_id=integrante['personaId'],
                    rol=integrante.get('rol', ''),
                    dedicacion=integrante.get('dedicacion', '')
                )
        
        # Agregar actividades
        if 'actividades' in data:
            print(f"Procesando {len(data['actividades'])} actividades...")
            for actividad in data['actividades']:
                print(f"  - Creando actividad: {actividad}")
                ActividadMemoria.objects.create(
                    MemoriaAnual=memoria,
                    Actividad_id=actividad['actividadId'],
                    observaciones=actividad.get('observaciones', '')
                )
        
        # Agregar publicaciones
        if 'publicaciones' in data:
            print(f"Procesando {len(data['publicaciones'])} publicaciones...")
            for pub_id in data['publicaciones']:
                print(f"  - Creando publicacion ID: {pub_id}")
                PublicacionMemoria.objects.create(
                    MemoriaAnual=memoria,
                    TrabajoPublicado_id=pub_id
                )
        
        # Agregar patentes
        if 'patentes' in data:
            print(f"Procesando {len(data['patentes'])} patentes...")
            for pat_id in data['patentes']:
                print(f"  - Creando patente ID: {pat_id}")
                PatenteMemoria.objects.create(
                    MemoriaAnual=memoria,
                    Patente_id=pat_id
                )
        
        # Agregar proyectos
        if 'proyectos' in data:
            print(f"Procesando {len(data['proyectos'])} proyectos...")
            for proy_id in data['proyectos']:
                print(f"  - Creando proyecto ID: {proy_id}")
                ProyectoMemoria.objects.create(
                    MemoriaAnual=memoria,
                    ProyectoInvestigacion_id=proy_id
                )
        
        print("Memoria guardada exitosamente con todas las relaciones")
        print("=" * 80)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
