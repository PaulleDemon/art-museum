import * as THREE from 'three';


function createImageMaterial(textureUrl, meshAspect = 1 / 1) {
	const ImageMaterial = new THREE.ShaderMaterial({
		uniforms: {
			imageAspect: { value: 1 }, // Will be set based on the image dimensions
			meshAspect: { value: 1 },  // Will be set based on the mesh's scale
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
          uniform float imageAspect;
          uniform float meshAspect;
          uniform vec3 color;
          uniform sampler2D map;
          uniform float grayscale;
          uniform float opacity;
          const vec3 luma = vec3(0.299, 0.587, 0.114);

          vec4 toGrayscale(vec4 color, float intensity) {
            return vec4(mix(color.rgb, vec3(dot(color.rgb, luma)), intensity), color.a);
          }

          void main() {
            // Adjust UV based on the aspect ratio of the image and the mesh
            vec2 uv = vUv;
            
            if (meshAspect > imageAspect) {
                uv.x = uv.x * imageAspect / meshAspect;
            } else {
                uv.y = uv.y * meshAspect / imageAspect;
            }

            // Clamp the UVs to ensure the image stays within bounds
            uv = clamp(uv, 0.0, 1.0);

            // Get the texture color and apply grayscale and opacity
            gl_FragColor = toGrayscale(texture2D(map, uv) * vec4(color, opacity), grayscale);
          }
        `,
	});


	const textureLoader = new THREE.TextureLoader();
	textureLoader.load(textureUrl, function (texture) {
		// const imageBounds = new THREE.Vector2(texture.image.width, texture.image.height);
		// ImageMaterial.uniforms.imageBounds.value.copy(imageBounds);
		// ImageMaterial.uniforms.map.value = texture;
		// cover(texture, meshAspect);

		// ImageMaterial.uniforms.map.value = THREE.TextureUtils.cover(texture, meshAspect);



		const imageAspect = texture.image.width / texture.image.height;
		ImageMaterial.uniforms.imageAspect.value = imageAspect;
		ImageMaterial.uniforms.map.value = texture;

		// // Compute mesh aspect ratio based on its world scale or geometry
		ImageMaterial.uniforms.meshAspect.value = meshAspect;
	});

	return ImageMaterial;
}

export default createImageMaterial;
