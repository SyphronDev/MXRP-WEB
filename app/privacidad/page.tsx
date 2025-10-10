import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, Database, AlertCircle } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/Banner.webp')",
        }}
      />

      {/* Dark overlay for better text readability */}
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50" />

      {/* Content */}
      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-4 py-20">
          {/* Main Title */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              Política de Privacidad
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md">
              En MXRP, protegemos tu privacidad y datos personales con las más
              altas medidas de seguridad.
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Left Column */}
            <div className="space-y-12">
              {/* 1. Información que Recopilamos */}
              <section className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-8">
                <div className="flex items-center mb-6">
                  <Database className="h-8 w-8 text-white mr-3" />
                  <h2 className="text-2xl font-bold text-white">
                    1. Información que Recopilamos
                  </h2>
                </div>

                <p className="text-white/90 mb-6 leading-relaxed">
                  Recopilamos únicamente la información necesaria para brindarte
                  nuestros servicios:
                </p>

                <ul className="text-white/90 space-y-3">
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    <div>
                      <strong className="text-white">Información de cuenta:</strong> Nombre de usuario,
                      email, fecha de registro
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    <div>
                      <strong className="text-white">Datos de juego:</strong> Progreso, estadísticas,
                      configuraciones
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    <div>
                      <strong className="text-white">Información de pago:</strong> Método de pago,
                      historial de transacciones
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    <div>
                      <strong className="text-white">Datos técnicos:</strong> IP, navegador,
                      dispositivo (anónimos)
                    </div>
                  </li>
                </ul>
              </section>

              {/* 2. Cómo Protegemos tus Datos */}
              <section className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-8">
                <div className="flex items-center mb-6">
                  <Shield className="h-8 w-8 text-white mr-3" />
                  <h2 className="text-2xl font-bold text-white">
                    2. Cómo Protegemos tus Datos
                  </h2>
                </div>

                <p className="text-white/90 mb-6 leading-relaxed">
                  Implementamos múltiples capas de seguridad para proteger tu
                  información:
                </p>

                <ul className="text-white/90 space-y-3">
                  <li className="flex items-start">
                    <Lock className="h-5 w-5 text-white mr-2 mt-1" />
                    <div>
                      <strong className="text-white">Encriptación SSL/TLS:</strong> Todos los datos se
                      transmiten de forma segura
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Lock className="h-5 w-5 text-white mr-2 mt-1" />
                    <div>
                      <strong className="text-white">Encriptación de base de datos:</strong> Datos
                      sensibles encriptados en reposo
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Lock className="h-5 w-5 text-white mr-2 mt-1" />
                    <div>
                      <strong className="text-white">Acceso restringido:</strong> Solo personal
                      autorizado puede acceder a datos
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Lock className="h-5 w-5 text-white mr-2 mt-1" />
                    <div>
                      <strong className="text-white">Monitoreo continuo:</strong> Sistemas de detección
                      de intrusiones 24/7
                    </div>
                  </li>
                </ul>
              </section>

              {/* 3. Uso de Cookies */}
              <section className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-8">
                <div className="flex items-center mb-6">
                  <Eye className="h-8 w-8 text-white mr-3" />
                  <h2 className="text-2xl font-bold text-white">
                    3. Uso de Cookies
                  </h2>
                </div>

                <p className="text-white/90 mb-6 leading-relaxed">
                  Utilizamos cookies para mejorar tu experiencia:
                </p>

                <div className="space-y-4">
                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">
                      Cookies Esenciales
                    </h3>
                    <p className="text-white/80 text-sm">
                      Necesarias para el funcionamiento básico del sitio
                    </p>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">
                      Cookies de Rendimiento
                    </h3>
                    <p className="text-white/80 text-sm">
                      Nos ayudan a mejorar la velocidad y funcionalidad
                    </p>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">
                      Cookies de Preferencias
                    </h3>
                    <p className="text-white/80 text-sm">
                      Recuerdan tus configuraciones y preferencias
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-12">
              {/* Information Box */}
              <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-6">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-blue-400 mr-3 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-2">
                      Tu Privacidad es Importante
                    </h3>
                    <p className="text-white/90 leading-relaxed">
                      Nunca vendemos, alquilamos o compartimos tu información
                      personal con terceros sin tu consentimiento explícito.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Tus Derechos */}
              <section className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  4. Tus Derechos
                </h2>

                <p className="text-white/90 mb-6 leading-relaxed">
                  Tienes derecho a:
                </p>

                <ul className="text-white/90 space-y-3">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      <strong>Acceso:</strong> Solicitar una copia de tus datos
                      personales
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      <strong>Rectificación:</strong> Corregir datos inexactos o
                      incompletos
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      <strong>Eliminación:</strong> Solicitar la eliminación de
                      tus datos
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      <strong>Portabilidad:</strong> Transferir tus datos a otro
                      servicio
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      <strong>Oposición:</strong> Oponerte al procesamiento de
                      tus datos
                    </div>
                  </li>
                </ul>
              </section>

              {/* 5. Retención de Datos */}
              <section className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  5. Retención de Datos
                </h2>

                <p className="text-white/90 mb-6 leading-relaxed">
                  Conservamos tus datos durante los siguientes períodos:
                </p>

                <div className="space-y-4">
                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">
                      Cuentas Activas
                    </h3>
                    <p className="text-white/80 text-sm">
                      Datos conservados mientras tu cuenta esté activa
                    </p>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">
                      Cuentas Inactivas
                    </h3>
                    <p className="text-white/80 text-sm">
                      Datos eliminados automáticamente después de 30 días
                    </p>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">
                      Registros de Pago
                    </h3>
                    <p className="text-white/80 text-sm">
                      Conservados por 5 años para fines fiscales
                    </p>
                  </div>
                </div>
              </section>

              {/* 6. Contacto */}
              <section className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  6. Contacto
                </h2>

                <p className="text-white/90 mb-6 leading-relaxed">
                  Para ejercer tus derechos o resolver dudas sobre privacidad:
                </p>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-primary mr-2">•</span>
                    <span className="text-white/90">
                      Discord: Abre un ticket en nuestro servidor
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-primary mr-2">•</span>
                    <span className="text-white/90">
                      Email: privacidad@mxrp.com
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-primary mr-2">•</span>
                    <span className="text-white/90">
                      Tiempo de respuesta: Máximo 72 horas
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center mt-16">
            <p className="text-white/60 text-sm">
              Última actualización: 15 de Enero, 2025
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
