import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertCircle, Info } from "lucide-react";

export default function TerminosPage() {
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
              Términos y Condiciones
            </h1>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Left Column */}
            <div className="space-y-12">
              {/* 1. Política de Reembolsos */}
              <section className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  1. Política de Reembolsos
                </h2>

                <p className="text-white/90 mb-6 leading-relaxed">
                  Todas las compras realizadas en MXRP están sujetas a nuestra
                  política de reembolso de 48 horas posteriores a la compra, que
                  aplica para:
                </p>

                <ul className="text-white/90 mb-6 space-y-2">
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    Beneficios y rangos especiales
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    Artículos y cosméticos in-game
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    Servicios de desarrollo de bots
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    Paquetes VIP y membresías
                  </li>
                </ul>

                {/* Payment Methods Box */}
                <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-3">
                    <Info className="h-5 w-5 text-blue-400 mr-2" />
                    <h3 className="text-white font-semibold">
                      Métodos de pago aceptados para reembolso:
                    </h3>
                  </div>
                  <ul className="text-white/80 space-y-1">
                    <li>• PayPal (48 horas)</li>
                    <li>• Transferencia SPEI (48 horas)</li>
                    <li>• Tarjeta de crédito/débito (48 horas)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">
                    Proceso de Reembolso:
                  </h3>
                  <ul className="text-white/90 space-y-2">
                    <li className="flex items-start">
                      <span className="text-white mr-2">•</span>
                      Abrir ticket en Discord MXRP
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2">•</span>
                      Proporcionar comprobante de pago
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2">•</span>
                      Especificar motivo de reembolso
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2">•</span>
                      El reembolso se procesará en un máximo de 72 horas hábiles
                    </li>
                  </ul>
                </div>
              </section>

              {/* 2. Uso y Protección de Datos */}
              <section className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  2. Uso y Protección de Datos
                </h2>

                <p className="text-white/90 mb-6 leading-relaxed">
                  La protección de tus datos es nuestra prioridad. Implementamos
                  las siguientes medidas:
                </p>

                <ul className="text-white/90 space-y-2">
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    Encriptación de datos sensibles
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    Almacenamiento seguro en servidores protegidos
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    Acceso restringido a personal autorizado
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    Eliminación de datos 30 días después de la inactividad
                  </li>
                </ul>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-12">
              {/* Information Box */}
              <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg p-6">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-amber-400 mr-3 mt-1" />
                  <div>
                    <p className="text-white/90 leading-relaxed">
                      Los datos se eliminarán automáticamente 30 días después de
                      que un usuario abandone el servidor. No incluye los
                      registros de pagos y transacciones comprados en MXRP.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Responsabilidades del Usuario */}
              <section className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-8">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    3. Responsabilidades del Usuario
                  </h2>
                  <div className="ml-4 px-3 py-1 bg-red-600/20 border border-red-600/50 rounded text-red-400 text-sm font-semibold">
                    IMPORTANTE
                  </div>
                </div>

                <p className="text-white/90 mb-6 leading-relaxed">
                  El usuario es responsable de:
                </p>

                <ul className="text-white/90 space-y-2">
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    La seguridad de su cuenta
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    Las transacciones realizadas desde su cuenta
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    El contenido compartido en el servidor
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    Mantener la confidencialidad de sus credenciales
                  </li>
                </ul>
              </section>

              {/* 4. Modificaciones y Actualizaciones */}
              <section className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  4. Modificaciones y Actualizaciones
                </h2>

                <p className="text-white/90 mb-6 leading-relaxed">
                  MXRP se reserva el derecho de modificar estos términos y
                  condiciones en cualquier momento. Los cambios serán
                  notificados a través de:
                </p>

                <ul className="text-white/90 space-y-2">
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    Anuncios en Discord
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    Correo electrónico registrado
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-2">•</span>
                    Notificaciones en la plataforma
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
