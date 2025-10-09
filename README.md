# MXRP Web Platform

Una plataforma web moderna para la comunidad MXRP de roleplay en Roblox.

## 🚀 Características

- **Diseño Responsive**: Optimizado para móvil y desktop
- **Tema Día de Muertos**: Efectos especiales con humo animado y velas
- **Servidores en Tiempo Real**: Estado de servidores MXRP, MXRP B y MXRP C
- **Navegación Intuitiva**: Header con logo clickeable y footer completo
- **Páginas Legales**: Términos y Condiciones y Política de Privacidad

## 🛠️ Tecnologías

- **Next.js 15.5.4** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos utilitarios
- **Radix UI** - Componentes accesibles
- **Lucide React** - Iconos

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/mxrp-web.git

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

## 🔧 Variables de Entorno

Crea un archivo `.env` basado en `env.example`:

```env
MXRP=tu_server_key_mxrp
MXRPB=tu_server_key_mxrp_b
MXRPC=tu_server_key_mxrp_c
```

## 🚀 Despliegue

### Netlify
El proyecto está configurado para desplegarse automáticamente en Netlify.

### Build Manual
```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
mxrp-web/
├── app/                 # App Router de Next.js
│   ├── api/            # API Routes
│   ├── globals.css     # Estilos globales
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Página principal
├── components/         # Componentes React
│   ├── ui/            # Componentes de UI
│   ├── Header.tsx     # Header con navegación
│   ├── Hero.tsx       # Sección principal
│   └── ...
├── public/            # Archivos estáticos
│   └── images/        # Imágenes del proyecto
└── lib/               # Utilidades
```

## 🎨 Características Especiales

- **Efectos de Humo**: Animaciones CSS para temática Día de Muertos
- **Velas Animadas**: Efectos de parpadeo con sombras
- **API de Servidores**: Integración con api.policeroleplay.community
- **Responsive Design**: Adaptable a todos los dispositivos

## 📄 Licencia

Este proyecto es privado y pertenece a MXRP Community.

## 🤝 Contribución

Para contribuir al proyecto, contacta con el equipo de desarrollo de MXRP.

---

**MXRP ER:LC** - Servidor de roleplay de Roblox Liberty County
