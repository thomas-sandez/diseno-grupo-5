from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.views import (
    ProgramaActividadesViewSet, GrupoInvestigacionViewSet,
    InformeRendicionCuentasViewSet, ErogacionViewSet,
    ProyectoInvestigacionViewSet, LineaDeInvestigacionViewSet,
    ActividadViewSet, PersonaViewSet, ActividadDocenteViewSet,
    InvestigadorDocenteViewSet, BecarioPersonalFormacionViewSet,
    InvestigadorViewSet, DocumentacionBibliotecaViewSet,
    TrabajoPublicadoViewSet, ActividadTransferenciaViewSet,
    ParteExternaViewSet, EquipamientoInfraestructuraViewSet,
    TrabajoPresentadoViewSet, ActividadXPersonaViewSet,
    login, register, perfil, actualizar_perfil, eliminar_persona, listar_personas, cambiar_contrasena, refresh_token, get_opciones_perfil, RegistroViewSet, PatenteViewSet, AutorViewSet, TipoTrabajoPublicadoViewSet, TipoDeRegistroViewSet,
    recuperar_password, restablecer_password, get_tipos_personal
)
from app.memoria_views import (
    MemoriaAnualViewSet, IntegranteMemoriaViewSet, ActividadMemoriaViewSet,
    PublicacionMemoriaViewSet, PatenteMemoriaViewSet, ProyectoMemoriaViewSet
)


router = DefaultRouter()

router.register(r'programa-actividades', ProgramaActividadesViewSet)
router.register(r'grupos', GrupoInvestigacionViewSet)
router.register(r'informes-rendicion', InformeRendicionCuentasViewSet)
router.register(r'erogaciones', ErogacionViewSet)
router.register(r'proyectos', ProyectoInvestigacionViewSet)
router.register(r'lineas-investigacion', LineaDeInvestigacionViewSet)
router.register(r'actividades', ActividadViewSet)
router.register(r'personas', PersonaViewSet)
router.register(r'actividades-docentes', ActividadDocenteViewSet)
router.register(r'investigadores-docentes', InvestigadorDocenteViewSet)
router.register(r'becarios', BecarioPersonalFormacionViewSet)
router.register(r'investigadores', InvestigadorViewSet)
router.register(r'documentacion', DocumentacionBibliotecaViewSet)
router.register(r'trabajos-publicados', TrabajoPublicadoViewSet)
router.register(r'actividades-transferencia', ActividadTransferenciaViewSet)
router.register(r'partes-externas', ParteExternaViewSet)
router.register(r'equipamiento', EquipamientoInfraestructuraViewSet)
router.register(r'trabajos-presentados', TrabajoPresentadoViewSet)
router.register(r'actividades-persona', ActividadXPersonaViewSet)
router.register(r'patentes', PatenteViewSet)
router.register(r'autores', AutorViewSet)
router.register(r'tipo-trabajos-publicados', TipoTrabajoPublicadoViewSet)
router.register(r'tipo-registros', TipoDeRegistroViewSet)
router.register(r'registros', RegistroViewSet)
router.register(r'memorias-anuales', MemoriaAnualViewSet)
router.register(r'integrantes-memoria', IntegranteMemoriaViewSet)
router.register(r'actividades-memoria', ActividadMemoriaViewSet)
router.register(r'publicaciones-memoria', PublicacionMemoriaViewSet)
router.register(r'patentes-memoria', PatenteMemoriaViewSet)
router.register(r'proyectos-memoria', ProyectoMemoriaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', login, name='login'),
    path('api/auth/register/', register, name='register'),
    path('api/auth/personas/', listar_personas, name='listar_personas'),
    path('api/auth/perfil/<int:oidpersona>/', perfil, name='perfil'),
    path('api/auth/perfil/<int:oidpersona>/actualizar/', actualizar_perfil, name='actualizar_perfil'),
    path('api/auth/perfil/<int:oidpersona>/cambiar-contrasena/', cambiar_contrasena, name='cambiar_contrasena'),
    path('api/auth/persona/<int:oidpersona>/eliminar/', eliminar_persona, name='eliminar_persona'),
    path('api/auth/refresh/', refresh_token, name='refresh_token'),
    path('api/auth/opciones-perfil/', get_opciones_perfil, name='opciones_perfil'),
    path('api/auth/recuperar-password/', recuperar_password, name='recuperar_password'),
    path('api/auth/restablecer-password/', restablecer_password, name='restablecer_password'),
    path('api/auth/tipos-personal/', get_tipos_personal, name='tipos_personal'),
]

# media serving removed (file uploads disabled)
