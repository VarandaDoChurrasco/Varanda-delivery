# Controles do WhatsApp

A página `GET /whatsapp/qr` exibe o estado atual e o QR, quando disponível.
“Atualizar QR” e a atualização automática consultam `GET /whatsapp/status`, sem
iniciar conexões nem apagar autenticação.

Não havia autenticação administrativa HTTP no projeto. Os controles usam
`WHATSAPP_ADMIN_TOKEN` no ambiente do servidor e exigem o cabeçalho
`Authorization: Bearer <token>` em `POST /whatsapp/iniciar` e
`POST /whatsapp/resetar`. Sem configuração, retornam 503; token inválido retorna
401. Informe o token no campo da página; ele não é salvo no navegador nem
incluído na URL. Os GETs continuam acessíveis como a página anterior.

Iniciar mantém a conexão existente. Resetar encerra o socket atual, invalida seus
eventos e gravações, aguarda escritas em andamento, remove
`./auth_info_baileys` e cria uma única conexão para obter outro QR. Resets
simultâneos compartilham a mesma operação. Ausência de QR nunca apaga a sessão.
O antigo `RESET_WHATSAPP_AUTH` foi removido.

A exclusividade é por instância do serviço: execute somente um processo usando
essa pasta de autenticação. Os testes usam sockets e armazenamento simulados;
não conectam ao WhatsApp nem removem a sessão real.
