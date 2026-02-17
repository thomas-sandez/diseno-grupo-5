from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.conf import settings
from .models import (
    ProgramaActividades, GrupoInvestigacion, InformeRendicionCuentas,
    Erogacion, ProyectoInvestigacion, LineaDeInvestigacion, Actividad,
    Persona, ActividadDocente, InvestigadorDocente,
    BecarioPersonalFormacion, Investigador, DocumentacionBiblioteca,
    Autor, TipoTrabajoPublicado, TrabajoPublicado, ActividadTransferencia, ParteExterna,
    EquipamientoInfraestructura, TrabajoPresentado, ActividadXPersona, Patente, TipoDeRegistro, Registro,
    IntegranteMemoria, ActividadMemoria, PublicacionMemoria, PatenteMemoria, ProyectoMemoria, TipoDePersonal
)

from .serializers import (
    ProgramaActividadesSerializer, GrupoInvestigacionSerializer,
    InformeRendicionCuentasSerializer, ErogacionSerializer,
    ProyectoInvestigacionSerializer, LineaDeInvestigacionSerializer,
    ActividadSerializer, PersonaSerializer, ActividadDocenteSerializer,
    InvestigadorDocenteSerializer, BecarioPersonalFormacionSerializer,
    InvestigadorSerializer, DocumentacionBibliotecaSerializer,
    TrabajoPublicadoSerializer, ActividadTransferenciaSerializer,
    ParteExternaSerializer, EquipamientoInfraestructuraSerializer,
    TrabajoPresentadoSerializer, ActividadXPersonaSerializer, LoginSerializer, PatenteSerializer, TipoDeRegistroSerializer, RegistroSerializer,
    AutorSerializer, TipoTrabajoPublicadoSerializer,
    IntegranteMemoriaSerializer, ActividadMemoriaSerializer, PublicacionMemoriaSerializer, 
    PatenteMemoriaSerializer, ProyectoMemoriaSerializer
)

# Clase de paginación personalizada
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

