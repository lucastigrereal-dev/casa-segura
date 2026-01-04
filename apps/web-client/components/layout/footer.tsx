import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Casa Segura</h3>
            <p className="text-sm">
              Marketplace de servicos residenciais de confianca para a Serra Gaucha.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Servicos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/novo-chamado?categoria=eletrica" className="hover:text-white">
                  Eletrica
                </Link>
              </li>
              <li>
                <Link href="/novo-chamado?categoria=hidraulica" className="hover:text-white">
                  Hidraulica
                </Link>
              </li>
              <li>
                <Link href="/novo-chamado?categoria=pintura" className="hover:text-white">
                  Pintura
                </Link>
              </li>
              <li>
                <Link href="/novo-chamado?categoria=montagem" className="hover:text-white">
                  Montagem
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sobre" className="hover:text-white">
                  Sobre nos
                </Link>
              </li>
              <li>
                <Link href="/profissionais" className="hover:text-white">
                  Seja um profissional
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-white">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/termos" className="hover:text-white">
                  Termos de uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-white">
                  Politica de privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Casa Segura. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
