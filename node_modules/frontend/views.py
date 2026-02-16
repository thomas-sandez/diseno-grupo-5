

# ViewSets para Memoria Anual

class MemoriaAnualViewSet(viewsets.ModelViewSet):
    queryset = MemoriaAnual.objects.all()
    serializer_class = MemoriaAnualSerializer
    permission_classes = [AllowAny]

class IntegranteMemoriaViewSet(viewsets.ModelViewSet):
    queryset = IntegranteMemoria.objects.all()
    serializer_class = IntegranteMemoriaSerializer
    permission_classes = [AllowAny]

class TrabajoMemoriaViewSet(viewsets.ModelViewSet):
    queryset = TrabajoMemoria.objects.all()
    serializer_class = TrabajoMemoriaSerializer
    permission_classes = [AllowAny]

class ActividadMemoriaViewSet(viewsets.ModelViewSet):
    queryset = ActividadMemoria.objects.all()
    serializer_class = ActividadMemoriaSerializer
    permission_classes = [AllowAny]

class PublicacionMemoriaViewSet(viewsets.ModelViewSet):
    queryset = PublicacionMemoria.objects.all()
    serializer_class = PublicacionMemoriaSerializer
    permission_classes = [AllowAny]

class PatenteMemoriaViewSet(viewsets.ModelViewSet):
    queryset = PatenteMemoria.objects.all()
    serializer_class = PatenteMemoriaSerializer
    permission_classes = [AllowAny]

class ProyectoMemoriaViewSet(viewsets.ModelViewSet):
    queryset = ProyectoMemoria.objects.all()
    serializer_class = ProyectoMemoriaSerializer
    permission_classes = [AllowAny]
