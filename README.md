# FotoMap Viewer 📸🗺️

**FotoMap Viewer** es una aplicación web de vanguardia diseñada para la visualización y análisis de colecciones fotográficas geolocalizadas. Permite a los usuarios cargar imágenes directamente desde su dispositivo, extraer metadatos técnicos (EXIF) y posicionarlas automáticamente en un mapa interactivo de alta precisión.

---

## 🚀 Stack Tecnológico

La aplicación utiliza un stack moderno enfocado en la velocidad, seguridad y escalabilidad:

- **Frontend**: 
  - **React 18**: Biblioteca principal para la interfaz de usuario.
  - **TypeScript**: Garantiza la integridad del código mediante tipado estático.
  - **Vite**: Herramienta de construcción ultrarrápida.
  - **Tailwind CSS**: Framework de estilos basado en utilidades para un diseño coherente.
  - **Lucide React**: Biblioteca de iconos vectoriales.
  - **Zustand**: Gestión de estado global ligera y eficiente.
  - **Framer Motion**: Animaciones fluidas y microinteracciones.

- **Mapping & Geospacial**:
  - **Leaflet**: Motor de mapas interactivos de código abierto.
  - **React Leaflet**: Integración de Leaflet en el ecosistema React.
  - **EXIF.js**: Extracción de metadatos directamente del binario de la imagen.

- **Infraestructura & Backend**:
  - **Clerk Auth**: Gestión avanzada de identidades y sesiones de usuario.
  - **Cloudflare D1**: Base de datos SQL distribuida para la persistencia de proyectos.
  - **Cloudflare R2**: Almacenamiento de objetos para activos de alto volumen.
  - **Cloudflare Workers**: Backend serverless para APIs de alto rendimiento.

---

## 🔒 Niveles de Acceso y Funcionalidades

### 👤 Usuarios No Registrados (Invitados)
- **Visualización**: Limitada a las primeras **50 fotografías** cargadas en el mapa.
- **Interacción**: Exploración básica del mapa y galería.
- **Exportación**: Únicamente disponible en formato **Excel (.xlsx)**.
- **Restricciones**: El resto de opciones avanzadas aparecen deshabilitadas (sombreadas).

### 🛡️ Usuarios Registrados (Cuentas Autenticadas)
- **Visualización**: Sin límites de cantidad de fotografías (sujeto a memoria del dispositivo).
- **Exportación Extendida**:
  - Excel (.xlsx)
  - **GeoJSON**: Formato estándar para intercambio de datos geográficos.
  - **KML**: Compatible con Google Earth y otras herramientas GIS.
  - **Shapefile (SHP)**: Formato profesional para análisis en software como QGIS o ArcGIS.
- **Herramientas de Análisis**:
  - **Mapa de Calor**: Visualización de densidad de fotos por área.
  - **Recorrido Cronológico**: Generación de líneas de tiempo espaciales que unen los puntos de las fotos por fecha.
- **Compartición**: Generación de un **Mapa Web Compartible (HTML)** autónomo con todos los puntos integrados.
- **Próximamente**: Guardado y sincronización de proyectos en la nube vinculados a la cuenta de Clerk.

---

## 🛠️ Instalación y Desarrollo Técnico

Para ejecutar este proyecto localmente:

1. Clonar el repositorio.
2. Instalar dependencias: `npm install`.
3. Configurar variables de entorno:
   - `VITE_CLERK_PUBLISHABLE_KEY`: Tu clave pública de Clerk. 
4. Iniciar servidor de desarrollo: `npm run dev`.

---

## ✍️ Créditos y Autoría

Desarrollado con pasión por **Aitor Sánchez Gutiérrez**.

- **Sitio Web/Blog**: [aitorblog.infinityfreeapp.com](https://aitorsanchez.pages.dev/)
- **Contacto**: [aitor-blog-contacto.vercel.app](https://aitor-blog-contacto.vercel.app/)
- **Más Proyectos**: [aitorhub.vercel.app](https://aitorhub.vercel.app/)

© 2026 - Todos los derechos reservados.

https://aitorsanchez.pages.dev/

