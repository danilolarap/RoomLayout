# RoomLayout

## Descripción General

RoomLayout es una aplicación web interactiva para planear y visualizar habitaciones en 3D. Su interfaz permite distribuir muebles, ajustar su posición y acabados, y observar la incidencia de la luz solar en distintos momentos del día.

El proyecto combina una escena creada con Three.js, un catálogo de objetos low-poly y herramientas para guardar, cargar y exportar diseños. La interfaz está disponible en español e inglés.

**Eslogan:** El desorden organizándose.

---

## Características Técnicas

* **Visualización 3D y edición de espacios:**
  * Escena interactiva con vistas isométrica y superior.
  * Ajuste del ancho y largo de la habitación.
  * Colocación, desplazamiento, rotación y elevación de los muebles.
  * Modelos low-poly y materiales con texturas procedurales.
* **Catálogo de mobiliario:**
  * Objetos distribuidos en categorías como dormitorio, oficina, fitness, iluminación, almacenamiento, plantas y decoración.
  * Búsqueda de objetos y dimensiones visibles en sus tarjetas.
* **Personalización:**
  * Cambio de color en tiempo real para las superficies principales, conservando texturas y acabados como metales, cristales y pantallas.
* **Luz solar y análisis del espacio:**
  * Simulación horaria con una esfera solar sincronizada con la luz direccional y sus sombras.
  * Métricas de área ocupada y libre.
  * Análisis de colisiones, circulación y posibles problemas de distribución.
* **Proyectos e idioma:**
  * Guardado local de usuarios y diseños mediante IndexedDB.
  * Importación y exportación de diseños en formato JSON.
  * Interfaz traducible entre español e inglés y temas claro y oscuro.

---

## Tecnologías Utilizadas

* **Motor 3D:** Three.js r128, WebGL, `OrbitControls` y sombras `PCFSoftShadowMap`.
* **Interfaz:** HTML5, CSS3, Tailwind CSS y Font Awesome.
* **Almacenamiento local:** Dexie.js sobre IndexedDB y `localStorage` para la sesión del navegador.
* **Lógica de la aplicación:** JavaScript del lado del cliente.
* **Bibliotecas externas:** se cargan desde CDN; se requiere conexión a internet para utilizarlas.

---

## Estructura del Proyecto

~~~text
RoomLayout/
  css/
    styles.css                 Estilos personalizados del simulador
    login.css                  Estilos de acceso y registro
  js/
    auth/
      db.js                    Usuarios y proyectos en IndexedDB
      login.js                 Interacciones de acceso y registro
      session-guard.js         Proteccion de la pagina del simulador
    furniture/details/
      architecture.js          Detalles de ventanas y relojes
      bedroom-storage.js       Detalles de camas y almacenamiento
      decor.js                 Detalles de decoracion y textiles
      fitness.js               Detalles de equipo de ejercicio
      living-room.js           Detalles de muebles de sala
      workspace.js             Detalles de oficina y electronica
    projects/
      projects-ui.js           Guardado, carga e importacion de proyectos
    legacy/
      app.js                   Punto de entrada anterior, no cargado
      auth-ui.js               Interfaz de autenticacion anterior, no cargada
    ai-engine.js               Analisis de distribucion
    catalog.js                 Catalogo y tarjetas de muebles
    furniture-builder.js       Modelos base de los objetos
    inspector.js               Edicion de objetos seleccionados
    main.js                    Inicializacion de la aplicacion
    viewer-background.js       Entorno panoramico 360 y galeria de paisajes
    viewer-environment.js      Suelo exterior, decoracion 3D y vistas previas
    materials.js               Materiales y texturas procedurales
    scene.js                   Escena, camara, luz y controles 3D
    ui.js                      Interfaz, diagnosticos e idiomas
  index.html                   Simulador RoomLayout
  login.html                   Acceso, registro y modo invitado
  LICENSE
  README.md
  vercel.json
~~~
---

## Instalación y Uso

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/danilolarap/RoomLayout.git
   cd RoomLayout
   ```

2. Iniciar un servidor estático desde la carpeta del proyecto:

   ```bash
   python -m http.server 8000
   ```

3. Abrir [http://localhost:8000](http://localhost:8000) en el navegador. La página principal conduce a `login.html`, donde puedes iniciar sesión, crear una cuenta local o entrar como invitado.

No se requiere instalación de paquetes ni un paso de compilación. Para desplegar en Vercel, importa el repositorio y selecciona **Other** como preset; deja vacíos los comandos de build y el directorio de salida. La configuración estática se encuentra en `vercel.json`.

### Almacenamiento

Las cuentas y los proyectos se guardan en el almacenamiento local del navegador y no se sincronizan entre dispositivos. Usa la exportación JSON para guardar una copia o trasladar un diseño.

### Paisajes del visor

El botón **Temas 360°**, junto a **ISO 3D** y **PLANTA (TOP)**, abre una galería con nueve paisajes: **Calma**, **Halloween**, **Navidad**, **Fantasía**, **Bosque**, **Costa**, **Desierto**, **Sakura** y **Aurora**. Selecciona una miniatura, previsualiza **Día / Noche** y pulsa **Usar tema**. **Cancelar**, cerrar la galería o pulsar Escape conserva el paisaje actual; las vistas previas no cambian el modo de la aplicación.

El cielo panorámico usa Canvas 2D sobre una esfera independiente. El exterior tiene suelo real a `y = -0.008 m`, inmediatamente bajo el piso de la habitación (`y = 0`), y recibe sus sombras. Jardines, senderos, árboles, faroles, casas, lagunas y cristales son geometrías originales de Three.js; los elementos repetidos se agrupan con `InstancedMesh`. Las miniaturas muestran estos mismos entornos en 3D.

La vista inicial y los botones ISO/PLANTA acercan la cámara un 20 % respecto al encuadre anterior, sin cambiar las medidas de la habitación ni los muebles. La separación adicional de la decoración también usa un factor de `0.8` para que el entorno resulte más recogido. Al orbitar, suelo y decoración comparten las coordenadas reales de la habitación; el cuarto permanece apoyado en el terreno. El exterior se adapta al cambiar las dimensiones y queda fuera de la selección, las métricas y los datos guardados de los proyectos. La preferencia visual se guarda por separado en `localStorage` (`roomlayout_viewer_background`), sin imágenes externas ni dependencias adicionales.

**Modo Claro / Modo Oscuro** sincroniza el paisaje con el día y la noche. El único astro es el de la simulación: sol cálido en modo claro y luna con cráteres y luz fría en modo oscuro. Conserva el recorrido, el horario y las sombras sin modificar muebles, selección ni cámara.

Las nubes, estrellas, copos, pétalos y luciérnagas usan el bucle de render existente y se actualizan como máximo ocho veces por segundo; se pausan al ocultar la pestaña y se desactivan con **reducir movimiento**. El render PNG incluye el entorno y el único astro de la simulación, sin los controles de la interfaz.

---

## Autor

Desarrollado por [Danilo Lara](https://github.com/danilolarap).

## Licencia

Este proyecto se distribuye bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para ver sus términos.
