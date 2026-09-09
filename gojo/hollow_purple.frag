// ============================================================
//  GOJO - Hueco Púrpura  |  TouchDesigner GLSL TOP (Pixel Shader)
// ------------------------------------------------------------
//  Azul  (Cursed Technique Lapse: Blue  -> atracción)
//  Rojo  (Cursed Technique Reversal: Red -> repulsión)
//  Morado (Hollow Purple -> cuando ambos se juntan)
//
//  Pega este código en el "Pixel Shader" de un GLSL TOP.
//  Uniforms a declarar en la página "Vectors" / "Values" del TOP:
//    uPosA   (vec2)  posición bola azul   0..1
//    uPosB   (vec2)  posición bola roja   0..1
//    uRadius (float) tamaño del brillo    ~0.15
//    uAspect (float) ancho/alto del TOP   (ej. 1.777 para 16:9)
// ============================================================

out vec4 fragColor;

uniform vec2  uPosA;
uniform vec2  uPosB;
uniform float uRadius;
uniform float uAspect;

// Campo de brillo suave alrededor de un punto
vec3 glow(vec2 p, vec2 c, float r, vec3 color){
    float d = length(p - c);
    float g = r / max(d, 0.0001);   // brillo que decae con la distancia
    g = pow(g, 1.6);                // más contraste / núcleo definido
    return color * g;
}

void main(){
    // corrige el aspecto para que las bolas sean redondas y no ovaladas
    vec2 uv = vUV.st;
    uv.x *= uAspect;

    vec2 a = uPosA; a.x *= uAspect;
    vec2 b = uPosB; b.x *= uAspect;

    vec3 blue = glow(uv, a, uRadius, vec3(0.15, 0.45, 1.00));
    vec3 red  = glow(uv, b, uRadius, vec3(1.00, 0.15, 0.20));

    // Mezcla aditiva base (azul + rojo tiende a magenta/morado)
    vec3 col = blue + red;

    // Realce del MORADO donde los dos campos coinciden fuerte
    float overlap = min(length(blue), length(red));
    col += vec3(0.55, 0.10, 1.00) * overlap * 1.8;

    // Tone mapping simple para que el núcleo brille sin "quemarse" feo
    col = col / (col + 1.0);

    fragColor = vec4(col, 1.0);
}
