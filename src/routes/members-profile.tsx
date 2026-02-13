import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/members-profile")({
  component: MembersProfileRedirect,
});

function MembersProfileRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/members" });
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="text-text-secondary">Redirecting to residents...</div>
    </div>
  );
}
