import * as THREE from 'three';

function createImageMaterial(textureUrl) {

    const ImageMaterial = new THREE.ShaderMaterial({
        uniforms: {
            scale: { value: new THREE.Vector2(1, 1) },
            imageBounds: { value: new THREE.Vector2(1, 1) },
            color: { value: new THREE.Color('white') },
            map: { value: null },
            zoom: { value: 1 },
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
          uniform float zoom;
          uniform float grayscale;
          uniform float opacity;
          const vec3 luma = vec3(0.299, 0.587, 0.114);
    
          vec4 toGrayscale(vec4 color, float intensity) {
            return vec4(mix(color.rgb, vec3(dot(color.rgb, luma)), intensity), color.a);
          }
    
          vec2 aspect(vec2 size) {
            return size / min(size.x, size.y);
          }
    
          void main() {
            vec2 s = aspect(scale);
            vec2 i = aspect(imageBounds);
            float rs = s.x / s.y;
            float ri = i.x / i.y;
            vec2 newSize = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
            vec2 offset = (rs < ri ? vec2((newSize.x - s.x) / 2.0, 0.0) : vec2(0.0, (newSize.y - s.y) / 2.0)) / newSize;
            vec2 uv = vUv * s / newSize + offset;
            vec2 zUv = (uv - vec2(0.5, 0.5)) / zoom + vec2(0.5, 0.5);
            gl_FragColor = toGrayscale(texture2D(map, zUv) * vec4(color, opacity), grayscale);
          }
        `,
    });

    // Load the texture and set it for the material
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(textureUrl, function (texture) {
        // texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.y = - 1;
        const imageBounds = new THREE.Vector2(texture.image.width, texture.image.height);
        ImageMaterial.uniforms.imageBounds.value.copy(imageBounds);
        ImageMaterial.uniforms.map.value = texture;
    });

    return ImageMaterial;

}



export default createImageMaterial;