export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-12 max-w-xl mx-auto">
      <h1 className="text-[2rem] font-bold mb-2">Privatlivspolitik</h1>
      <p className="text-[0.72rem] text-muted-foreground mb-8">Sidst opdateret: April 2026 · Melo Parents ApS</p>

      <div className="space-y-6 text-[0.9rem] leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-[1.05rem] font-semibold text-foreground mb-1.5">Hvad vi indsamler</h2>
          <p>Vi indsamler udelukkende de oplysninger, du selv angiver: dit navn, e-mailadresse, barnets navn og fødselsdato, graviditets- eller fødselsinformation samt dagbogsindtastninger. Vi indsamler ikke oplysninger om dig fra tredjeparter.</p>
        </section>

        <section>
          <h2 className="text-[1.05rem] font-semibold text-foreground mb-1.5">Hvordan vi bruger dine data</h2>
          <p>Dine data bruges udelukkende til at levere og forbedre Melo-appen — til at personalisere indhold, synkronisere på tværs af dine enheder og forbinde dig med din medforælder. Vi sælger aldrig dine data til tredjeparter.</p>
        </section>

        <section>
          <h2 className="text-[1.05rem] font-semibold text-foreground mb-1.5">Opbevaring</h2>
          <p>Data gemmes sikkert i Supabase (EU-region). Din konto og alle tilknyttede data kan til enhver tid slettes ved at kontakte os.</p>
        </section>

        <section>
          <h2 className="text-[1.05rem] font-semibold text-foreground mb-1.5">Børns data</h2>
          <p>Vi registrerer barnets navn og fødselsdato for at tilpasse indhold. Disse oplysninger deles ikke med tredjeparter og bruges ikke til markedsføring.</p>
        </section>

        <section>
          <h2 className="text-[1.05rem] font-semibold text-foreground mb-1.5">Dine rettigheder</h2>
          <p>Du har ret til at se, rette eller slette dine personoplysninger. Kontakt os på <a href="mailto:hej@meloparents.dk" className="underline">hej@meloparents.dk</a>.</p>
        </section>

        <section>
          <h2 className="text-[1.05rem] font-semibold text-foreground mb-1.5">Cookies og analyse</h2>
          <p>Vi bruger ingen tredjeparts-reklamecookies. Vi kan bruge anonymiserede fejllog for at forbedre app-stabiliteten.</p>
        </section>

        <section>
          <h2 className="text-[1.05rem] font-semibold text-foreground mb-1.5">Kontakt</h2>
          <p>Melo Parents ApS · <a href="mailto:hej@meloparents.dk" className="underline">hej@meloparents.dk</a></p>
        </section>
      </div>
    </div>
  );
}
