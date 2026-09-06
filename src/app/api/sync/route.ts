import { NextRequest, NextResponse } from "next/server";

// In-memory / serverless cache for fast cross-device sync
// When deployed on Vercel or local, this lets users share and restore wardrobes across devices using their Vault Code.
const vaultStore = new Map<string, {
  profile: any;
  garments: any[];
  outfits: any[];
  updatedAt: string;
}>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vaultId, profile, garments, outfits, supabaseConfig } = body;

    if (!vaultId || typeof vaultId !== "string") {
      return NextResponse.json({ error: "vaultId is required" }, { status: 400 });
    }

    const cleanVaultId = vaultId.trim().toUpperCase();

    // 1. If user configured custom Supabase
    if (supabaseConfig?.url && supabaseConfig?.key) {
      try {
        const supaRes = await fetch(`${supabaseConfig.url}/rest/v1/user_vaults`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseConfig.key,
            Authorization: `Bearer ${supabaseConfig.key}`,
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            vault_id: cleanVaultId,
            profile,
            garments,
            outfits,
            updated_at: new Date().toISOString(),
          }),
        });

        if (supaRes.ok) {
          return NextResponse.json({ success: true, syncedVia: "supabase", vaultId: cleanVaultId });
        }
      } catch (err) {
        console.warn("Supabase direct sync failed, falling back to Vault API:", err);
      }
    }

    // 2. Save in Server Vault Store
    const payload = {
      profile: profile || {},
      garments: garments || [],
      outfits: outfits || [],
      updatedAt: new Date().toISOString(),
    };

    vaultStore.set(cleanVaultId, payload);

    return NextResponse.json({
      success: true,
      syncedVia: "cloud_vault",
      vaultId: cleanVaultId,
      updatedAt: payload.updatedAt,
      garmentCount: payload.garments.length,
    });
  } catch (error) {
    console.error("Sync POST error:", error);
    return NextResponse.json({ error: "Failed to sync vault" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vaultId = searchParams.get("vaultId");

    if (!vaultId) {
      return NextResponse.json({ error: "vaultId query parameter is required" }, { status: 400 });
    }

    const cleanVaultId = vaultId.trim().toUpperCase();

    // Check memory store
    const cached = vaultStore.get(cleanVaultId);
    if (cached) {
      return NextResponse.json({
        success: true,
        found: true,
        vaultId: cleanVaultId,
        data: cached,
      });
    }

    return NextResponse.json({
      success: true,
      found: false,
      message: `No se encontró una bóveda con el código ${cleanVaultId}. Asegúrate de haber hecho clic en 'Sincronizar a la Nube' en tu dispositivo principal primero.`,
    });
  } catch (error) {
    console.error("Sync GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve vault" }, { status: 500 });
  }
}
