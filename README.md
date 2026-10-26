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

```text
RoomLayout/
├── css/
│   └── styles.css              # Estilos personalizados
├── js/
│   ├── auth/
│   │   ├── auth-ui.js          # Interfaz de autenticación
│   │   └── db.js               # Usuarios y diseños en IndexedDB
│   ├── ai-engine.js            # Análisis de distribución
│   ├── app.js                  # Textos y controles de la interfaz
│   ├── catalog.js              # Catálogo y tarjetas de muebles
│   ├── furniture-builder.js    # Geometría low-poly de los objetos
│   ├── inspector.js            # Edición de objetos seleccionados
│   ├── main.js                 # Inicialización y eventos principales
│   ├── materials.js            # Materiales y texturas procedurales
│   ├── scene.js                # Escena, cámara, luz solar y controles 3D
│   └── ui.js                   # Interfaz, proyectos e internacionalización
├── index.html                  # Simulador RoomLayout
├── login.html                  # Acceso, registro y modo invitado
├── LICENSE                     # Licencia MIT
├── README.md                   # Documentación del repositorio
└── vercel.json                 # Configuración de alojamiento estático
```

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

---

## Autor

Desarrollado por [Danilo Lara](https://github.com/danilolarap).

## Licencia

Este proyecto se distribuye bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para ver sus términos.
