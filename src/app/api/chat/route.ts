import { NextRequest, NextResponse } from "next/server";
import { Garment, UserProfile } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { message, profile, garments, config } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const geminiKey = config?.geminiKey || process.env.GEMINI_API_KEY;
    const openaiKey = config?.openaiKey || process.env.OPENAI_API_KEY;
    const groqKey = config?.groqKey || process.env.GROQ_API_KEY;

    const wardrobeList = (garments || [])
      .map((g: Garment) => `- ${g.name} (${g.category}, colores: ${g.primaryColors.join(", ")}, silueta: ${g.silhouette}, formalidad: ${g.formalityLevel}/5)`)
      .join("\n");

    const systemPrompt = `Eres un Asistente de Estilismo Personal. Tu función es ayudar al usuario a organizar su guardarropa, entender su complexión física y estilo personal, y sugerir las mejores combinaciones de ropa (outfits) según el contexto que necesite.

COMPORTAMIENTO:
- Habla en español, con tono cercano, práctico, empático y sin juicios sobre el cuerpo o gustos del usuario.
- Nunca impongas reglas de moda como absolutas; el objetivo es potenciar su estilo personal.
- Cruza siempre las recomendaciones con las prendas reales registradas en su guardarropa.

PERFIL DEL USUARIO:
- Nombre: ${profile?.name || "Usuario"}
- Identidad/Género: ${profile?.genderIdentity || "No especificado"}
- Silueta/Complexión: ${profile?.bodyType || "Proporcional"}
- Subtono de Piel: ${profile?.skinUndertone || "Neutro"}
- Estilos Preferidos: ${(profile?.preferredStyles || []).join(", ")}
- Colores Favoritos: ${(profile?.favoriteColors || []).join(", ")}
- Colores que Evita: ${(profile?.avoidedColors || []).join(", ")}

GUARDARROPA ACTUAL REGISTRADO (${(garments || []).length} prendas):
${wardrobeList || "Aún no ha registrado prendas."}

Responde de manera concisa, elegante y útil. Si recomiendas un outfit, explica en 1-2 líneas por qué funciona y sugiere trucos de estilo prácticos.`;

    // 1. Gemini
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: `${systemPrompt}\n\nUSUARIO: ${message}` }],
                },
              ],
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      } catch (e) {
        console.error("Gemini Chat error:", e);
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
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message },
            ],
            temperature: 0.6,
          }),
        });

        if (openaiRes.ok) {
          const data = await openaiRes.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      } catch (e) {
        console.error("OpenAI Chat error:", e);
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
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message },
            ],
            temperature: 0.6,
          }),
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      } catch (e) {
        console.error("Groq chat error:", e);
      }
    }

    return NextResponse.json({
      reply: `He tomado en cuenta tu guardarropa (${(garments || []).length} prendas). Para tu consulta, te recomiendo combinar prendas que mantengan tu subtono ${profile?.skinUndertone || "neutro"} y balanceen las proporciones con la regla de tercios. ¡Prueba generar un look completo en la pestaña Estilista IA!`,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
