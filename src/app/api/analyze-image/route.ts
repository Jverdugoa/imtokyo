import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, config } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No se proporcionó imagen" }, { status: 400 });
    }

    const geminiKey = config?.geminiKey || process.env.GEMINI_API_KEY;
    const openaiKey = config?.openaiKey || process.env.OPENAI_API_KEY;
    const groqKey = config?.groqKey || process.env.GROQ_API_KEY;

    const base64Data = image.includes("base64,") ? image.split("base64,")[1] : image;
    const mimeType = image.includes("data:") ? image.split(";")[0].replace("data:", "") : "image/jpeg";

    const systemInstructions = `Eres un estilista profesional de moda y experto en análisis textil para IMFTOK.
Analiza con gran precisión la prenda o calzado en la imagen y responde ÚNICAMENTE con un JSON estrictamente estructurado sin código markdown alrededor.

Estructura obligatoria del JSON:
{
  "name": "Nombre corto, atractivo y específico en español (ej: 'Blazer cruzado beige estructurado', 'Camisa Oxford celeste', 'Jeans rectos azul índigo')",
  "category": "top" | "bottom" | "footwear" | "outerwear" | "accessory" | "one_piece",
  "subcategory": "ej: Blazer, Camisa, Camiseta, Polo, Suéter, Jeans, Pantalón sastre, Falda, Shorts, Sneakers, Mocasines, Botas, Bolso, Cinturón, Bufanda, etc.",
  "primaryColors": ["Color principal en español", "Color secundario si aplica"],
  "colorHexes": ["#HEX1", "#HEX2"],
  "pattern": "Liso / Sólido" | "Rayas" | "Cuadros" | "Floral" | "Gráfico" | "Estampado",
  "silhouette": "Ajustado / Slim" | "Corte Recto" | "Holgado / Oversized" | "Cropped" | "Tiro Alto" | "Fluido / Suelto",
  "seasons": ["primavera" | "verano" | "otono" | "invierno" | "todas"],
  "formalityLevel": 1 a 5 (1=Deportivo/Gym, 2=Casual diario, 3=Smart Casual / Oficina, 4=Semiformal / Cóctel, 5=Gala / Formal),
  "material": "Algodón, Lino, Lana, Denim, Piel, Cuero, Seda, Sintético, etc.",
  "aiTags": ["3 a 5 palabras clave de estilo como 'Estructurado', 'Básico Esencial', 'Old Money', 'Streetwear', 'Versátil'"]
}`;

    // 1. Google Gemini 2.0 / 1.5 Flash (Super fast & accurate Vision)
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: systemInstructions },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                response_mime_type: "application/json",
                temperature: 0.15,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const clean = rawText.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(clean);
            return NextResponse.json(sanitizeGarmentData(parsed));
          }
        }
      } catch (geminiError) {
        console.error("Gemini Vision error:", geminiError);
      }
    }

    // 2. OpenAI GPT-4o-mini Vision
    if (openaiKey) {
      try {
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemInstructions },
              {
                role: "user",
                content: [
                  { type: "text", text: "Clasifica y extrae los atributos de estilismo de esta prenda." },
                  { type: "image_url", image_url: { url: image.startsWith("data:") ? image : `data:${mimeType};base64,${base64Data}` } },
                ],
              },
            ],
            temperature: 0.2,
          }),
        });

        if (openaiRes.ok) {
          const openAiData = await openaiRes.json();
          const content = openAiData.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return NextResponse.json(sanitizeGarmentData(parsed));
          }
        }
      } catch (openAiError) {
        console.error("OpenAI Vision error:", openAiError);
      }
    }

    // 3. Groq Llama 3.2 Vision
    if (groqKey) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.2-11b-vision-preview",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: systemInstructions },
                  { type: "image_url", image_url: { url: image.startsWith("data:") ? image : `data:${mimeType};base64,${base64Data}` } }
                ]
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const content = groqData.choices?.[0]?.message?.content;
          if (content) {
            return NextResponse.json(sanitizeGarmentData(JSON.parse(content)));
          }
        }
      } catch (groqErr) {
        console.error("Groq vision error:", groqErr);
      }
    }

    // Default Fallback
    return NextResponse.json({
      name: "Prenda de Vestir Analizada",
      category: "top",
      subcategory: "Prenda básica",
      primaryColors: ["Neutro", "Blanco"],
      colorHexes: ["#DDD4C0", "#FFFFFF"],
      pattern: "Liso / Sólido",
      silhouette: "Corte Recto",
      seasons: ["todas"],
      formalityLevel: 3,
      aiTags: ["Esencial", "IMFTOK Wardrobe", "Versátil"],
    });
  } catch (error) {
    console.error("Analyze image API general error:", error);
    return NextResponse.json({ error: "Error en el análisis de imagen" }, { status: 500 });
  }
}

function sanitizeGarmentData(data: any) {
  const validCategories = ["top", "bottom", "footwear", "outerwear", "accessory", "one_piece"];
  let cat = String(data.category || "").toLowerCase();
  if (!validCategories.includes(cat)) {
    if (cat.includes("shirt") || cat.includes("camisa") || cat.includes("top") || cat.includes("t-shirt") || cat.includes("sueter")) cat = "top";
    else if (cat.includes("pant") || cat.includes("jean") || cat.includes("trouser") || cat.includes("short") || cat.includes("skirt")) cat = "bottom";
    else if (cat.includes("shoe") || cat.includes("sneaker") || cat.includes("boot") || cat.includes("zapato") || cat.includes("mocas")) cat = "footwear";
    else if (cat.includes("coat") || cat.includes("jacket") || cat.includes("blazer") || cat.includes("abrigo") || cat.includes("chaqueta")) cat = "outerwear";
    else if (cat.includes("bag") || cat.includes("bolso") || cat.includes("belt") || cat.includes("cinturon") || cat.includes("reloj")) cat = "accessory";
    else if (cat.includes("dress") || cat.includes("vestido")) cat = "one_piece";
    else cat = "top";
  }

  return {
    name: data.name || "Prenda Registrada",
    category: cat,
    subcategory: data.subcategory || "Prenda de vestir",
    primaryColors: Array.isArray(data.primaryColors) && data.primaryColors.length > 0 ? data.primaryColors : ["Neutro"],
    colorHexes: Array.isArray(data.colorHexes) && data.colorHexes.length > 0 ? data.colorHexes : ["#DDD4C0"],
    pattern: data.pattern || "Liso / Sólido",
    silhouette: data.silhouette || "Corte Recto",
    seasons: Array.isArray(data.seasons) && data.seasons.length > 0 ? data.seasons : ["todas"],
    formalityLevel: typeof data.formalityLevel === "number" ? Math.min(5, Math.max(1, data.formalityLevel)) : 3,
    material: data.material || "Textil de calidad",
    aiTags: Array.isArray(data.aiTags) ? data.aiTags : ["Escaneado IMFTOK", "Estilo Tokio"],
  };
}
