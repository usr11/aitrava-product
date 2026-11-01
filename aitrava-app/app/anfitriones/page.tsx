import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { HostForm } from './form';

export const metadata: Metadata = {
  title: 'Soy anfitrión',
  description: 'Guías y anfitriones de Cali: te llevamos grupos nuevos y solo pagas comisión por las reservas que te traemos.',
};

const POINTS = [
  { title: 'Clientes que no habrías conseguido', text: 'Personas que querían salir pero no tenían con quién. Nosotros armamos el grupo y lo llevamos a tu experiencia.' },
  { title: 'Pagas solo cuando hay reserva', text: 'Una comisión del 20 % sobre cada reserva que AiTrava te trae, hasta 3 días después de la salida. Sin mensualidad ni costo de entrada.' },
  { title: 'Cada reserva con nombre y referencia', text: 'Sabes quién va, por qué canal llegó y si ya pagó. El cobro se acuerda contigo antes de publicar la experiencia.' },
  { title: 'Nosotros ponemos el ritual', text: 'Tarjetas rompehielos, el sobre para el celular y una persona del equipo en las primeras salidas.' },
];

export default function AnfitrionesPage() {
  return (
    <>
      <PageHeader title="Te llevamos el grupo" text="Para guías, fincas, talleres y operadores en Cali y sus alrededores que quieren llenar cupos con gente nueva." />
      <div className="wrap grid gap-12 py-10 lg:grid-cols-[1fr_1.1fr] lg:py-14">
        <div>
          <ul className="space-y-7">
            {POINTS.map((p) => (
              <li key={p.title}>
                <h2 className="title text-[1.25rem]">{p.title}</h2>
                <p className="mt-1.5 text-ink-2">{p.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-ink-3">
            En naturaleza solo trabajamos con guías con tarjeta profesional y Registro Nacional de Turismo (RNT), y con póliza de accidentes por día.
          </p>
        </div>
        <div className="panel p-5 sm:p-7">
          <h2 className="title text-[1.5rem]">Cuéntanos de tu experiencia</h2>
          <p className="mt-1 text-ink-2">Te escribimos por WhatsApp para conocerte. Nada queda firmado con este formulario.</p>
          <div className="mt-6">
            <HostForm />
          </div>
        </div>
      </div>
    </>
  );
}
