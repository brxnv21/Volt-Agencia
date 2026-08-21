import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Política de Privacidade — VOLT Agência',
  description: 'Como coletamos, usamos e protegemos seus dados.',
}

export default function Privacidade() {
  return (
    <main className="bg-volt-darker min-h-screen text-gray-300">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-6">Política de Privacidade</h1>
        <p className="text-sm mb-4">A VOLT Agência respeita a sua privacidade. Esta política explica quais dados coletamos e como os usamos quando você compra nossos serviços de crescimento para Instagram.</p>

        <h2 className="text-white font-semibold mt-8 mb-2">1. Dados que coletamos</h2>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Nome, e-mail e WhatsApp informados no pedido</li>
          <li>@ (usuário) do Instagram que receberá o serviço</li>
          <li>Dados de pagamento processados pelo Mercado Pago (não armazenamos dados de cartão)</li>
        </ul>

        <h2 className="text-white font-semibold mt-8 mb-2">2. Como usamos</h2>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Executar e dar suporte ao pedido (entrega dos seguidores/serviços contratados)</li>
          <li>Enviar confirmações por e-mail e WhatsApp</li>
          <li>Melhorar o site com métricas anônimas (Pixel do Facebook/Meta e Google)</li>
        </ul>

        <h2 className="text-white font-semibold mt-8 mb-2">3. Compartilhamento</h2>
        <p className="text-sm">Compartilhamos apenas o necessário para a entrega: provedor de execução do serviço (Turbosociais) e processador de pagamentos (Mercado Pago). Nunca vendemos seus dados.</p>

        <h2 className="text-white font-semibold mt-8 mb-2">4. Cookies e publicidade</h2>
        <p className="text-sm">Usamos cookies do Pixel do Meta para medir conversões de anúncios. Você pode desativar cookies nas configurações do seu navegador.</p>

        <h2 id="exclusao" className="text-white font-semibold mt-8 mb-2">5. Exclusão de dados</h2>
        <p className="text-sm">Para solicitar a exclusão dos seus dados, envie mensagem ao nosso WhatsApp <a href="https://wa.me/5527996115482" className="text-volt-accent underline">(27) 99611-5482</a> pedindo &quot;exclusão de dados&quot;, informando o e-mail da compra. Removemos tudo em até 72 horas.</p>

        <h2 className="text-white font-semibold mt-8 mb-2">6. Contato</h2>
        <p className="text-sm">Dúvidas sobre esta política: WhatsApp (27) 99611-5482 ou e-mail bnsiq2015@gmail.com.</p>

        <p className="text-xs text-gray-500 mt-10">Última atualização: 21/08/2026</p>
      </div>
      <Footer track={false} />
    </main>
  )
}
