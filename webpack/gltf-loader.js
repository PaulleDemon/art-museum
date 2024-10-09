const path = require('path')
const loaderUtils = require('loader-utils')

module.exports = function (content) {
  if (this.cacheable) this.cacheable()

  let options = loaderUtils.getOptions(this) || {}
  let context = options.context || this.rootContext
  let done = this.async()

  const resolveLoaderAssets = resolveAssets.bind(this)
  const emitLoaderData = emitData.bind(this, options, context)

  let json = JSON.parse(content)
  let { images, buffers } = stripAssets(json)
  let dataPath = emitLoaderData(json)

  Promise.all([
    resolveLoaderAssets(images),
    resolveLoaderAssets(buffers)
  ]).then(([images, buffers]) => {
    let gltfOut = generateGltfModule(json, images, buffers, dataPath)
    done(null, gltfOut)
  }).catch((err) => {
    done(err)
  })
}

function stripAssets (json) {
  let images = json.images || []
  let buffers = json.buffers || []

  delete json.images
  delete json.buffers

  return { images, buffers }
}

function resolveAssets (assets) {
  if (!assets) return Promise.resolve([])
  let resourceDir = path.dirname(this.resource)
  return Promise.all(
    assets.map(({ uri }) =>
      resolveDependency(this, resourceDir, `./${uri}`).then(() => uri)
    ))
}

function resolveDependency (loader, context, chunkPath) {
  return new Promise((resolve, reject) => {
    loader.resolve(context, chunkPath, (err, dependency) => {
      if (err) return reject(err)

      loader.addDependency(dependency)
      resolve(dependency)
    })
  })
}

function emitData (options, context, json) {
  let content = JSON.stringify(json)
  content = content.slice(1, -1)

  let url = loaderUtils.interpolateName(
    this,
    options.name || '[contenthash].[ext]',
    {
      context,
      content,
      regExp: options.regExp,
    }
  )

  let outputPath = url
  let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`

  this.emitFile(outputPath, content)

  return publicPath
}

function generateGltfModule (json, images, buffers, dataPath) {
  let moduleSource = '/***** glTF Module *****/\n'
  let gltfString = ''

  gltfString += `images:[`
  images.forEach((asset, i, arr) => {
    gltfString += `require('./${asset}')`
    if (i < arr.length - 1) gltfString += ','
  })
  gltfString += `],\n`

  gltfString += `buffers:[`
  buffers.forEach((asset, i, arr) => {
    gltfString += `require('./${asset}')`
    if (i < arr.length - 1) gltfString += ','
  })
  gltfString += `],\n`

  gltfString += `dataPath:${dataPath}`

  moduleSource += `module.exports = {\n${gltfString}};\n`

  return moduleSource
}