using PersonaLite.Application.Interfaces;
namespace PersonaLite.Api;
public class CalendarioDispositivo(IHttpContextAccessor accessor) : ICalendario
{
    public string Fuso => accessor.HttpContext?.Request.Headers["X-Time-Zone"].FirstOrDefault() ?? "UTC";
    public DateOnly Hoje {
        get {
            try { return DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById(Fuso))); }
            catch (TimeZoneNotFoundException) { throw new ArgumentException("Fuso horário inválido."); }
            catch (InvalidTimeZoneException) { throw new ArgumentException("Fuso horário inválido."); }
        }
    }
}
