import qrcode from "qrcode-terminal";
import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import { initDb, openDb } from "./db";

const client = new Client({
  authStrategy: new LocalAuth(),
});

const chatsAtivos = new Map();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("Client is ready!");
  await initDb();
  console.log("Banco de dados carregado!");
});

client.on("message", async (message) => {
  const content = message.body;
  const remetente = message.from;

  if (content === "!start") {
    if (chatsAtivos.has(remetente)) {
      client.sendMessage(remetente, "As mensagens já estão ativadas!");
      return;
    }

    client.sendMessage(
      remetente,
      "▶️ Envios iniciados! 1 minuto para testes (sem repetições).",
    );
    const tempoEmMilissegundos = 15000;

    let filaDeIds: number[] = [];

    const timer = setInterval(async () => {
      const agora = new Date();
      const hora = agora.getHours();
      const minuto = agora.getMinutes();

      const tempoAtual = hora * 60 + minuto;
      const horarioInicio = 2 * 60; // 08:00 da manhã
      const horarioFim = 22 * 60 + 30; // 22:30 da noite

      if (tempoAtual < horarioInicio || tempoAtual > horarioFim) {
        return;
      }

      const db = await openDb();

      if (filaDeIds.length === 0) {
        const todosOsIds = await db.all(
          "SELECT id FROM mensagens ORDER BY RANDOM()",
        );
        filaDeIds = todosOsIds.map((linha) => linha.id);
      }

      const idSorteado = filaDeIds.shift();

      if (idSorteado) {
        const mensagemSorteada = await db.get(
          "SELECT conteudo, imagem FROM mensagens WHERE id = ?",
          [idSorteado],
        );

        if (mensagemSorteada) {
          if (mensagemSorteada.imagem) {
            try {
              const media = await MessageMedia.fromUrl(mensagemSorteada.imagem);
              client.sendMessage(remetente, media, {
                caption: mensagemSorteada.conteudo,
              });
            } catch (erro) {
              console.log(
                `Erro ao baixar a imagem do ID ${idSorteado}. Enviando só texto.`,
              );
              client.sendMessage(remetente, mensagemSorteada.conteudo);
            }
          } else {
            client.sendMessage(remetente, mensagemSorteada.conteudo);
          }
        }
      }
    }, tempoEmMilissegundos);

    chatsAtivos.set(remetente, timer);
  }

  if (content === "!stop") {
    if (chatsAtivos.has(remetente)) {
      clearInterval(chatsAtivos.get(remetente));
      chatsAtivos.delete(remetente);

      client.sendMessage(remetente, "⏸️ Envios automáticos parados.");
    } else {
      client.sendMessage(
        remetente,
        "Não há envios ativos para parar. Digite !start para iniciar.",
      );
    }
  }
});

client.initialize();
