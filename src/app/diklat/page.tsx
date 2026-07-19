import { isDiklatLoggedIn } from "@/lib/diklat/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import DiklatSheetView from "@/components/diklat/DiklatSheetView";
import type { DiklatSheet } from "@/types/diklat";

export const dynamic = "force-dynamic";

export default async function DiklatPage() {
  const isEditor = isDiklatLoggedIn();

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("diklat_sheet_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  const sheet: DiklatSheet = data
    ? (data as DiklatSheet)
    : { id: "main", title: "Data Diklat", columns: [], rows: [], updated_at: new Date().toISOString() };

  return (
    <div className="min-h-screen bg-space bg-hex-grid px-4 py-8 text-ink sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <DiklatSheetView initialSheet={sheet} isEditor={isEditor} />
      </div>
    </div>
  );
}
