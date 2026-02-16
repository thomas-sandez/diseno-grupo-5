from django.db import models
from django.core.validators import MinValueValidator


class ProgramaActividades(models.Model):
    oidProgramaActividades = models.AutoField(primary_key=True, unique=True)
    anio = models.IntegerField()
    objetivosEstrategicos = models.TextField()

    def __str__(self):
        return f"Programa {self.anio}"


class GrupoInvestigacion(models.Model):
    oidGrupoInvestigacion = models.AutoField(primary_key=True, unique=True)
    nombre = models.CharField(max_length=45, unique=True)
    facultadReginalAsignada = models.TextField()
    correo = models.TextField(unique=True)
    organigrama = models.TextField()
    sigla = models.CharField(max_length=45, unique=True)
    fuenteFinanciamiento = models.TextField()
    ProgramaActividades = models.ForeignKey(
        ProgramaActividades, on_delete=models.CASCADE
    )

    def __str__(self):
        return self.nombre

class Patente(models.Model):
    oidPatente = models.AutoField(primary_key=True, unique=True)
    descripcion = models.TextField()
    tipo = models.CharField(max_length=45)
    GrupoInvestigacion = models.ForeignKey(
        GrupoInvestigacion, on_delete=models.CASCADE
    )
    numero = models.CharField(max_length=100, unique=True)
    fecha = models.DateField(null=True, blank=True)
    inventor = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.descripcion} ({self.numero})"

class TipoDeRegistro(models.Model):
    oidTipoDeRegistro = models.AutoField(primary_key=True, unique=True)
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre


class Registro(models.Model):
    oidRegistro = models.AutoField(primary_key=True, unique=True)
    descripcion = models.TextField()
    TipoDeRegistro = models.ForeignKey(
        TipoDeRegistro, on_delete=models.CASCADE
    )
    Patente = models.OneToOneField(
        Patente, on_delete=models.CASCADE
    )


class InformeRendicionCuentas(models.Model):
    oidInformeRendicionCuentas = models.AutoField(primary_key=True, unique=True)
    periodoReportado = models.CharField(max_length=50)
    GrupoInvestigacion = models.ForeignKey(
        GrupoInvestigacion, on_delete=models.CASCADE
    )


class Erogacion(models.Model):
    oidErogacion = models.AutoField(primary_key=True, unique=True)
    egresos = models.FloatField()
    ingresos = models.FloatField()
    numero = models.IntegerField()
    tipoErogacion = models.TextField()
    InformeRendicionCuentas = models.ForeignKey(
        InformeRendicionCuentas, on_delete=models.CASCADE
    )


class ProyectoInvestigacion(models.Model):
    oidProyectoInvestigacion = models.AutoField(primary_key=True, unique=True)
    codigoProyecto = models.CharField(max_length=50, unique=True)
    descripcion = models.CharField(max_length=50)
    objectType = models.CharField(max_length=45)
    fechaFinalizacion = models.DateField()
    fechaInicio = models.DateField()
    nombre = models.CharField(max_length=45)
    tipoProyecto = models.CharField(max_length=50)
    logrosObtenidos = models.CharField(max_length=50)
    fuenteFinanciamiento = models.TextField()
    GrupoInvestigacion = models.ForeignKey(
        GrupoInvestigacion, on_delete=models.CASCADE
    )

    def __str__(self):
        return self.nombre


class LineaDeInvestigacion(models.Model):
    oidLineaDeInvestigacion = models.AutoField(primary_key=True, unique=True)
    nombre = models.CharField(max_length=45)
    descripcion = models.TextField()
    ProgramaActividades = models.ForeignKey(
        ProgramaActividades, on_delete=models.CASCADE
    )


class Actividad(models.Model):
    oidActividad = models.AutoField(primary_key=True, unique=True)
    descripcion = models.TextField()
    fechaFin = models.DateField()
    fechaInicio = models.DateField()
    nro = models.IntegerField()
    presupuestoAsignado = models.FloatField()
    resultadosEsperados = models.TextField()
    LineaDeInvestigacion = models.ForeignKey(
        LineaDeInvestigacion, on_delete=models.CASCADE
    )

class TipoDePersonal(models.Model):
    nombre = models.CharField(max_length=100)
    def __str__(self):
        return self.nombre

class Persona(models.Model):
    oidpersona = models.AutoField(primary_key=True, unique=True)
    nombre = models.CharField(max_length=45)
    apellido = models.CharField(max_length=45)
    correo = models.EmailField(unique=True)
    contrasena = models.CharField(max_length=128)
    horasSemanales = models.IntegerField(validators=[MinValueValidator(0, message="Las horas semanales no pueden ser negativas")])
    tipoDePersonal = models.ForeignKey(TipoDePersonal, on_delete=models.SET_NULL, null=True, blank=True)
    GrupoInvestigacion = models.ForeignKey(
        GrupoInvestigacion, on_delete=models.CASCADE, null=True, blank=True
    )

    @property
    def is_authenticated(self):
        return True

    def __str__(self):
        return f"{self.nombre} {self.apellido}"


