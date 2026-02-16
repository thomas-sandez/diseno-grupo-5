from rest_framework import serializers
from .models import (
    ProgramaActividades, GrupoInvestigacion, InformeRendicionCuentas,
    Erogacion, ProyectoInvestigacion, LineaDeInvestigacion, Actividad,
    Persona, ActividadDocente, InvestigadorDocente, BecarioPersonalFormacion,
    Investigador, DocumentacionBiblioteca, TrabajoPublicado, Autor, TipoTrabajoPublicado,
    ActividadTransferencia, ParteExterna, EquipamientoInfraestructura,
    TrabajoPresentado, ActividadXPersona, Patente, TipoDeRegistro, Registro,
    MemoriaAnual, IntegranteMemoria, ActividadMemoria, PublicacionMemoria, 
    PatenteMemoria, ProyectoMemoria
)


class LoginSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    contrasena = serializers.CharField(write_only=True, style={'input_type': 'password'})


class ProgramaActividadesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramaActividades
        fields = [
            'oidProgramaActividades',
            'anio',
            'objetivosEstrategicos'
        ]


class GrupoInvestigacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrupoInvestigacion
        fields = [
            'oidGrupoInvestigacion',
            'nombre',
            'facultadReginalAsignada',
            'correo',
            'organigrama',
            'sigla',
            'fuenteFinanciamiento',
            'ProgramaActividades'
        ]


class PatenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patente
        fields = '__all__'
        read_only_fields = ['id']


class TipoDeRegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoDeRegistro
        fields = '__all__'
        read_only_fields = ['id']


class RegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registro
        fields = '__all__'
        read_only_fields = ['id']


class AutorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Autor
        fields = '__all__'
        read_only_fields = ['oidAutor']


class TipoTrabajoPublicadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoTrabajoPublicado
        fields = '__all__'
        read_only_fields = ['oidTipoTrabajoPublicado']


class InformeRendicionCuentasSerializer(serializers.ModelSerializer):
    class Meta:
        model = InformeRendicionCuentas
        fields = [
            'oidInformeRendicionCuentas',
            'periodoReportado',
            'GrupoInvestigacion'
        ]


class ErogacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Erogacion
        fields = [
            'oidErogacion',
            'egresos',
            'ingresos',
            'numero',
            'tipoErogacion',
            'InformeRendicionCuentas'
        ]


class ProyectoInvestigacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProyectoInvestigacion
        fields = [
            'oidProyectoInvestigacion',
            'codigoProyecto',
            'descripcion',
            'objectType',
            'fechaFinalizacion',
            'fechaInicio',
            'nombre',
            'tipoProyecto',
            'logrosObtenidos',
            'fuenteFinanciamiento',
            'GrupoInvestigacion'
        ]


class LineaDeInvestigacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LineaDeInvestigacion
        fields = [
            'oidLineaDeInvestigacion',
            'nombre',
            'descripcion',
            'ProgramaActividades'
        ]


class ActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actividad
        fields = [
            'oidActividad',
            'descripcion',
            'fechaFin',
            'fechaInicio',
            'nro',
            'presupuestoAsignado',
            'resultadosEsperados',
            'LineaDeInvestigacion'
        ]


class PersonaSerializer(serializers.ModelSerializer):
    tipoDePersonalNombre = serializers.CharField(source='tipoDePersonal.nombre', read_only=True, allow_null=True)
    
    class Meta:
        model = Persona
        fields = [
            'oidpersona',
            'nombre',
            'correo',
            'contrasena',
            'apellido',
            'horasSemanales',
            'tipoDePersonal',
            'tipoDePersonalNombre',
            'GrupoInvestigacion'
        ]
        # La contraseña se incluye al leer pero nunca se actualiza via este serializer
        read_only_fields = ['contrasena']
    
    def validate_horasSemanales(self, value):
        if value < 0:
            raise serializers.ValidationError("Las horas semanales no pueden ser negativas")
        return value


class ActividadDocenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActividadDocente
        fields = [
            'oidActividadDocente',
            'denominacionCursoCatedra',
            'fechaPeriodoDictado',
            'rolDesenpeniado'
        ]


class InvestigadorDocenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestigadorDocente
        fields = [
            'oidinvestigadorDocente',
            'gradoAcademico',
            'persona',
            'ActividadDocente'
        ]


class BecarioPersonalFormacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BecarioPersonalFormacion
        fields = [
            'oidbecarioPersonalFormacioncol',
            'tipoFormacion',
            'fuenteFinanciamiento',
            'persona'
        ]


class InvestigadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investigador
        fields = [
            'oidInvestigador',
            'tipoInvestigador',
            'categoriaUtn',
            'dedicacion',
            'programaDeInsentivos',
            'persona',
            'GrupoInvestigacion'
        ]


class DocumentacionBibliotecaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentacionBiblioteca
        fields = [
            'oidDocumentacionBiblioteca',
            'anio',
            'editorial',
            'titulo',
            'autor',
            'GrupoInvestigacion'
        ]


class TrabajoPublicadoSerializer(serializers.ModelSerializer):
    # Campos anidados para lectura
    Autor_detalle = AutorSerializer(source='Autor', read_only=True)
    tipoTrabajoPublicado_detalle = TipoTrabajoPublicadoSerializer(source='tipoTrabajoPublicado', read_only=True)
    GrupoInvestigacion_detalle = GrupoInvestigacionSerializer(source='GrupoInvestigacion', read_only=True)
    
    class Meta:
        model = TrabajoPublicado
        fields = '__all__'
        # Solo el oid es read-only, estado puede ser actualizado
        read_only_fields = ['oidTrabajoPublicado']


class ActividadTransferenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActividadTransferencia
        fields = [
            'oidActividadTransferencia',
            'descripcion',
            'denominacion',
            'monto',
            'nroActividadTransferencia',
            'tipoActivdad',
            'GrupoInvestigacion'
        ]


class ParteExternaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParteExterna
        fields = [
            'oidParteExterna',
            'descripcion',
            'nombre',
            'tipoParte',
            'ActividadTransferencia'
        ]


class EquipamientoInfraestructuraSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipamientoInfraestructura
        fields = [
            'oidEquipamientoInfraestructura',
            'denominacion',
            'descripcion',
            'fechaIncoporacion',
            'montoInvertido',
            'GrupoInvestigacion'
        ]


class TrabajoPresentadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrabajoPresentado
        fields = '__all__'
        read_only_fields = ['id']


class ActividadXPersonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActividadXPersona
        fields = [
            'oidActividadXPersona',
            'Actividad',
            'persona'
        ]


class IntegranteMemoriaSerializer(serializers.ModelSerializer):
    persona_nombre = serializers.CharField(source='Persona.nombre', read_only=True)
    persona_apellido = serializers.CharField(source='Persona.apellido', read_only=True)
    
    class Meta:
        model = IntegranteMemoria
        fields = '__all__'
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=IntegranteMemoria.objects.all(),
                fields=['MemoriaAnual', 'Persona'],
                message='Esta persona ya está agregada como integrante de esta memoria anual.'
            )
        ]


class ActividadMemoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActividadMemoria
        fields = '__all__'
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=ActividadMemoria.objects.all(),
                fields=['MemoriaAnual', 'Actividad'],
                message='Esta actividad ya está agregada a esta memoria anual.'
            )
        ]


class PublicacionMemoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicacionMemoria
        fields = '__all__'
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=PublicacionMemoria.objects.all(),
                fields=['MemoriaAnual', 'TrabajoPublicado'],
                message='Esta publicación ya está agregada a esta memoria anual.'
            )
        ]


class PatenteMemoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatenteMemoria
        fields = '__all__'
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=PatenteMemoria.objects.all(),
                fields=['MemoriaAnual', 'Patente'],
                message='Esta patente ya está agregada a esta memoria anual.'
            )
        ]


class ProyectoMemoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProyectoMemoria
        fields = '__all__'
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=ProyectoMemoria.objects.all(),
                fields=['MemoriaAnual', 'ProyectoInvestigacion'],
                message='Este proyecto ya está agregado a esta memoria anual.'
            )
        ]


class MemoriaAnualSerializer(serializers.ModelSerializer):
    director_nombre = serializers.SerializerMethodField()
    vicedirector_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = MemoriaAnual
        fields = [
            'oidMemoriaAnual',
            'ano',
            'titulo',
            'fechaCreacion',
            'fechaModificacion',
            'director',
            'director_nombre',
            'vicedirector',
            'vicedirector_nombre',
            'objetivosGenerales',
            'objetivosEspecificos',
            'actividadesRealizadas',
            'resultadosObtenidos',
            'GrupoInvestigacion'
        ]
        read_only_fields = ['oidMemoriaAnual', 'fechaCreacion', 'fechaModificacion']
    
    def get_director_nombre(self, obj):
        if obj.director:
            try:
                from .models import Persona
                persona = Persona.objects.get(oidpersona=int(obj.director))
                return f"{persona.nombre} {persona.apellido}"
            except (Persona.DoesNotExist, ValueError):
                return obj.director
        return None
    
    def get_vicedirector_nombre(self, obj):
        if obj.vicedirector:
            try:
                from .models import Persona
                persona = Persona.objects.get(oidpersona=int(obj.vicedirector))
                return f"{persona.nombre} {persona.apellido}"
            except (Persona.DoesNotExist, ValueError):
                return obj.vicedirector
        return None
