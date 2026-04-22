import { Router, Request, Response } from "express";
import { supabase } from "../DB/supabase";

const router = Router();

/**
 * GET /api/me — Get current user profile based on auth token
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Try to find the profile in our users table by email
    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    }

    // Return profile if found, otherwise fallback to auth user info
    res.json({
      id: profile?.id || user.id,
      full_name: profile?.full_name || user.user_metadata?.full_name || "Admin",
      email: user.email,
      usual_role: profile?.usual_role || "Admin",
      display_id: profile?.display_id || "USR-ADMIN"
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
