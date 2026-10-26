# RoomLayout

**El desorden organizándose.** RoomLayout es un simulador web para planear habitaciones en 3D, acomodar muebles y observar cómo cambia la iluminación solar a lo largo del día.

## Funciones

- Vista 3D interactiva y vista superior de la habitación.
- Catálogo de muebles organizado por categorías.
- Colocación, movimiento, rotación y ajuste de altura de los objetos.
- Personalización de color con vista previa en tiempo real.
- Simulación de la trayectoria solar y de las sombras.
- Indicadores de espacio y análisis de distribución.
- Interfaz en español e inglés.
- Guardado y carga de diseños, además de importación y exportación JSON.

## Ejecutar localmente

El proyecto no necesita instalar dependencias ni compilarse. Desde la carpeta del proyecto, inicia un servidor estático:

```powershell
python -m http.server 8000
```

Abre [http://localhost:8000](http://localhost:8000). La página principal conduce al inicio de sesión; también puedes entrar en modo invitado.

Three.js, OrbitControls, Tailwind CSS, Font Awesome y Dexie se cargan desde CDN, por lo que se necesita conexión a internet para cargar esas bibliotecas.

## Publicar en Vercel

1. Importa `danilolarap/RoomLayout` desde GitHub en Vercel.
2. Selecciona **Other** como framework preset.
3. Deja vacíos el comando de build y el directorio de salida: el sitio sirve directamente los archivos estáticos del repositorio.
4. Despliega el proyecto. La configuración de `vercel.json` habilita URLs limpias y cabeceras básicas para las respuestas.

## Datos del navegador

Las cuentas y los diseños se almacenan en IndexedDB en el navegador actual. No hay un servicio de cuentas ni sincronización entre dispositivos configurado en este proyecto; exporta tus diseños a JSON para conservarlos o moverlos.

## Estructura

```text
RoomLayout/
├── index.html            # Simulador 3D
├── login.html            # Inicio de sesión y modo invitado
├── css/styles.css        # Estilos adicionales
├── js/
│   ├── auth/             # Base local de cuentas y proyectos
│   ├── catalog.js        # Catálogo y render de tarjetas
│   ├── furniture-builder.js # Geometría low-poly de los muebles
│   ├── materials.js      # Materiales y texturas
│   ├── scene.js          # Escena 3D, controles y luz solar
│   ├── inspector.js      # Edición del objeto seleccionado
│   ├── ai-engine.js      # Análisis de distribución
│   ├── ui.js             # Interfaz, traducciones y proyectos
│   └── main.js           # Inicialización de la aplicación
├── LICENSE
└── vercel.json
```

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta [LICENSE](LICENSE).
