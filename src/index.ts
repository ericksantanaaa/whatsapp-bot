import qrcode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";

const client = new Client({
  authStrategy: new LocalAuth(),
});


const mensagens = [
  `POTÊNCIA E PRATICIDADE PARA SUAS RECEITAS 🍹🌪️

✅ Liquidificador Turbo Power Mondial 550W - L-99 FB

🚨 42% OFF!
🔥 DE ~R$ 172,90~ | POR *R$ 99,90*

🔗 https://meli.la/2YjhKBF`,

  `MAXIMIZE SEU DESEMPENHO E RESULTADOS 💪⚡

✅ Creatina Monohidratada 250g Growth Supplements - Sem sabor em Pó

🚨 38% OFF!
🔥 DE ~R$ 64,90~ | POR *R$ 39,90*

🔗 https://meli.la/26nYHGe`,

  `CONFORTO E QUALIDADE PARA O DIA A DIA 🩲✨

✅ Kit 10 Cuecas Boxer Lupo Algodão Confortável Box Original

🚨 53% OFF!
🔥 DE ~R$ 389,99~ | POR R$ 183,99

🔗 https://meli.la/2iFUzLn`,

  `A FERRAMENTA PERFEITA PARA QUALQUER PROJETO 🛠️⚡

✅ Furadeira E Parafusadeira De Impacto 2 Baterias 2000mah 21v 3/8 Tb-21pkx The Black Tools Com Maleta E Acessorios

🚨 49% OFF!
🔥 DE ~R$ 349,90~ | POR R$ 179,90

🔗 https://meli.la/1E76zEp`,

  `TECNOLOGIA E POTÊNCIA NA PALMA DA MÃO 📱🚀

✅ Celular Samsung Galaxy A17 Com Ia, 256gb, 8gb Ram, Câm De 50mp, Tela De 6.7, Nfc, Ip54 - Cinza

🚨 38% OFF!
🔥 DE ~R$ 1.749,00~ | POR R$ 1.079,10

🔗 https://meli.la/2vxSJxs`,
];

const chatsAtivos = new Map();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (message) => {
  const content = message.body;
  const remetente = message.from; 

  if (content === "!start") {

    if (chatsAtivos.has(remetente)) {
      client.sendMessage(
        remetente,
        "As mensagens automáticas já estão ativadas para você!",
      );
      return; 
    }

    client.sendMessage(
      remetente,
      "▶️ Envios automáticos iniciados! Você receberá uma mensagem a cada 5 minutos.",
    );

    const tempoEmMilissegundos = 60000;

    const timer = setInterval(() => {

      const indiceAleatorio = Math.floor(Math.random() * mensagens.length);
      const mensagemSorteada = mensagens[indiceAleatorio];


      client.sendMessage(remetente, mensagemSorteada);
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
