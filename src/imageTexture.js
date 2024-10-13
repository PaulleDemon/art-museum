import * as THREE from 'three';

function createImageMaterial(textureUrl) {
    const ImageMaterial = new THREE.ShaderMaterial({
        uniforms: {
            scale: { value: new THREE.Vector2(1, 1) },
            imageBounds: { value: new THREE.Vector2(1, 1) },
            color: { value: new THREE.Color('white') },
            map: { value: null },
            grayscale: { value: 0 },
            opacity: { value: 1 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.);
            vUv = uv;
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform vec2 scale;
          uniform vec2 imageBounds;
          uniform vec3 color;
          uniform sampler2D map;
          uniform float grayscale;
          uniform float opacity;
          const vec3 luma = vec3(0.299, 0.587, 0.114);

          vec4 toGrayscale(vec4 color, float intensity) {
            return vec4(mix(color.rgb, vec3(dot(color.rgb, luma)), intensity), color.a);
          }

          void main() {
            // Get the aspect ratios of the scale and the image
            float aspectScale = scale.x / scale.y;
            float aspectImage = imageBounds.x / imageBounds.y;

            // Determine the scale factor based on the aspect ratios
            vec2 scaleFactor;
            if (aspectScale > aspectImage) {
                scaleFactor = vec2(aspectImage / aspectScale, 1.0); // Fit by height
            } else {
                scaleFactor = vec2(1.0, aspectScale / aspectImage); // Fit by width
            }

            // Scale the UVs based on the scaleFactor but do not center
            vec2 uv = vUv * scaleFactor;

            // Clamp the UVs to the range [0, 1] to keep the texture within bounds
            uv = clamp(uv, 0.0, 1.0);
            
            // Get the texture color and apply grayscale and opacity
            gl_FragColor = toGrayscale(texture2D(map, uv) * vec4(color, opacity), grayscale);
          }
        `,
    });

    // Load the texture and set it for the material
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(textureUrl, function (texture) {
        const imageBounds = new THREE.Vector2(texture.image.width, texture.image.height);
        ImageMaterial.uniforms.imageBounds.value.copy(imageBounds);
        ImageMaterial.uniforms.map.value = texture;
    });

    return ImageMaterial;
}

export default createImageMaterial;
