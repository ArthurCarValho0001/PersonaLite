using System.Buffers.Binary;
namespace PersonaLite.Domain.Services;
public static class ImagemAvatar
{
    public static string Validar(byte[] bytes, int limiteBytes, int limiteDimensao)
    {
        if (bytes.Length < 24 || bytes.Length > limiteBytes) throw new ArgumentException("Imagem vazia ou acima do tamanho permitido.");
        int largura = 0, altura = 0; string extensao;
        if (bytes.AsSpan(0, 8).SequenceEqual(new byte[] {137,80,78,71,13,10,26,10})) {
            if (!bytes.AsSpan(12,4).SequenceEqual("IHDR"u8) || bytes.Length < 45 || !bytes.AsSpan(bytes.Length-8,4).SequenceEqual("IEND"u8)) throw new ArgumentException("PNG inválido.");
            largura = BinaryPrimitives.ReadInt32BigEndian(bytes.AsSpan(16,4)); altura = BinaryPrimitives.ReadInt32BigEndian(bytes.AsSpan(20,4)); extensao = ".png";
        } else if (bytes[0] == 255 && bytes[1] == 216 && bytes[^2] == 255 && bytes[^1] == 217) {
            extensao = ".jpg";
            for (int p = 2; p + 8 < bytes.Length;) {
                if (bytes[p++] != 255) throw new ArgumentException("JPEG inválido.");
                while (p < bytes.Length && bytes[p] == 255) p++;
                if (p + 2 >= bytes.Length) break;
                var marker = bytes[p++];
                if (marker == 218 || marker == 217) break;
                var len = BinaryPrimitives.ReadUInt16BigEndian(bytes.AsSpan(p,2));
                if (len < 2 || p + len > bytes.Length) throw new ArgumentException("JPEG inválido.");
                if (marker is 192 or 193 or 194) {
                    if (len < 8) throw new ArgumentException("JPEG inválido.");
                    altura = BinaryPrimitives.ReadUInt16BigEndian(bytes.AsSpan(p+3,2)); largura = BinaryPrimitives.ReadUInt16BigEndian(bytes.AsSpan(p+5,2)); break;
                }
                p += len;
            }
        } else throw new ArgumentException("Envie uma imagem PNG ou JPEG.");
        if (largura <= 0 || altura <= 0 || largura > limiteDimensao || altura > limiteDimensao) throw new ArgumentException("Dimensões da imagem fora do limite permitido.");
        return extensao;
    }
}
