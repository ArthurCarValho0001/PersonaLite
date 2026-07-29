namespace PersonaLite.Domain.ValueObjects;

public record DobrasCutaneas(
    double PeitoralMm,
    double AxilarMediaMm,
    double TricepsMm,
    double SubescapularMm,
    double AbdominalMm,
    double SuprailiacaMm,
    double CoxaMm)
{
    public double Soma7Dobras =>
        PeitoralMm + AxilarMediaMm + TricepsMm + SubescapularMm + AbdominalMm + SuprailiacaMm + CoxaMm;
}