class ActividadDocente(models.Model):
    oidActividadDocente = models.AutoField(primary_key=True, unique=True)
    denominacionCursoCatedra = models.TextField()
    fechaPeriodoDictado = models.DateTimeField()
    rolDesenpeniado = models.TextField()


class InvestigadorDocente(models.Model):
    oidinvestigadorDocente = models.AutoField(primary_key=True, unique=True)
    gradoAcademico = models.TextField()
    persona = models.OneToOneField(Persona, on_delete=models.CASCADE)
    ActividadDocente = models.ForeignKey(
        ActividadDocente, on_delete=models.CASCADE
    )


class BecarioPersonalFormacion(models.Model):
    oidbecarioPersonalFormacioncol = models.AutoField(primary_key=True, unique=True)
    tipoFormacion = models.TextField()
    fuenteFinanciamiento = models.TextField()
    persona = models.OneToOneField(Persona, on_delete=models.CASCADE)


class Investigador(models.Model):
    oidInvestigador = models.AutoField(primary_key=True, unique=True)
    tipoInvestigador = models.TextField()
    categoriaUtn = models.TextField()
    dedicacion = models.TextField()
    programaDeInsentivos = models.TextField()
    persona = models.OneToOneField(Persona, on_delete=models.CASCADE)
    GrupoInvestigacion = models.ForeignKey(
        GrupoInvestigacion, on_delete=models.CASCADE
    )


class DocumentacionBiblioteca(models.Model):
    oidDocumentacionBiblioteca = models.AutoField(primary_key=True, unique=True)
    anio = models.IntegerField()
    editorial = models.TextField()
    titulo = models.TextField()
    autor = models.TextField()
    GrupoInvestigacion = models.ForeignKey(
        GrupoInvestigacion, on_delete=models.CASCADE
    )


class Autor(models.Model):
    oidAutor = models.AutoField(primary_key=True, unique=True)
    nombre = models.CharField(max_length=45)
    apellido = models.CharField(max_length=45)


class TipoTrabajoPublicado(models.Model):
    oidTipoTrabajoPublicado = models.AutoField(primary_key=True, unique=True)
    nombre = models.CharField(max_length=100)

class TrabajoPublicado(models.Model):
    oidTrabajoPublicado = models.AutoField(primary_key=True, unique=True)
    titulo = models.TextField(unique=True)
    ISSN = models.CharField(max_length=55, unique=True)
    editorial = models.CharField(max_length=255)
    nombreRevista = models.CharField(max_length=255)
    pais = models.CharField(max_length=255)
    estado = models.CharField(max_length=55, default='Realizado')
    tipoTrabajoPublicado = models.ForeignKey(
        TipoTrabajoPublicado, on_delete=models.CASCADE
    )
    Autor = models.ForeignKey(
        Autor, on_delete=models.CASCADE
    )
    GrupoInvestigacion = models.ForeignKey(
        GrupoInvestigacion, on_delete=models.CASCADE
    )


class ActividadTransferencia(models.Model):
    oidActividadTransferencia = models.AutoField(primary_key=True, unique=True)
    descripcion = models.TextField()
    denominacion = models.TextField()
    monto = models.FloatField()
    nroActividadTransferencia = models.IntegerField()
    tipoActivdad = models.CharField(max_length=45)
    GrupoInvestigacion = models.ForeignKey(
        GrupoInvestigacion, on_delete=models.CASCADE
    )


class ParteExterna(models.Model):
    oidParteExterna = models.AutoField(primary_key=True, unique=True)
    descripcion = models.TextField()
    nombre = models.CharField(max_length=45)
    tipoParte = models.TextField()
    ActividadTransferencia = models.ForeignKey(
        ActividadTransferencia, on_delete=models.CASCADE
    )


class EquipamientoInfraestructura(models.Model):
    oidEquipamientoInfraestructura = models.AutoField(primary_key=True, unique=True)
    denominacion = models.TextField()
    descripcion = models.TextField()
    fechaIncoporacion = models.DateField()
    montoInvertido = models.FloatField()
    GrupoInvestigacion = models.ForeignKey(
        GrupoInvestigacion, on_delete=models.CASCADE
    )


class TrabajoPresentado(models.Model):
    oidTrabajoPresentado = models.AutoField(primary_key=True, unique=True)
    ciudad = models.TextField()
    fechaInicio = models.DateTimeField()
    nombreReunion = models.TextField()
    tituloTrabajo = models.TextField(unique=True)
    GrupoInvestigacion = models.ForeignKey(
        GrupoInvestigacion, on_delete=models.CASCADE
    )


