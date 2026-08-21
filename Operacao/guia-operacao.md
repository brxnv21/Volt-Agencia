# Guia de Operacao VOLT Agencia

## Fluxo de Venda Automatico

1. Cliente acessa https://volt-agencia.vercel.app
2. Escolhe servico e quantidade
3. Preenche link do Instagram + contato (WhatsApp/email)
4. Pode adicionar upsells (curtidas extras, visualizacoes, etc.)
5. Paga via PIX ou Cartao de Credito (Mercado Pago)
6. Pagamento aprovado -> Webhook dispara automaticamente:
   a. Cria pedido(s) na Turbosociais via API
   b. Envia email de confirmacao para voce com dados do cliente
   c. Se erro, envia email de alerta com link para envio manual
7. Turbo entrega automaticamente (varia de minutos a horas)
8. Cliente recebe entrega e fica satisfeito

## O que monitorar diariamente

- **Saldo Turbosociais**: Manter acima de R$7 (alerta automatico no admin)
- **Pedidos no admin**: Verificar aba Vendas a cada poucas horas
- **Emails**: Checar se houve erros de entrega
- **Facebook Ads**: Verificar desempenho dos anuncios

## Margens por tipo de servico

- Melhores margens: Visualizacoes Reels (97,9%), Compartilhamentos (90,7%), Alcance (80,8)
- Medias: Curtidas Mundiais (72,4%), Seguidores Mundiais (67,8%), Story (68,3%)
- Menores: Comentarios BR (39,8%), Comentarios Mundiais (47,1%)

## Dicas para escalar

1. Focar nos servicos de maior margem nos anuncios
2. Reels tem melhor custo beneficio - priorizar
3. Manter estoque de saldo no Turbosociais (recarregar antes de acabar)
4. Responder rapidamente no WhatsApp (gera confianca)
5. Pedir depoimentos para usar nos anuncios
6. Criar conteudo organico complementar
7. Testar novos formatos de anuncio periodicamente
