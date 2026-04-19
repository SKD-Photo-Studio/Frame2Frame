import { Router, Request, Response } from "express";
import { supabase, getDefaultTenantId } from "../DB/supabase";

const router = Router();

/**
 * GET / — Get current tenant info (Name, Logo, etc.)
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const tenantId = await getDefaultTenantId();

    const { data, error } = await supabase
      .from("tenants")
      .select("id, display_id, company_name, logo_url")
      .eq("id", tenantId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT / — Update current tenant info
 */
router.put("/", async (req: Request, res: Response) => {
  try {
    const tenantId = await getDefaultTenantId();
    const { company_name, logo_url } = req.body;

    const { data, error } = await supabase
      .from("tenants")
      .update({ company_name, logo_url, updated_at: new Date().toISOString() })
      .eq("id", tenantId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /logo — Upload logo to Supabase Storage and return URL
 */
router.post("/logo", async (req: Request, res: Response) => {
  try {
    const tenantId = await getDefaultTenantId();
    const { base64 } = req.body;

    if (!base64) return res.status(400).json({ error: "Base64 image string is required" });

    // 1. Parse base64
    // Format: "data:image/png;base64,iVBORw..."
    const matches = base64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ error: "Invalid base64 format" });

    const mimeType = matches[1];
    const extension = mimeType.split("/")[1];
    const buffer = Buffer.from(matches[2], "base64");
    
    // 2. Generate unique path: logos/tenant_{id}_logo_{timestamp}.ext
    const fileName = `tenant_${tenantId}_logo_${Date.now()}.${extension}`;
    const filePath = fileName;

    // 3. Upload to Supabase Storage
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("logos")
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadErr) throw uploadErr;

    // 4. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from("logos")
      .getPublicUrl(filePath);

    // 5. Update Tenant in DB
    const { error: dbErr } = await supabase
      .from("tenants")
      .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", tenantId);

    if (dbErr) throw dbErr;

    res.json({ url: publicUrl });
  } catch (err: any) {
    console.error("Logo upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