class ActividadXPersona(models.Model):
    oidActividadXPersona = models.AutoField(primary_key=True, unique=True)
    Actividad = models.ForeignKey(Actividad, on_delete=models.CASCADE)
    persona = models.ForeignKey(Persona, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("Actividad", "persona")


class MemoriaAnual(models.Model):
    oidMemoriaAnual = models.AutoField(primary_key=True, unique=True)
    ano = models.IntegerField()
    titulo = models.CharField(max_length=200, blank=True, default='')
    fechaCreacion = models.DateTimeField(auto_now_add=True)
    fechaModificacion = models.DateTimeField(auto_now=True)
    
    # Información General (Tab 1)
    fechaInicio = models.DateField(null=True, blank=True)
    fechaFin = models.DateField(null=True, blank=True)
    
    # Integrantes del Grupo (Tab 2)
    director = models.CharField(max_length=200, blank=True)
    vicedirector = models.CharField(max_length=200, blank=True)
    
    # Actividades Desarrolladas (Tab 3)
    objetivosGenerales = models.TextField(blank=True)
    objetivosEspecificos = models.TextField(blank=True)
    actividadesRealizadas = models.TextField(blank=True)
    resultadosObtenidos = models.TextField(blank=True)
    
    # Relaciones con otras tablas (many-to-many)
    integrantes = models.ManyToManyField(Persona, through='IntegranteMemoria', related_name='memorias', blank=True)
    actividades = models.ManyToManyField(Actividad, through='ActividadMemoria', related_name='memorias', blank=True)
    publicaciones = models.ManyToManyField(TrabajoPublicado, through='PublicacionMemoria', related_name='memorias', blank=True)
    patentes = models.ManyToManyField(Patente, through='PatenteMemoria', related_name='memorias', blank=True)
    proyectos = models.ManyToManyField(ProyectoInvestigacion, through='ProyectoMemoria', related_name='memorias', blank=True)
    
    # Relación con el Grupo
    GrupoInvestigacion = models.ForeignKey(GrupoInvestigacion, on_delete=models.CASCADE, related_name='memorias', null=True, blank=True)
    
    def __str__(self):
        return f"Memoria Anual {self.ano} - {self.GrupoInvestigacion.nombre if self.GrupoInvestigacion else 'Sin grupo'}"


class IntegranteMemoria(models.Model):
    oidIntegranteMemoria = models.AutoField(primary_key=True, unique=True)
    MemoriaAnual = models.ForeignKey(MemoriaAnual, on_delete=models.CASCADE)
    Persona = models.ForeignKey(Persona, on_delete=models.CASCADE)
    rol = models.CharField(max_length=100, blank=True)
    dedicacion = models.CharField(max_length=100, blank=True)
    horasSemanales = models.IntegerField(default=0, validators=[MinValueValidator(0, message="Las horas semanales no pueden ser negativas")])
    
    class Meta:
        unique_together = ('MemoriaAnual', 'Persona')
    
    def __str__(self):
        return f"{self.Persona.nombre} - {self.MemoriaAnual}"


class ActividadMemoria(models.Model):
    oidActividadMemoria = models.AutoField(primary_key=True, unique=True)
    MemoriaAnual = models.ForeignKey(MemoriaAnual, on_delete=models.CASCADE)
    Actividad = models.ForeignKey(Actividad, on_delete=models.CASCADE)
    observaciones = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('MemoriaAnual', 'Actividad')
    
    def __str__(self):
        return f"{self.Actividad.nombre} - {self.MemoriaAnual}"


class PublicacionMemoria(models.Model):
    oidPublicacionMemoria = models.AutoField(primary_key=True, unique=True)
    MemoriaAnual = models.ForeignKey(MemoriaAnual, on_delete=models.CASCADE)
    TrabajoPublicado = models.ForeignKey(TrabajoPublicado, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('MemoriaAnual', 'TrabajoPublicado')
    
    def __str__(self):
        return f"{self.TrabajoPublicado.titulo} - {self.MemoriaAnual}"


class PatenteMemoria(models.Model):
    oidPatenteMemoria = models.AutoField(primary_key=True, unique=True)
    MemoriaAnual = models.ForeignKey(MemoriaAnual, on_delete=models.CASCADE)
    Patente = models.ForeignKey(Patente, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('MemoriaAnual', 'Patente')
    
    def __str__(self):
        return f"{self.Patente.descripcion} - {self.MemoriaAnual}"


class ProyectoMemoria(models.Model):
    oidProyectoMemoria = models.AutoField(primary_key=True, unique=True)
    MemoriaAnual = models.ForeignKey(MemoriaAnual, on_delete=models.CASCADE)
    ProyectoInvestigacion = models.ForeignKey(ProyectoInvestigacion, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('MemoriaAnual', 'ProyectoInvestigacion')
    
    def __str__(self):
        return f"{self.ProyectoInvestigacion.nombre} - {self.MemoriaAnual}"
