import { NextRequest, NextResponse } from "next/server";
import { Garment, UserProfile, Outfit } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { occasion, weather, vibe, profile, garments, config } = await req.json();

    if (!garments || garments.length === 0) {
      return NextResponse.json({ error: "No garments provided" }, { status: 400 });
    }

    const geminiKey = config?.geminiKey || process.env.GEMINI_API_KEY;
    const openaiKey = config?.openaiKey || process.env.OPENAI_API_KEY;
    const groqKey = config?.groqKey || process.env.GROQ_API_KEY;

    const wardrobeSummary = garments.map((g: Garment) => ({
      id: g.id,
      name: g.name,
      category: g.category,
      subcategory: g.subcategory,
      primaryColors: g.primaryColors,
      silhouette: g.silhouette,
      formalityLevel: g.formalityLevel,
      seasons: g.seasons,
    }));

    const systemPrompt = `Eres un Asistente de Estilismo Personal de alta costura y asesor de imagen profesional.
Tu misión es seleccionar y combinar prendas del guardarropa REAL del usuario para la ocasión y clima solicitados.

CRITERIOS PROFESIONALES OBLIGATORIOS:
1. ARMONÍA DE COLOR: Aplica la regla 60-30-10 o armonías monocromáticas/análogas. Respeta el subtono de piel del usuario (${profile?.skinUndertone || "neutro"}).
2. PROPORCIONES Y SILUETAS: Si la prenda superior es holgada, la inferior debe tener estructura o viceversa (o marcar cintura). Aplica la regla del sándwich (conectar color de calzado con prenda superior o accesorio).
3. CONTEXTO Y CLIMA: Ocasión "${occasion}", Clima "${weather}", Intención "${vibe}".
4. SOLUCIÓN CON LO QUE TIENE: Usa únicamente IDs de prendas existentes en el inventario provisto. Si falta un elemento clave, sugiérelo como "missingPieceSuggestion" opcional.

INVENTARIO DISPONIBLE:
${JSON.stringify(wardrobeSummary, null, 2)}

PERFIL DEL USUARIO:
- Género: ${profile?.genderIdentity || "No especificado"}
- Complexión / Silueta: ${profile?.bodyType || "Proporcional"}
- Subtono de piel: ${profile?.skinUndertone || "Neutro"}
- Estilos preferidos: ${(profile?.preferredStyles || []).join(", ")}
- Colores favoritos: ${(profile?.favoriteColors || []).join(", ")}
- Colores que evita: ${(profile?.avoidedColors || []).join(", ")}

RESPONDE ÚNICAMENTE CON UN JSON VÁLIDO CON ESTA ESTRUCTURA:
{
  "outfits": [
    {
      "id": "outfit-1",
      "title": "Nombre evocador del look (ej: Elegancia Relajada para Oficina)",
      "occasion": "${occasion}",
      "weather": "${weather}",
      "vibe": "${vibe}",
      "garmentIds": ["id_de_prenda1", "id_de_prenda2", "id_de_calzado", "id_de_abrigo_opcional"],
      "stylistRationale": "Explicación breve (1-2 líneas) de por qué funciona esta combinación según colorimetría y silueta.",
      "stylingTips": [
        "Consejo práctico 1 (ej: mete la camisa por delante)",
        "Consejo práctico 2 (ej: remanga las mangas)"
      ],
      "colorHarmonyType": "Monocromático | Análogo | Neutro con Acento | Complementario",
      "missingPieceSuggestion": {
        "name": "Prenda o accesorio sugerido",
        "category": "accessory | footwear | outer",
        "reason": "Por qué elevaría el look"
      }
    }
  ]
}`;

    // 1. Gemini
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: { response_mime_type: "application/json", temperature: 0.4 },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw) {
            const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
            const hydrated = hydrateOutfits(parsed.outfits || [], garments);
            return NextResponse.json({ outfits: hydrated });
          }
        }
      } catch (e) {
        console.error("Gemini Outfit generation error:", e);
      }
    }

    // 2. OpenAI
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
            messages: [{ role: "system", content: systemPrompt }],
            temperature: 0.4,
          }),
        });

        if (openaiRes.ok) {
          const data = await openaiRes.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const hydrated = hydrateOutfits(parsed.outfits || [], garments);
            return NextResponse.json({ outfits: hydrated });
          }
        }
      } catch (e) {
        console.error("OpenAI Outfit generation error:", e);
      }
    }

    // 3. Groq
    if (groqKey) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            messages: [{ role: "system", content: systemPrompt }],
            temperature: 0.4,
          }),
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const hydrated = hydrateOutfits(parsed.outfits || [], garments);
            return NextResponse.json({ outfits: hydrated });
          }
        }
      } catch (e) {
        console.error("Groq outfit generation error:", e);
      }
    }

    return NextResponse.json({ outfits: [] });
  } catch (error) {
    console.error("Generate outfit error:", error);
    return NextResponse.json({ error: "Failed to generate outfit" }, { status: 500 });
  }
}

function hydrateOutfits(rawOutfits: any[], allGarments: Garment[]): Outfit[] {
  const garmentMap = new Map(allGarments.map((g) => [g.id, g]));
  return rawOutfits.map((raw, index) => {
    const items = (raw.garmentIds || [])
      .map((id: string) => garmentMap.get(id))
      .filter((g: any): g is Garment => Boolean(g));

    return {
      id: raw.id || `outfit-ai-${Date.now()}-${index}`,
      title: raw.title || "Look Estilizado Personalizado",
      occasion: raw.occasion || "Ocasión especial",
      weather: raw.weather || "Templado",
      vibe: raw.vibe || "Elegante",
      garmentIds: raw.garmentIds || [],
      items,
      stylistRationale: raw.stylistRationale || "Combinación armónica adaptada a tu perfil de estilo.",
      stylingTips: raw.stylingTips || ["Usa accesorios acordes a la ocasión."],
      colorHarmonyType: raw.colorHarmonyType || "Equilibrio cromático",
      missingPieceSuggestion: raw.missingPieceSuggestion,
      rating: 5,
      createdAt: new Date().toISOString(),
    };
  });
}
