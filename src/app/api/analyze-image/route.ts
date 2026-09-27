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
Tu tarea es analizar la foto de la prenda y extraer sus atributos precisos para catalogarla en el guardarropa.

REGLAS CRÍTICAS PARA ANÁLISIS DE FOTOS REALES (CON FLASH / ILUMINACIÓN DURA / SOMBRAS):
1. COLOR REAL DEL TEJIDO:
   - Ignora el brillo o reflejo blanco del flash de la cámara. Si una prenda negra tiene brillo de flash en el centro, el color es NEGRO, NO blanco ni gris.
   - Si una prenda azul o verde tiene flash, identifica el color base del tejido (ej: "Azul Marino", "Verde Militar"), no el brillo especular.
   - Extrae el nombre del color en español (ej: "Negro", "Blanco", "Beige / Crema", "Azul Marino", "Azul Índigo / Mezclilla", "Gris Carbón", "Camel / Tostado", "Verde Oliva", "Verde Salvia", "Terracota", "Café / Chocolate", "Vino / Burdeos", "Rojo", "Rosa Palo / Nude", "Celeste").
   - Asigna códigos HEX precisos (#HEX) correspondientes a esos colores reales.

2. FOTOS DE ETIQUETAS Y MARCAS (OCR / TAGS):
   - Si la foto incluye o es directamente la ETIQUETA de la prenda (ej: etiquetado de marca como Levi's, Zara, Nike, etc.):
     * Lee mediante visión OCR el nombre de la marca y el modelo visible (ej: "Levi's 501", "Levi's 511 Slim Fit", "Nike Sportswear", "Zara Man").
     * Incluye la marca y el tipo de prenda en el nombre generado (ej: "Jeans Levi's 501 Denim Azul", "Chaqueta Levi's Trucker Denim").
     * Extrae el material si la etiqueta lo especifica (ej: "100% Algodón / Denim").

3. NOMBRE Y TIPO ESPECÍFICO:
   - Genera un nombre corto, estilizado y claro en español (ej: "Jeans Levi's 501 Azul Mezclilla", "Playera oversize negra lisa", "Blazer estructurado beige", "Camisa lino blanco marfil", "Sudadera con capucha gris", "Sneakers de piel blancos").
   - Categoría exacta: "top" (superiores), "bottom" (inferiores), "footwear" (calzado), "outerwear" (abrigos/chaquetas/blazers), "accessory" (bolsos/cinturones/gorras), "one_piece" (vestidos/enterizos).
   - Subcategoría: "Playera / Camiseta", "Camisa", "Polo", "Suéter", "Sudadera / Hoodie", "Jeans", "Pantalón sastre", "Cargo", "Shorts", "Falda", "Sneakers", "Botas", "Mocasines", "Blazer", "Trench Coat", "Chaqueta Denim", "Cazadora Cuero", "Bolso", "Cinturón", etc.

3. SILUETA & ESTILO:
   - Silueta: "Ajustado / Slim", "Corte Recto", "Holgado / Oversized", "Cropped", "Tiro Alto", "Fluido / Suelto".
   - Formalidad: 1 (Athleisure/Gym), 2 (Casual diario), 3 (Smart Casual / Oficina relajada), 4 (Semiformal / Cóctel), 5 (Formal / Gala).
   - Estampado: "Liso / Sólido", "Rayas", "Cuadros", "Floral", "Gráfico", "Estampado".
   - Temporadas: Array con ["primavera", "verano", "otono", "invierno", "todas"].
   - Tags de estilo: 3-4 etiquetas como ["Básico Esencial", "Streetwear Tokyo", "Minimalista", "Estructurado", "Old Money"].

RESPONDE ÚNICAMENTE CON ESTE OBJETO JSON (SIN BLOQUES DE CÓDIGO MARKDOWN):
{
  "name": "string",
  "category": "top" | "bottom" | "footwear" | "outerwear" | "accessory" | "one_piece",
  "subcategory": "string",
  "primaryColors": ["Color principal", "Color secundario opcional"],
  "colorHexes": ["#HEX1", "#HEX2"],
  "pattern": "Liso / Sólido | Rayas | Cuadros | Floral | Gráfico | Estampado",
  "silhouette": "Ajustado / Slim | Corte Recto | Holgado / Oversized | Cropped | Tiro Alto | Fluido / Suelto",
  "seasons": ["primavera" | "verano" | "otono" | "invierno" | "todas"],
  "formalityLevel": 1 a 5,
  "material": "Algodón, Lino, Lana, Denim, Piel, Cuero, etc.",
  "aiTags": ["string"]
}`;

    // 1. Google Gemini (Gemini 2.0 Flash / Gemini 1.5 Flash)
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
                temperature: 0.1,
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
                  { type: "text", text: "Clasifica y extrae los atributos de estilismo y color de esta prenda." },
                  { type: "image_url", image_url: { url: image.startsWith("data:") ? image : `data:${mimeType};base64,${base64Data}` } },
                ],
              },
            ],
            temperature: 0.1,
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

    // 3. Groq Vision
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
            temperature: 0.1,
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
      name: "Prenda IMFTOK",
      category: "top",
      subcategory: "Prenda de vestir",
      primaryColors: ["Neutro"],
      colorHexes: ["#DDD4C0"],
      pattern: "Liso / Sólido",
      silhouette: "Corte Recto",
      seasons: ["todas"],
      formalityLevel: 3,
      aiTags: ["IMFTOK", "Básico Esencial"],
    });
  } catch (error) {
    console.error("Analyze image API error:", error);
    return NextResponse.json({ error: "Error analizando la prenda" }, { status: 500 });
  }
}

function sanitizeGarmentData(data: any) {
  const validCategories = ["top", "bottom", "footwear", "outerwear", "accessory", "one_piece"];
  let cat = String(data.category || "").toLowerCase();
  if (!validCategories.includes(cat)) {
    if (cat.includes("shirt") || cat.includes("camisa") || cat.includes("top") || cat.includes("playera") || cat.includes("sueter") || cat.includes("t-shirt") || cat.includes("sudadera") || cat.includes("hoodie")) cat = "top";
    else if (cat.includes("pant") || cat.includes("jean") || cat.includes("trouser") || cat.includes("short") || cat.includes("skirt") || cat.includes("falda") || cat.includes("cargo")) cat = "bottom";
    else if (cat.includes("shoe") || cat.includes("sneaker") || cat.includes("boot") || cat.includes("zapato") || cat.includes("mocas") || cat.includes("tenis") || cat.includes("calzado")) cat = "footwear";
    else if (cat.includes("coat") || cat.includes("jacket") || cat.includes("blazer") || cat.includes("abrigo") || cat.includes("chaqueta") || cat.includes("chamarra")) cat = "outerwear";
    else if (cat.includes("bag") || cat.includes("bolso") || cat.includes("belt") || cat.includes("cinturon") || cat.includes("reloj") || cat.includes("gorra") || cat.includes("lentes")) cat = "accessory";
    else if (cat.includes("dress") || cat.includes("vestido") || cat.includes("enterizo") || cat.includes("mono")) cat = "one_piece";
    else cat = "top";
  }

  return {
    name: data.name || "Prenda Registrada",
    category: cat,
    subcategory: data.subcategory || "Prenda",
    primaryColors: Array.isArray(data.primaryColors) && data.primaryColors.length > 0 ? data.primaryColors : ["Neutro"],
    colorHexes: Array.isArray(data.colorHexes) && data.colorHexes.length > 0 ? data.colorHexes : ["#DDD4C0"],
    pattern: data.pattern || "Liso / Sólido",
    silhouette: data.silhouette || "Corte Recto",
    seasons: Array.isArray(data.seasons) && data.seasons.length > 0 ? data.seasons : ["todas"],
    formalityLevel: typeof data.formalityLevel === "number" ? Math.min(5, Math.max(1, data.formalityLevel)) : 3,
    material: data.material || "Textil",
    aiTags: Array.isArray(data.aiTags) ? data.aiTags : ["IMFTOK Wardrobe"],
  };
}