# Create your views here.
def get_token_for_user(persona):
    # Attach tokens to the persona model using for_user so standard claims are present
    # and also include a custom 'oidpersona' claim (used by our custom auth class).
    refresh = RefreshToken.for_user(persona)
    refresh['oidpersona'] = persona.oidpersona
    refresh['correo'] = persona.correo
    refresh['nombre'] = persona.nombre
    refresh['apellido'] = persona.apellido

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    correo = serializer.validated_data['correo']
    contrasena = serializer.validated_data['contrasena']
    
    try:
        persona = Persona.objects.get(correo = correo)
    except Persona.DoesNotExist:
        return Response(
            {'error': 'Credenciales inválidas'},
            status = status.HTTP_401_UNAUTHORIZED
        )
    
    if not check_password(contrasena, persona.contrasena):
        return Response(
            {'error': 'Credenciales inválidas'},
            status = status.HTTP_401_UNAUTHORIZED
        )
    
    tokens = get_token_for_user(persona)
    serializer = PersonaSerializer(persona)

    return Response({
        'mensaje': 'Login exitoso',
        'persona': serializer.data,
        'tokens': tokens
    }, status = status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    # Expecting body { "refresh": "<refresh token>" }
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'Missing refresh token'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh_token)
        # produce a fresh access token
        access = str(token.access_token)
        return Response({'access': access}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Endpoint para registrar un nuevo usuario.
    """
    nombre = request.data.get('nombre')
    apellido = request.data.get('apellido')
    correo = request.data.get('correo')
    contrasena = request.data.get('contrasena')
    horas_semanales = request.data.get('horasSemanales')
    tipo_personal_id = request.data.get('tipoDePersonal')
    
    # Validar que todos los campos estén presentes
    if not all([nombre, apellido, correo, contrasena, horas_semanales]):
        return Response(
            {'error': 'Todos los campos son requeridos'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validar que el correo no exista
    if Persona.objects.filter(correo=correo).exists():
        return Response(
            {'error': 'El correo ya está registrado'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validar longitud de contraseña
    if len(contrasena) < 6:
        return Response(
            {'error': 'La contraseña debe tener al menos 6 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validar horas semanales
    try:
        horas_semanales = int(horas_semanales)
        if horas_semanales < 1 or horas_semanales > 168:
            raise ValueError()
    except (ValueError, TypeError):
        return Response(
            {'error': 'Las horas semanales deben ser un número entre 1 y 168'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Obtener TipoDePersonal si se proporciona
    tipo_personal = None
    if tipo_personal_id:
        try:
            tipo_personal = TipoDePersonal.objects.get(pk=tipo_personal_id)
        except TipoDePersonal.DoesNotExist:
            return Response(
                {'error': 'Tipo de personal inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Crear el usuario
    try:
        persona = Persona.objects.create(
            nombre=nombre,
            apellido=apellido,
            correo=correo,
            contrasena=make_password(contrasena),
            horasSemanales=horas_semanales,
            tipoDePersonal=tipo_personal
        )
        
        serializer = PersonaSerializer(persona)
        
        return Response({
            'mensaje': 'Usuario registrado exitosamente',
            'persona': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Error al crear el usuario: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_tipos_personal(request):
    """
    Endpoint para obtener los tipos de personal disponibles.
    """
    tipos = TipoDePersonal.objects.all()
    tipos_list = [{'id': tipo.id, 'nombre': tipo.nombre} for tipo in tipos]
    return Response(tipos_list, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def perfil(request, oidpersona):
    try:
        persona = Persona.objects.get(oidpersona = oidpersona)
        serializer = PersonaSerializer(persona)
        return Response({
            'persona': serializer.data
        }, status=status.HTTP_200_OK)
    except Persona.DoesNotExist:
        return Response(
            {'error': 'Persona no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def actualizar_perfil(request, oidpersona):
    try:
        persona = Persona.objects.get(oidpersona=oidpersona)
    except Persona.DoesNotExist:
        return Response(
            {'error': 'Persona no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = PersonaSerializer(persona, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({
            'mensaje': 'Perfil actualizado exitosamente',
            'persona': serializer.data
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_persona(request, oidpersona):
    try: 
        persona = Persona.objects.get(oidpersona=oidpersona)
        persona.delete()
        return Response(
            {'mensaje': 'Persona eliminada exitosamente'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Persona.DoesNotExist:
        return Response(
            {'error': 'Persona no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cambiar_contrasena(request, oidpersona):
    print(f"=== CAMBIAR CONTRASEÑA - Inicio ===")
    print(f"oidpersona recibido: {oidpersona}")
    print(f"Datos recibidos: {request.data}")
    
    try:
        persona = Persona.objects.get(oidpersona=oidpersona)
        print(f"Persona encontrada: {persona.correo}")
        print(f"Contraseña actual hasheada: {persona.contrasena[:20]}...")
    except Persona.DoesNotExist:
        print(f"ERROR: Persona con oidpersona={oidpersona} no encontrada")
        return Response(
            {'error': 'Persona no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    contrasena_actual = request.data.get('currentPassword')
    contrasena_nueva = request.data.get('newPassword')
    
    print(f"Contraseña actual recibida: {'***' if contrasena_actual else 'None'}")
    print(f"Contraseña nueva recibida: {'***' if contrasena_nueva else 'None'}")
    
    if not contrasena_actual or not contrasena_nueva:
        print("ERROR: Faltan contraseñas")
        return Response(
            {'error': 'Contraseña actual y nueva contraseña son requeridas'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar que la contraseña actual sea correcta
    password_check = check_password(contrasena_actual, persona.contrasena)
    print(f"Verificación de contraseña actual: {password_check}")
    
    if not password_check:
        print("ERROR: La contraseña actual es incorrecta")
        return Response(
            {'error': 'La contraseña actual es incorrecta'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validar longitud de la nueva contraseña
    if len(contrasena_nueva) < 6:
        print(f"ERROR: Contraseña nueva muy corta: {len(contrasena_nueva)} caracteres")
        return Response(
            {'error': 'La nueva contraseña debe tener al menos 6 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Actualizar contraseña
    print("Actualizando contraseña...")
    nueva_contrasena_hasheada = make_password(contrasena_nueva)
    print(f"Nueva contraseña hasheada: {nueva_contrasena_hasheada[:20]}...")
    persona.contrasena = nueva_contrasena_hasheada
    persona.save()
    print("Contraseña guardada en base de datos")
    
    # Verificar que se guardó correctamente
    persona.refresh_from_db()
    print(f"Contraseña en BD después de guardar: {persona.contrasena[:20]}...")
    
    print("=== CAMBIAR CONTRASEÑA - Éxito ===")
    return Response({
        'mensaje': 'Contraseña actualizada exitosamente'
    }, status=status.HTTP_200_OK)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_personas(request):
    personas = Persona.objects.all()
    serializer = PersonaSerializer(personas, many=True)
    return Response({
        'personas': serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_opciones_perfil(request):
    """
    Retorna las opciones disponibles para los campos del perfil
    """
    from .models import TipoDePersonal, GrupoInvestigacion
    
    tipos_personal = TipoDePersonal.objects.all()
    grupos = GrupoInvestigacion.objects.all()
    
    return Response({
        'tiposPersonal': [{'id': tp.id, 'nombre': tp.nombre} for tp in tipos_personal],
        'grupos': [{'id': g.oidGrupoInvestigacion, 'nombre': g.nombre} for g in grupos],
        'gradosAcademicos': [
            {'id': 1, 'nombre': 'Licenciatura'},
            {'id': 2, 'nombre': 'Maestría'},
            {'id': 3, 'nombre': 'Doctorado'},
            {'id': 4, 'nombre': 'Post-Doctorado'}
        ],
        'categoriasUTN': [
            {'id': 1, 'nombre': 'Categoría I'},
            {'id': 2, 'nombre': 'Categoría II'},
            {'id': 3, 'nombre': 'Categoría III'},
            {'id': 4, 'nombre': 'Categoría IV'},
            {'id': 5, 'nombre': 'Categoría V'}
        ],
        'dedicaciones': [
            {'id': 1, 'nombre': 'Simple'},
            {'id': 2, 'nombre': 'Semi-Exclusiva'},
            {'id': 3, 'nombre': 'Exclusiva'}
        ],
        'programasIncentivos': [
            {'id': 1, 'nombre': 'Programa Nacional de Incentivos'},
            {'id': 2, 'nombre': 'Programa Provincial'},
            {'id': 3, 'nombre': 'Otro'}
        ],
        'cursosCatedras': [
            {'id': 1, 'nombre': 'Análisis Matemático'},
            {'id': 2, 'nombre': 'Álgebra'},
            {'id': 3, 'nombre': 'Física'},
            {'id': 4, 'nombre': 'Química'},
            {'id': 5, 'nombre': 'Programación'}
        ],
        'roles': [
            {'id': 1, 'nombre': 'Profesor Titular'},
            {'id': 2, 'nombre': 'Profesor Adjunto'},
            {'id': 3, 'nombre': 'Jefe de Trabajos Prácticos'},
            {'id': 4, 'nombre': 'Auxiliar Docente'}
        ]
    }, status=status.HTTP_200_OK)

# ViewSets for models
class ProgramaActividadesViewSet(viewsets.ModelViewSet):
    queryset = ProgramaActividades.objects.all()
    serializer_class = ProgramaActividadesSerializer


class GrupoInvestigacionViewSet(viewsets.ModelViewSet):
    queryset = GrupoInvestigacion.objects.all()
    serializer_class = GrupoInvestigacionSerializer
    permission_classes = [AllowAny]


class InformeRendicionCuentasViewSet(viewsets.ModelViewSet):
    queryset = InformeRendicionCuentas.objects.all()
    serializer_class = InformeRendicionCuentasSerializer


class ErogacionViewSet(viewsets.ModelViewSet):
    queryset = Erogacion.objects.all()
    serializer_class = ErogacionSerializer


class ProyectoInvestigacionViewSet(viewsets.ModelViewSet):
    queryset = ProyectoInvestigacion.objects.all()
    serializer_class = ProyectoInvestigacionSerializer


class LineaDeInvestigacionViewSet(viewsets.ModelViewSet):
    queryset = LineaDeInvestigacion.objects.all()
    serializer_class = LineaDeInvestigacionSerializer


class ActividadViewSet(viewsets.ModelViewSet):
    queryset = Actividad.objects.all()
    serializer_class = ActividadSerializer


class PersonaViewSet(viewsets.ModelViewSet):
    queryset = Persona.objects.all()
    serializer_class = PersonaSerializer


class ActividadDocenteViewSet(viewsets.ModelViewSet):
    queryset = ActividadDocente.objects.all()
    serializer_class = ActividadDocenteSerializer


class InvestigadorDocenteViewSet(viewsets.ModelViewSet):
    queryset = InvestigadorDocente.objects.all()
    serializer_class = InvestigadorDocenteSerializer


class BecarioPersonalFormacionViewSet(viewsets.ModelViewSet):
    queryset = BecarioPersonalFormacion.objects.all()
    serializer_class = BecarioPersonalFormacionSerializer


class InvestigadorViewSet(viewsets.ModelViewSet):
    queryset = Investigador.objects.all()
    serializer_class = InvestigadorSerializer


class DocumentacionBibliotecaViewSet(viewsets.ModelViewSet):
    queryset = DocumentacionBiblioteca.objects.all()
    serializer_class = DocumentacionBibliotecaSerializer


class TrabajoPublicadoViewSet(viewsets.ModelViewSet):
    queryset = TrabajoPublicado.objects.all()
    serializer_class = TrabajoPublicadoSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination


class ActividadTransferenciaViewSet(viewsets.ModelViewSet):
    queryset = ActividadTransferencia.objects.all()
    serializer_class = ActividadTransferenciaSerializer


class ParteExternaViewSet(viewsets.ModelViewSet):
    queryset = ParteExterna.objects.all()
    serializer_class = ParteExternaSerializer


class EquipamientoInfraestructuraViewSet(viewsets.ModelViewSet):
    queryset = EquipamientoInfraestructura.objects.all()
    serializer_class = EquipamientoInfraestructuraSerializer


class TrabajoPresentadoViewSet(viewsets.ModelViewSet):
    queryset = TrabajoPresentado.objects.all()
    serializer_class = TrabajoPresentadoSerializer
    pagination_class = StandardResultsSetPagination


class ActividadXPersonaViewSet(viewsets.ModelViewSet):
    queryset = ActividadXPersona.objects.all()
    serializer_class = ActividadXPersonaSerializer


class PatenteViewSet(viewsets.ModelViewSet):
    queryset = Patente.objects.all()
    serializer_class = PatenteSerializer
    pagination_class = StandardResultsSetPagination


class AutorViewSet(viewsets.ModelViewSet):
    queryset = Autor.objects.all()
    serializer_class = AutorSerializer
    permission_classes = [AllowAny]


class TipoTrabajoPublicadoViewSet(viewsets.ModelViewSet):
    queryset = TipoTrabajoPublicado.objects.all()
    serializer_class = TipoTrabajoPublicadoSerializer
    permission_classes = [AllowAny]

class RegistroViewSet(viewsets.ModelViewSet):
    queryset = Registro.objects.all()
    serializer_class = RegistroSerializer
    pagination_class = StandardResultsSetPagination


class TipoDeRegistroViewSet(viewsets.ModelViewSet):
    queryset = TipoDeRegistro.objects.all()
    serializer_class = TipoDeRegistroSerializer


class IntegranteMemoriaViewSet(viewsets.ModelViewSet):
    queryset = IntegranteMemoria.objects.all()
    serializer_class = IntegranteMemoriaSerializer
    filterset_fields = ['MemoriaAnual']


class ActividadMemoriaViewSet(viewsets.ModelViewSet):
    queryset = ActividadMemoria.objects.all()
    serializer_class = ActividadMemoriaSerializer
    filterset_fields = ['MemoriaAnual']


class PublicacionMemoriaViewSet(viewsets.ModelViewSet):
    queryset = PublicacionMemoria.objects.all()
    serializer_class = PublicacionMemoriaSerializer
    filterset_fields = ['MemoriaAnual']


class PatenteMemoriaViewSet(viewsets.ModelViewSet):
    queryset = PatenteMemoria.objects.all()
    serializer_class = PatenteMemoriaSerializer
    filterset_fields = ['MemoriaAnual']


class ProyectoMemoriaViewSet(viewsets.ModelViewSet):
    queryset = ProyectoMemoria.objects.all()
    serializer_class = ProyectoMemoriaSerializer
    filterset_fields = ['MemoriaAnual']


@api_view(['POST'])
@permission_classes([AllowAny])
def recuperar_password(request):
    """
    Endpoint para solicitar recuperación de contraseña.
    Genera un token temporal y lo envía por email.
    """
    correo = request.data.get('correo')
    
    print(f"\n{'='*60}")
    print(f"RECUPERAR PASSWORD - Request recibido")
    print(f"Email solicitado: {correo}")
    print(f"{'='*60}")
    
    if not correo:
        print("✗ Error: Email no proporcionado")
        return Response(
            {'error': 'El email es requerido'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        persona = Persona.objects.get(correo=correo)
        print(f"✓ Persona encontrada: {persona.nombre} {persona.apellido}")
        
        # Generar token de recuperación con timestamp
        import secrets
        import time
        import base64
        
        timestamp = int(time.time())
        token_data = f"{persona.oidpersona}:{timestamp}"
        token = base64.urlsafe_b64encode(token_data.encode()).decode()
        
        # URL de recuperación
        reset_url = f"http://localhost:5173/reset-password?token={token}"
        
        # Enviar email
        subject = 'Recuperación de Contraseña - UTN'
        message = f'''
Hola {persona.nombre},

Has solicitado recuperar tu contraseña.

Para restablecer tu contraseña, haz clic en el siguiente enlace:
{reset_url}

Este enlace expirará en 24 horas.

Si no solicitaste este cambio, puedes ignorar este mensaje.

Saludos,
Equipo UTN
        '''
        
        print(f"Intentando enviar email a: {correo}")
        print(f"Desde: {settings.DEFAULT_FROM_EMAIL}")
        
        try:
            result = send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [correo],
                fail_silently=False,
            )
            print(f"✓ Email enviado exitosamente (result={result})")
            print(f"Token: {token}")
            print(f"Enlace: {reset_url}")
        except Exception as e:
            print(f"✗ Error al enviar email: {type(e).__name__}: {str(e)}")
            print(f"Token para desarrollo: {token}")
            print(f"Enlace para desarrollo: {reset_url}")
            import traceback
            traceback.print_exc()
        
    except Persona.DoesNotExist:
        print(f"✗ No existe persona con email: {correo}")
        pass
    
    print(f"{'='*60}\n")
    
    return Response(
        {'mensaje': 'Si el email existe, recibirás un enlace de recuperación'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def restablecer_password(request):
    """
    Endpoint para restablecer la contraseña usando el token.
    """
    token = request.data.get('token')
    nueva_password = request.data.get('password')
    
    print(f"\n{'='*60}")
    print(f"RESTABLECER PASSWORD - Request recibido")
    print(f"{'='*60}")
    
    if not token or not nueva_password:
        print("✗ Error: Token o contraseña no proporcionados")
        return Response(
            {'error': 'Token y contraseña son requeridos'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validar longitud de contraseña
    if len(nueva_password) < 6:
        print("✗ Error: Contraseña muy corta")
        return Response(
            {'error': 'La contraseña debe tener al menos 6 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Decodificar el token
        import base64
        import time
        
        token_data = base64.urlsafe_b64decode(token.encode()).decode()
        oidpersona, timestamp = token_data.split(':')
        oidpersona = int(oidpersona)
        timestamp = int(timestamp)
        
        # Verificar que el token no haya expirado (24 horas = 86400 segundos)
        current_time = int(time.time())
        if current_time - timestamp > 86400:
            print("✗ Error: Token expirado")
            return Response(
                {'error': 'El enlace ha expirado. Solicita uno nuevo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Buscar la persona
        try:
            persona = Persona.objects.get(oidpersona=oidpersona)
            print(f"✓ Persona encontrada: {persona.nombre} {persona.apellido}")
            
            # Verificar que la nueva contraseña no sea igual a la actual
            if check_password(nueva_password, persona.contrasena):
                print("✗ Error: La nueva contraseña es idéntica a la actual")
                return Response(
                    {'error': 'La nueva contraseña no puede ser igual a la contraseña actual'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Actualizar la contraseña
            persona.contrasena = make_password(nueva_password)
            persona.save()
            
            print(f"✓ Contraseña actualizada exitosamente")
            print(f"{'='*60}\n")
            
            return Response(
                {'mensaje': 'Contraseña restablecida exitosamente'},
                status=status.HTTP_200_OK
            )
            
        except Persona.DoesNotExist:
            print(f"✗ Error: Persona no encontrada (oid={oidpersona})")
            return Response(
                {'error': 'Token inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except Exception as e:
        print(f"✗ Error al procesar token: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        print(f"{'='*60}\n")
        return Response(
            {'error': 'Token inválido o corrupto'},
            status=status.HTTP_400_BAD_REQUEST
        )
