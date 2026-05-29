import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Local JSON File-backed database for Community Prayers
const PRAYERS_FILE = path.join(process.cwd(), "prayers.json");

interface CommunityPrayer {
  id: string;
  name: string;
  request: string;
  prayersCount: number;
  createdAt: string;
  category: string;
}

function loadCommunityPrayers(): CommunityPrayer[] {
  try {
    if (fs.existsSync(PRAYERS_FILE)) {
      const data = fs.readFileSync(PRAYERS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading prayers file, using defaults:", error);
  }

  // Seed default community prayers
  const seeds: CommunityPrayer[] = [
    {
      id: "seed-1",
      name: "Maria de Fátima",
      request: "Peço encarecidamente oração pela saúde física da minha mãezinha que está hospitalizada lutando contra uma pneumonia forte. Que nosso Senhor coloque Suas mãos de cura sobre ela.",
      prayersCount: 42,
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      category: "cura_interior"
    },
    {
      id: "seed-2",
      name: "Anônimo",
      request: "Senhor, peço proteção espiritual e mental. Tenho sofrido de terrível ansiedade ao anoitecer, e as noites têm sido longas e silenciosas na alma. Clamo por sossego e refrigério divino para o meu sono.",
      prayersCount: 29,
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      category: "protecao"
    },
    {
      id: "seed-3",
      name: "Douglas Aurelio",
      request: "Estou aguardando com muita esperança o resultado de uma entrevista de emprego que representará o sustento do meu lar. Peço que a Divina Providência abençoe e abra essa nova porta.",
      prayersCount: 15,
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      category: "prosperidade"
    }
  ];

  saveCommunityPrayers(seeds);
  return seeds;
}

function saveCommunityPrayers(prayers: CommunityPrayer[]) {
  try {
    fs.writeFileSync(PRAYERS_FILE, JSON.stringify(prayers, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving prayers file:", error);
  }
}

// Lazy initialization of GoogleGenAI to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Custom prayers will fall back to local templates.");
      throw new Error("GEMINI_API_KEY is required to generate custom prayers.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints FIRST
  app.post("/api/generate-prayer", async (req, res) => {
    try {
      const { feeling, situation, userEmail, nameToPrayFor, prayerType } = req.body;

      // Check if API key is present
      if (!process.env.GEMINI_API_KEY) {
        // Fallback responses if no API key is configured yet, ensuring app doesn't crash but advises user
        return res.json({
          isFallback: true,
          title: "Oração de Acolhimento e Paz Interior",
          greeting: `Querido amigo(a) ${userEmail ? userEmail.split("@")[0] : ""}, que a paz esteja com você.`,
          prayerParagraphs: [
            "Senhor Jesus, venho a Ti neste momento colocar as minhas ansiedades, dores e esperanças em Tuas mãos de amor. Tu conheces cada batida do meu coração, conheces as portas que se fecharam e o silêncio que por vezes tenta abafar a minha fé.",
            `Derrama a Tua unção de cura e proteção sobre mim ${nameToPrayFor ? `e sobre ${nameToPrayFor}` : ""}. Afasta todo medo do amanhã, toda noite sem dormir e me concede a Tua paz que excede todo o entendimento humano.`,
            "Acredito que não cheguei até aqui por acaso. Renovo a minha confiança de que os Teus planos para minha vida são de paz, de esperança e de restauração completa das minhas forças espirituais. Amém."
          ],
          bibleVerse: "Filipenses 4:6-7",
          bibleText: "Não andeis ansiosos de coisa alguma; em tudo, porém, sejam conhecidas diante de Deus as vossas petições, pela oração e pela súplica, com ações de graças. E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e as vossas mentes em Cristo Jesus.",
          spiritualExercise: "Respire fundo por 3 minutos acompanhando o áudio guiado, faça a oração acima em voz alta e entregue seus fardos ao Senhor."
        });
      }

      const client = getAiClient();
      
      const prompt = `Você é um conselheiro espiritual cristão caloroso, prestativo e de profunda sabedoria teológica tradicional, inspirado na tradição cristã acolhedora (católica e protestante ecumênica).
Escreva uma oração cristã customizada profunda, consoladora e cheia de fé para um usuário com os seguintes detalhes:
- Sentimento atual/Burden: "${feeling || "Ansiedade / Procura de Paz"}"
- Situação/Contexto descrito: "${situation || "Geral, buscando um direcionamento"}"
- Tipo de oração focada: "${prayerType || "Cura interior e proteção"}"
${nameToPrayFor ? `- Orar por outra pessoa também: "${nameToPrayFor}"` : ""}

Diretrizes importantes:
1. Escreva em PORTUGUÊS brasileiro, usando um tom extremamente acolhedor, solene, empático e comovente.
2. Não use chavões secos. Faça com que o usuário se sinta profundamente amparado ("sinta-se abraçado e saiba que você não está sozinho").
3. A oração deve ser bonita, com 3 parágrafos bem elaborados.
4. Selecione uma passagem da Bíblia (versículo exato e texto correspondente) que faça perfeito sentido bíblico com a situação de aflição descrita.
5. Indique um pequeno exercício ou orientação espiritual diária prática para reconfortar o coração angustiado.

Gere uma resposta JSON estruturada estrita no seguinte formato:
{
  "title": "Título comovente e inspirador para a oração",
  "greeting": "Uma introdução calorosa e consoladora personalizada, em tom de abraço fraterno",
  "prayerParagraphs": ["Parágrafo 1 da oração", "Parágrafo 2 da oração", "Parágrafo 3 da oração"],
  "bibleVerse": "Livro Capítulo:Versículos (Ex: Salmo 91:1-2)",
  "bibleText": "O texto bíblico completo do versículo selecionado na versão Almeida Revista e Atualizada ou similar",
  "spiritualExercise": "Uma sugestão de exercício espiritual ou reflexão prática para fazer hoje"
}`;

      const apiResponse = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Título inspirador para a oração" },
              greeting: { type: Type.STRING, description: "Uma breve mensagem de acolhimento e empatia direcionada à dor do usuário antes da oração" },
              prayerParagraphs: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Três parágrafos contendo a oração escrita de forma profunda, poética e sagrada"
              },
              bibleVerse: { type: Type.STRING, description: "Referência bíblica reconfortante" },
              bibleText: { type: Type.STRING, description: "Texto bíblico literal da referência" },
              spiritualExercise: { type: Type.STRING, description: "Um exercício espiritual guiado simples ou conselho de ação prática de fé" }
            },
            required: ["title", "greeting", "prayerParagraphs", "bibleVerse", "bibleText", "spiritualExercise"]
          }
        }
      });

      const responseText = apiResponse.text;
      if (!responseText) {
        throw new Error("Empty response from AI model");
      }

      const parsedResponse = JSON.parse(responseText.trim());
      res.json(parsedResponse);
    } catch (error: any) {
      console.error("Error generating custom prayer:", error);
      res.status(500).json({
        error: "Ocorreu um erro ao gerar a sua oração sob medida. Por favor, tente novamente.",
        details: error.message
      });
    }
  });

  // Fetch all community prayers
  app.get("/api/community-prayers", (req, res) => {
    try {
      const prayers = loadCommunityPrayers();
      // Sort with newest first
      const sortedPrayers = [...prayers].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      res.json(sortedPrayers);
    } catch (error: any) {
      console.error("Error reading community prayers:", error);
      res.status(500).json({ error: "Erro ao carregar a comunidade de oração." });
    }
  });

  // Create a new community prayer request
  app.post("/api/community-prayers", (req, res) => {
    try {
      const { name, request, category } = req.body;
      if (!request || typeof request !== "string" || request.trim().length === 0) {
        return res.status(400).json({ error: "O pedido de oração não pode ser vazio." });
      }

      if (request.trim().length > 1000) {
        return res.status(400).json({ error: "O pedido de oração é longo demais (máximo 1000 caracteres)." });
      }

      const prayers = loadCommunityPrayers();
      const newPrayer: CommunityPrayer = {
        id: "prayer-" + Math.random().toString(36).substr(2, 9),
        name: name && name.trim().length > 0 ? name.trim().slice(0, 50) : "Anônimo",
        request: request.trim(),
        prayersCount: 0,
        createdAt: new Date().toISOString(),
        category: category || "outros"
      };

      prayers.push(newPrayer);
      saveCommunityPrayers(prayers);

      res.status(201).json(newPrayer);
    } catch (error: any) {
      console.error("Error creating community prayer:", error);
      res.status(500).json({ error: "Erro ao enviar o seu pedido de oração." });
    }
  });

  // Pray for a specific prayer request (increase prayersCount)
  app.post("/api/community-prayers/:id/pray", (req, res) => {
    try {
      const { id } = req.params;
      const prayers = loadCommunityPrayers();
      const prayerIndex = prayers.findIndex((p) => p.id === id);

      if (prayerIndex === -1) {
        return res.status(404).json({ error: "Pedido de oração não encontrado." });
      }

      prayers[prayerIndex].prayersCount += 1;
      saveCommunityPrayers(prayers);

      res.json(prayers[prayerIndex]);
    } catch (error: any) {
      console.error("Error incrementing prayer count:", error);
      res.status(500).json({ error: "Erro ao registrar a sua oração." });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Biblioteca Sagrada Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
