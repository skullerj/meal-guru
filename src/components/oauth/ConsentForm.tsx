import { useState } from "react";
import Button from "@/components/shared/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const supabase = createSupabaseBrowserClient();

interface ConsentFormProps {
  authorizationId: string;
  clientName: string;
  scope: string;
  redirectUri: string;
}

function ConsentForm({
  authorizationId,
  clientName,
  scope,
  redirectUri,
}: ConsentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"approve" | "deny" | null>(null);

  async function handleApprove() {
    setError(null);
    setLoading("approve");

    const { data, error } = await supabase.auth.oauth.approveAuthorization(
      authorizationId,
      { skipBrowserRedirect: true }
    );

    if (error) {
      setError(error.message);
      setLoading(null);
    } else {
      window.location.href = data.redirect_url;
    }
  }

  async function handleDeny() {
    setError(null);
    setLoading("deny");

    const { data, error } = await supabase.auth.oauth.denyAuthorization(
      authorizationId,
      { skipBrowserRedirect: true }
    );

    if (error) {
      setError(error.message);
      setLoading(null);
    } else {
      window.location.href = data.redirect_url;
    }
  }

  const scopes = scope ? scope.split(" ").filter((s) => s.length > 0) : [];

  return (
    <div className="w-full max-w-sm px-6">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="font-heading text-2xl text-foreground text-center mb-6">
          Meal Guru
        </h1>

        <p className="text-sm text-foreground text-center mb-4">
          <span className="font-bold">{clientName}</span> wants to access your
          Meal Guru account
        </p>

        {scopes.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground mb-2">
              Requested permissions:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {scopes.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mb-6 break-all">
          Redirect: {redirectUri}
        </p>

        {error && (
          <p className="text-sm text-destructive text-center mb-4">{error}</p>
        )}

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            loading={loading === "approve"}
            disabled={loading !== null}
            onClick={handleApprove}
            className="w-full"
          >
            Authorize
          </Button>
          <Button
            variant="danger"
            size="lg"
            loading={loading === "deny"}
            disabled={loading !== null}
            onClick={handleDeny}
            className="w-full"
          >
            Deny
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConsentForm;
