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
  * Avisos solo por objetos que se atraviesan o sobrepasan los límites de la habitación.
* **Proyectos e idioma:**
  * Guardado local de usuarios y diseños mediante IndexedDB.
  * Archivos portátiles de diseño con extensión `.roomlayout`, validados antes de abrirlos.
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
      project-file.js          Formato portatil .roomlayout y validacion
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

### Diagnóstico del diseño

El asistente usa comprobaciones geométricas locales. Revisa las piezas de cada modelo por separado, con sus posiciones, giros y escalas, en lugar de considerar todo el volumen que envuelve un mueble como sólido. Así, los huecos de un escritorio en L y el espacio libre bajo su tablero no generan avisos por sí solos. Los anillos y recipientes abiertos se separan en segmentos para conservar sus huecos. Se aplica una tolerancia de contacto de 3 mm y de 2 cm en los límites del cuarto.

Solo muestra comentarios cuando dos objetos se atraviesan o un objeto queda fuera de los límites horizontales o bajo el piso. Incluye la puerta física y excluye su guía de apertura. No comenta sobre ocupación, ergonomía, objetos flotando ni proximidad a la puerta. Sin conflictos, el panel de comentarios permanece oculto. Mientras se editan paredes, se pausa el diagnóstico y se actualiza al terminar.

Para ejecutar las pruebas de desarrollo con la misma versión de Three.js que usa el visor: `npm install` y `npm test` (en PowerShell con scripts deshabilitados, `npm.cmd install` y `npm.cmd test`). Esta dependencia se usa solo para las pruebas; el sitio sigue funcionando sin compilación.

### Almacenamiento

Las cuentas y los proyectos se guardan en el almacenamiento local del navegador y no se sincronizan entre dispositivos. Pulsa **Guardar** para descargar un archivo `.roomlayout`. En otro equipo, abre RoomLayout, entra a **Mis diseños** y pulsa **Abrir archivo** para recuperar el diseño. También funciona en modo invitado. Con una cuenta activa se conserva además una copia local; los diseños locales anteriores siguen disponibles.

El archivo conserva dimensiones, hora solar, paredes, muebles, colores, posiciones, rotaciones y uniones a paredes. El paisaje del visor sigue siendo una preferencia local independiente. **Descargar archivo** genera el mismo formato desde el panel de diseños. Los JSON antiguos no se aceptan como archivos portátiles; puedes abrir un proyecto ya guardado localmente y volver a guardarlo para obtener el formato nuevo.

El contenedor binario v1 incluye una cabecera RoomLayout, versión, longitud y suma SHA-256 del contenido. Se comprueban su estructura, integridad y límites (10 MB, 2000 objetos y 500 paredes) antes de modificar la escena. Cambiar la extensión de un JSON no lo convierte en un archivo válido. Guardar y verificar archivos requiere HTTPS o localhost.

Esta validación detecta daños y formatos ajenos, pero no certifica el origen: el archivo no está cifrado ni firmado por un servidor. No impide que otro programa lo inspeccione o reproduzca. Garantizar que solo se acepten archivos emitidos por RoomLayout requeriría un servicio de firma con una clave privada fuera del navegador. La aplicación web tampoco registra una asociación de archivos del sistema operativo; se abren desde **Abrir archivo** dentro de RoomLayout.

### Edición de paredes

Pulsa **Editar paredes** sobre el catálogo. Selecciona una pared desde la lista o directamente en la escena y arrástrala sobre la cuadrícula. El inspector permite cambiar su longitud, altura, posición X/Z y ángulo, colocarla en cualquiera de los cuatro bordes o eliminarla. **Agregar pared** crea una división adicional; **Terminar edición de paredes** vuelve a la selección de muebles.

Durante la edición, todos los muebles y la puerta se ocultan y conservan su posición y orientación. Cambiar de borde, arrastrar, agregar o eliminar paredes no los recoloca. Al terminar reaparecen en su lugar; los objetos unidos a una pared modificada quedan desligados de ella para evitar desplazamientos posteriores. Si una pared nueva coincide con un objeto, puedes moverlo después. Los campos del inspector usan botones **− / +**: pasos de 5 cm para medidas y posiciones, y de 15° para el ángulo; también permiten escribir valores directamente.

Todas las paredes conservan el acabado translúcido y la opacidad dinámica según la cámara. Las paredes asignadas a un borde se ajustan al cambiar las dimensiones del cuarto; las de posición libre conservan su disposición dentro de los nuevos límites. La distribución se incluye al guardar, cargar, importar y exportar proyectos. Los diseños anteriores mantienen las dos paredes originales.

Las paredes arrastradas o colocadas manualmente junto a un borde se detectan automáticamente: al ampliar o reducir la sala, siguen ese borde y ajustan su longitud. Los tramos parciales conservan su proporción y ubicación sobre el borde. También se reconocen las paredes de borde de proyectos ya guardados.

Al acercar muebles, puertas o elementos de pared, se ajustan a la superficie con una separación de 8 mm para evitar caras superpuestas. La puerta conserva la orientación elegida manualmente al pegarla o redimensionar la sala. Las ventanas y otros elementos de pared se orientan al pegarlos; el arrastre comprueba el recorrido para impedir que atraviesen paredes, incluidos tabiques diagonales. Fuera del modo de edición de paredes, los objetos pegados siguen a su pared al redimensionar la sala, y esa unión se guarda en el proyecto. Si un objeto nuevo no cabe entre las paredes, se muestra un aviso en el inspector.

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
