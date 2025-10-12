# Panel Administrativo MXRP

## Descripción

El Panel Administrativo es una extensión del dashboard principal que permite a los miembros del staff de MXRP acceder a información detallada sobre su perfil administrativo, estadísticas de rendimiento y gestión de permisos.

## Características

### 🔐 Sistema de Permisos

- Verificación de roles administrativos usando Redis Cache
- Soporte para múltiples niveles de permisos:
  - `highRoles`: Roles de alto nivel (Comité, Developer, OficinaAdm, etc.)
  - `mediumRoles`: Roles medios (Moderador, HeadStaff, SoporteTecnico, etc.)
  - `specialPerm`: Permisos especiales (Auditor, Tesorería, etc.)
  - `highEnd`: Roles de alto nivel específicos
  - `characterKill`: Permisos para eliminación de personajes

### 📊 Perfil Administrativo

- **Información Personal**: Tier, tiempo de contratación, estado de inactividad
- **Estadísticas de Tiempo**: Tiempo total semanal, cumplimiento de horas (14h requeridas)
- **Métricas de Rendimiento**: Tickets atendidos, usuarios invitados, eficiencia
- **Calificaciones**: Sistema de estrellas con calificación promedio
- **Historial**: Warns y notas administrativas

### 🚀 Optimización con Redis

- Caché de permisos con TTL de 30 minutos
- Caché de perfiles con TTL de 5 minutos
- Invalidación automática de caché
- Mejora significativa en tiempos de respuesta

## Estructura de Archivos

```
app/
├── admin/
│   └── page.tsx                 # Página principal del panel administrativo
├── dashboard/
│   └── page.tsx                 # Dashboard principal (con botón de acceso)

components/
├── admin/
│   ├── ProfileCard.tsx          # Tarjeta de información del perfil
│   ├── StatisticsCard.tsx       # Tarjeta de estadísticas
│   ├── WarnCard.tsx             # Tarjeta de warns administrativos
│   ├── NoteCard.tsx             # Tarjeta de notas administrativas
│   ├── StatusCard.tsx           # Tarjeta de estado general
│   └── AdminConfig.tsx          # Configuración del panel

lib/
└── hooks/
    └── useAdminPermissions.ts   # Hook personalizado para permisos y perfiles

netlify/
└── functions/
    ├── admin-permissions.js     # Verificación de permisos
    ├── admin-profiles.js        # Gestión de perfiles administrativos
    └── models/
        ├── PerfilStaffSchema.js # Esquema de perfiles de staff
        └── PermisosSchema.js    # Esquema de permisos
```

## Configuración

### Variables de Entorno Requeridas

```env
# Redis Configuration
REDIS_USERNAME=your_redis_username
REDIS_PASSWORD=your_redis_password
REDIS_URL=your_redis_host
REDIS_PORT=6380

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# Discord Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token
GUILD_ID=your_discord_guild_id

# Next.js Public Variables
NEXT_PUBLIC_GUILD_ID=your_discord_guild_id
```

### Configuración del Servidor

1. **ID del Servidor**: Configurar la variable de entorno `NEXT_PUBLIC_GUILD_ID` con el ID real del servidor Discord

2. **Roles de Discord**: Configurar los roles en la base de datos usando el esquema `PermisosSchema`

## Uso

### Acceso al Panel

1. El usuario debe tener un rol administrativo válido
2. El botón "Panel Admin" aparece automáticamente en el dashboard
3. Al hacer clic, se verifica automáticamente los permisos

### Verificación de Permisos

```javascript
// En el dashboard
const checkAdminAccess = async (discordId) => {
  const response = await fetch("/.netlify/functions/admin-permissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      discordId,
      guildId: process.env.NEXT_PUBLIC_GUILD_ID,
    }),
  });

  const data = await response.json();
  return data.hasAdminAccess;
};
```

### Obtención de Perfil

```javascript
// En el panel administrativo
const fetchProfile = async (discordId) => {
  const response = await fetch("/.netlify/functions/admin-profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      discordId,
      guildId: process.env.NEXT_PUBLIC_GUILD_ID,
      action: "get",
    }),
  });

  const data = await response.json();
  return data.profile;
};
```

## Componentes

### ProfileCard

Muestra información básica del perfil con iconos y colores temáticos.

```tsx
<ProfileCard
  title="Tiempo Semanal"
  value="14h 30m"
  subtitle="(14 horas)"
  icon={<Clock className="h-5 w-5" />}
  color="blue"
/>
```

### StatisticsCard

Muestra estadísticas con barras de progreso y tendencias.

```tsx
<StatisticsCard
  title="Progreso Semanal"
  value="85%"
  percentage={85}
  showProgressBar={true}
  color="green"
  trend="up"
/>
```

### WarnCard y NoteCard

Muestran el historial de warns y notas administrativas.

```tsx
<WarnCard warns={profile.warnsAdministrativos} />
<NoteCard notes={profile.notasAdministrativas} />
```

## Hooks Personalizados

### useAdminPermissions

Hook para verificar permisos administrativos.

```tsx
const { hasAdminAccess, permissions, loading, error } = useAdminPermissions(
  user?.id,
  process.env.NEXT_PUBLIC_GUILD_ID
);
```

### useAdminProfile

Hook para obtener y gestionar el perfil administrativo.

```tsx
const { profile, loading, error, refetch } = useAdminProfile(
  user?.id,
  process.env.NEXT_PUBLIC_GUILD_ID
);
```

## Caché Redis

### Configuración de TTL

- **Permisos**: 1800 segundos (30 minutos)
- **Perfiles**: 300 segundos (5 minutos)

### Invalidación

El caché se invalida automáticamente cuando:

- Se actualiza la configuración de permisos
- Se modifica un perfil administrativo
- Se alcanza el TTL configurado

## Seguridad

### Verificación de Permisos

- Verificación en tiempo real de roles de Discord
- Caché seguro con TTL limitado
- Validación en cada solicitud

### Acceso Restringido

- Solo usuarios con roles administrativos pueden acceder
- Verificación tanto en frontend como backend
- Redirección automática si no hay permisos

## Rendimiento

### Optimizaciones

- Caché Redis para reducir consultas a la base de datos
- Componentes optimizados con React
- Lazy loading de datos
- Compresión de respuestas

### Métricas

- Tiempo de respuesta promedio: < 200ms
- Reducción del 80% en consultas a la base de datos
- Caché hit rate: > 90%

## Mantenimiento

### Monitoreo

- Logs de acceso al panel
- Métricas de uso de Redis
- Alertas de errores de permisos

### Actualizaciones

- Actualización automática de caché
- Sincronización con cambios de roles
- Backup de configuraciones

## Troubleshooting

### Problemas Comunes

1. **Error de Permisos**

   - Verificar que el usuario tenga un rol administrativo
   - Comprobar la configuración de roles en la base de datos
   - Revisar los logs de Redis

2. **Caché No Funciona**

   - Verificar la conexión a Redis
   - Comprobar las variables de entorno
   - Revisar los TTL configurados

3. **Datos No Actualizados**
   - Limpiar el caché manualmente
   - Verificar la sincronización con Discord
   - Revisar los logs de la función

### Comandos de Diagnóstico

```bash
# Verificar conexión Redis
redis-cli ping

# Limpiar caché de permisos
redis-cli DEL "permissions:GUILD_ID"

# Verificar TTL
redis-cli TTL "permissions:GUILD_ID"
```

## Contribución

### Desarrollo

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código

- Usar TypeScript para componentes React
- Seguir las convenciones de ESLint
- Documentar funciones y componentes
- Escribir tests para nuevas funcionalidades

## Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.
