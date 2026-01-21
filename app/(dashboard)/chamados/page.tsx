'use client';

export default function ChamadosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-pro-text">Chamados Disponíveis</h1>
      <p className="text-pro-text-secondary">Aqui você verá os chamados disponíveis na sua região</p>

      {/* Placeholder for chamados list */}
      <div className="bg-pro-secondary border border-pro-border rounded-lg p-8 text-center">
        <p className="text-pro-text-secondary">Carregando chamados...</p>
      </div>
    </div>
  );
}
