import { api } from "@/lib/api";
import AddTeamMemberButton from "@/components/forms/add-team-form";
import TeamList from "./team-list";

const roleColors: Record<string, string> = {
  "Traditional Photographer": "from-amber-400 to-orange-500",
  "Traditional Videographer": "from-blue-400 to-indigo-500",
  Cinematographer: "from-purple-400 to-violet-500",
  "Candid Photographer": "from-rose-400 to-pink-500",
  Assistant: "from-teal-400 to-cyan-500",
  Choreographer: "from-emerald-400 to-green-500",
  Director: "from-red-400 to-rose-500",
  Editor: "from-slate-400 to-gray-600",
};

import { createClient } from "@/lib/supabase.server";

export default async function TeamPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const members = await api.team.list(token);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="mt-0.5 text-sm text-gray-500">{members.length} team members</p>
        </div>
        <AddTeamMemberButton />
      </div>

      <TeamList initialMembers={members} />
    </div>
  );
}
