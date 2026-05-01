import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Abre a conexão com o arquivo do banco (ele cria o arquivo se não existir)
export async function openDb() {
  return open({
    filename: "./banco.db",
    driver: sqlite3.Database,
  });
}

// Cria a tabela e insere uma mensagem de teste se o banco estiver vazio
export async function initDb() {
  const db = await openDb();

  // Cria a tabela "mensagens" com duas colunas: id e conteudo
  await db.exec(`
    CREATE TABLE IF NOT EXISTS mensagens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conteudo TEXT NOT NULL
    )
  `);

  // Verifica se a tabela está vazia. Se estiver, adiciona um produto de teste
  const result = await db.get("SELECT COUNT(*) as total FROM mensagens");
  if (result.total === 0) {
    await db.run("INSERT INTO mensagens (conteudo) VALUES (?)", [
      `erro 🍹🌪️\n\n✅ erro\n\n🚨 erro\n🔥 erro\n\n🔗 erro`,
    ]);
  }
}
