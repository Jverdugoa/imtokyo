# Atelier IA — Asistente de Estilismo Personal & Guardarropa Inteligente

Una aplicación web completa, elegante y moderna lista para desplegar en **Vercel**, diseñada para organizar tu guardarropa mediante fotos, identificar tu colorimetría/complexión y generar combinaciones de ropa (outfits) con la lógica y criterio de un estilista profesional.

---

## 🌟 Características Principales

### 1. Diagnóstico de Estilo & Colorimetría (Fase 1: Onboarding)
- Detección de silueta/complexión física (Reloj de arena, Rectangular, Triángulo, etc.).
- Clasificación de **subtono de piel** (Cálido, Frío, Neutro) con paletas de colores recomendadas.
- Preferencias de estilos (*Minimalista, Old Money, Smart Casual, Streetwear, etc.*) y contextos de uso frecuente.
- Filosofía de armario (solo prendas existentes vs. sugerencias de compra opcionales).

### 2. Guardarropa Inteligente (Fase 2: Registro con Visión IA)
- Carga de fotos de prendas desde archivo o cámara móvil en tiempo real.
- **Análisis por Visión Artificial** (Gemini 2.0 Flash / GPT-4o-mini / Groq Llama 3.2 Vision / Motor Local):
  - Extracción de categoría (*Superior, Inferior, Calzado, Abrigo, Accesorio, Enterizo*).
  - Identificación de colores primarios y secundarios con muestra visual HEX.
  - Silueta y corte (*Oversized, Slim, Tiro Alto, Recto, Fluido*).
  - Nivel de formalidad (1 a 5) y temporadas recomendadas.
- Galería con filtros instantáneos por categoría, temporada, color y buscador de texto.
- Contador de usos de prendas para medir el rendimiento de tu armario.

### 3. Generador de Outfits & Estilista IA (Fase 3: Combinaciones)
- Contexto dinámico: **Ocasión** (*Oficina, Cita romántica, Fiesta nocturna, Casual brunch, Gym, Viaje*), **Clima** (*Cálido, Templado, Frío, Lluvia*) e **Intención de estilo**.
- Algoritmo de estilismo profesional:
  - **Regla 60-30-10** de armonía de color.
  - **Regla del Sándwich** (coordinación cromática superior - calzado).
  - **Regla de los Tercios** y contraste de volúmenes (oversize vs. ceñido).
  - Justificación editorial de 1-2 líneas ("*Por qué funciona este look*").
  - Trucos de estilismo prácticos (remangar puños, dobladillos, accesorios).
  - Sugerencia de prenda complementaria faltante opcional.

### 4. Chat Asesor en Tiempo Real (Fase 4: Asesoría Continua)
- Asistente conversacional con acceso y memoria de todo tu inventario registrado.
- Sugerencias rápidas para combinar prendas específicas o saber qué básicos te faltan.

### 5. Lookbook & Diagnóstico Exportable
- Guarda tus combinaciones favoritas y califícalas del 1 al 5.
- Botón de **"Copiar Resumen de Guardarropa"** para transferir tu inventario como texto formateado a cualquier GPT o respaldo.

---

## 🚀 Despliegue en Vercel en 3 Pasos

1. **Subir a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: Atelier IA Personal Stylist App"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/atelier-ia.git
   git push -u origin main
   ```

2. **Importar en Vercel**:
   - Entra en [vercel.com/new](https://vercel.com/new).
   - Selecciona tu repositorio `atelier-ia`.
   - Next.js será detectado automáticamente.

3. **Variables de Entorno (Opcionales)**:
   Agrega en los Settings de Vercel cualquiera de estas API Keys:
   - `GEMINI_API_KEY` (Google AI Studio - Gemini 2.0 Flash)
   - `OPENAI_API_KEY` (OpenAI - GPT-4o-mini)
   - `GROQ_API_KEY` (Groq Console - Llama 3.2 Vision)
   *(Si no configuras ninguna, la app funcionará con el motor de reglas de estilismo local integrado).*

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
