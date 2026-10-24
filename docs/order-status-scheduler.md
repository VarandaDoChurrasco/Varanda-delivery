# Agendamento automático de pedidos

O backend agenda tarefas em memória para DELIVERY com confirmadoEm preenchido:
PRONTO → SAIU_PARA_ENTREGA em confirmadoEm + 20 minutos;
SAIU_PARA_ENTREGA → ENTREGUE em confirmadoEm + 60 minutos.
A saída manual antecipada não altera o prazo da entrega.

A confirmação e os serviços manuais sincronizam os temporizadores somente após
persistir. Cancelamento e conclusão removem tarefas. Atualizações automáticas
usam ID, tipo, status, confirmadoEm e updatedAt como condições atômicas;
serviços manuais também verificam status e updatedAt para evitar gravações sobre
uma versão concorrente. Uma disputa pode retornar erro ao solicitante, que deve
recarregar o pedido antes de tentar novamente.

Na inicialização há uma busca das pendências e reconstrução dos prazos. Pedidos
vencidos podem passar pelas duas transições em sequência. Não há varredura por
minuto nem consultas agendadas com a fila vazia após recuperação bem-sucedida.
Falhas de recuperação e de tarefa têm retentativas em 5, 10, 20, 40, 80, 160 e
300 segundos, permanecendo em 300 segundos até sucesso. Uma resposta perdida
após commit é resolvida relendo o status antes de tentar a próxima transição.
Os logs de falha não imprimem objetos de erro nem dados de conexão.

## Requisitos de execução e limites

O package.json inicia um processo Node persistente com `node dist/server.js`.
O servidor HTTP e os temporizadores referenciados mantêm seu event loop ativo.
Isso não impede a plataforma de suspender, reiniciar ou encerrar o contêiner.

Não há configuração Railway/Nixpacks/Docker no repositório que fixe réplicas
ou política de suspensão. Não foi possível verificar o estado do painel:
não há conector Railway disponível nem CLI Railway instalada. Antes do deploy,
confirmar uma única réplica e desativar suspensão/serverless do serviço no painel.
Nenhuma configuração remota foi alterada e nenhum deploy foi realizado.

O desenho pressupõe que as gravações passem por esta instância. Réplicas extras
ou gravações externas não notificam a fila local: as condições de atualização
protegem os registros, mas não garantem descobrir novas pendências. Nesse caso,
usar uma fila durável compartilhada/coordenador. A recuperação no boot cobre
reinício e queda entre commit e agendamento; não descobre gravações externas
realizadas durante a execução. Enquanto o backend estiver parado/suspenso,
as transições aguardam sua volta. Também podem atrasar se o event loop bloquear
ou o banco ficar indisponível.

## Validação local sem banco

`npm test` compila e executa os testes com relógio e repositório simulados.
Os testes de integração dos serviços interceptam os métodos Prisma e usam URL
fictícia; não fazem conexão com o banco. Cobrem limites de prazo, inatividade,
recuperação, alterações manuais, concorrência, falhas antes/depois de commit e
retentativa progressiva. Para gerar Prisma sem carregar arquivos .env:
`DOTENV_CONFIG_PATH=/dev/null npm run build`.
