import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Droplets, Paintbrush, Wrench, Snowflake, ArrowRight } from 'lucide-react';

const categories = [
  { name: 'Elétrica', slug: 'eletrica', icon: Zap, color: 'bg-amber-500' },
  { name: 'Hidráulica', slug: 'hidraulica', icon: Droplets, color: 'bg-blue-500' },
  { name: 'Pintura', slug: 'pintura', icon: Paintbrush, color: 'bg-pink-500' },
  { name: 'Montagem', slug: 'montagem', icon: Wrench, color: 'bg-purple-500' },
  { name: 'Clima Frio', slug: 'clima-frio', icon: Snowflake, color: 'bg-cyan-500' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Serviços residenciais de confiança na Serra Gaúcha
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Encontre profissionais qualificados para resolver qualquer problema
              na sua casa. Rapido, seguro e com garantia.
            </p>
            <Link href="/novo-chamado">
              <Button size="lg" variant="secondary">
                Solicitar Servico
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Nossos Servicos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.slug} href={`/novo-chamado?categoria=${category.slug}`}>
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                    <div
                      className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Como Funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Descreva o problema</h3>
              <p className="text-gray-600">
                Escolha o servico e descreva o que precisa ser feito
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Receba o orcamento</h3>
              <p className="text-gray-600">
                Um profissional qualificado ira avaliar e enviar o orcamento
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Servico executado</h3>
              <p className="text-gray-600">
                Aprove, pague e tenha seu problema resolvido com garantia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para resolver seu problema?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Solicite um servico agora e receba um orcamento em minutos
          </p>
          <Link href="/novo-chamado">
            <Button size="lg" variant="secondary">
              Solicitar Servico
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
