import { NextRequest, NextResponse } from "next/server";
import { getRecipesPage } from "@/lib/store";
import { createSupabaseClient } from "@/lib/supabase";

const VALID_TABS = new Set(["comunidad", "mis-recetas", "favoritos"]);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") ?? "comunidad";
    const query = searchParams.get("query") ?? undefined;
    const userId = searchParams.get("userId") ?? undefined;
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "12");

    if (!VALID_TABS.has(tab)) {
      return NextResponse.json({ error: "Tab inválida" }, { status: 400 });
    }

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1) {
      return NextResponse.json({ error: "Paginación inválida" }, { status: 400 });
    }

    const accessToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? undefined;
    const supabase = createSupabaseClient(accessToken);
    const data = await getRecipesPage(
      {
        tab: tab as "comunidad" | "mis-recetas" | "favoritos",
        userId,
        query,
        page,
        pageSize,
      },
      supabase
    );

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[/api/recipes]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
