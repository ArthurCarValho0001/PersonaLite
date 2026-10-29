using PersonaLite.Domain.Services;
using StbImageSharp;
namespace PersonaLite.Infrastructure.Imaging;

public static class ValidadorAvatar
{
    public static string Validar(byte[] bytes, int maxBytes, int maxDimension)
    {
        var extensao = ImagemAvatar.Validar(bytes, maxBytes, maxDimension);
        try
        {
            var imagem = ImageResult.FromMemory(bytes, ColorComponents.RedGreenBlueAlpha);
            if (imagem.Width <= 0 || imagem.Height <= 0 || imagem.Width > maxDimension || imagem.Height > maxDimension
                || imagem.Data.Length != checked(imagem.Width * imagem.Height * 4))
                throw new ArgumentException("Dimensões inválidas.");
        }
        catch (Exception ex) when (ex is not OutOfMemoryException)
        {
            throw new ArgumentException("Não foi possível decodificar a imagem PNG/JPEG. O avatar anterior foi preservado.");
        }
        return extensao;
    }
}
