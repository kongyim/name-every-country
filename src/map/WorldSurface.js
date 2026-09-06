import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import mapUrl from '@/assets/map.svg'

const WIDTH = Math.PI * 2
const HEIGHT = Math.PI
const FRONT = new THREE.Vector3(0, 0, 6)

// The same UV coordinates anchor both the texture and the country markers.
function surfacePoint(u, v, unfold, target = new THREE.Vector3()) {
  const longitude = (u - 0.5) * WIDTH
  const latitude = (v - 0.5) * HEIGHT
  return target.set(
    (1 - unfold) * Math.sin(longitude) * Math.cos(latitude) + unfold * longitude,
    (1 - unfold) * Math.sin(latitude) + unfold * latitude,
    (1 - unfold) * Math.cos(longitude) * Math.cos(latitude)
  )
}

export default class WorldSurface {
  constructor(host, onSelect) {
    this.host = host
    this.onSelect = onSelect
    this.mode = 'globe'
    this.unfold = 0
    this.markers = []
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor('#e6f0f5')
    this.contextLost = () => this.host.dispatchEvent(new Event('map-error'))
    this.renderer.domElement.addEventListener('webglcontextlost', this.contextLost)
    host.appendChild(this.renderer.domElement)
    this.scene = new THREE.Scene()
    this.surfaceGroup = new THREE.Group()
    this.scene.add(this.surfaceGroup)
    this.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 30)
    this.camera.position.copy(FRONT)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enablePan = false
    this.controls.enableRotate = false
    this.controls.enableDamping = false
    this.controls.zoomSpeed = 0.7
    this.controls.maxZoom = 6
    this.controls.addEventListener('start', this.cancelFocus = () => {
      if (this.animation && !this.animation.switching) this.animation = null
    })
    this.geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT, 144, 72)
    this.material = new THREE.MeshBasicMaterial({ color: '#b9d9e9', side: THREE.DoubleSide })
    this.surface = new THREE.Mesh(this.geometry, this.material)
    this.surfaceGroup.add(this.surface)
    this.markerGeometry = new THREE.SphereGeometry(0.009, 8, 6)
    this.markerMaterials = {
      default: new THREE.MeshBasicMaterial({ color: '#64748b' }),
      active: new THREE.MeshBasicMaterial({ color: '#00ff00' }),
      last: new THREE.MeshBasicMaterial({ color: '#ffdf00' })
    }
    this.raycaster = new THREE.Raycaster()
    this.pointers = new Map()
    this.pointerDown = event => {
      this.dragged = false
      this.pointerStart = { x: event.clientX, y: event.clientY }
      if (event.button !== 0 && event.pointerType !== 'touch') return
      const grabbed = this.mode === 'globe' && !this.animation?.switching && !!this.projectOnGlobe(event, false)
      this.pointers.set(event.pointerId, { ...this.pointerStart, grabbed })
      if (this.pointers.size > 1) this.dragged = true
      if (grabbed) {
        this.cancelFocus()
        this.renderer.domElement.setPointerCapture(event.pointerId)
      }
    }
    this.pointerMove = event => {
      if (this.pointerStart && event.buttons && Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y) > 5) this.dragged = true
      const previous = this.pointers.get(event.pointerId)
      if (!previous) return
      if (previous.grabbed && this.pointers.size === 1 && this.mode === 'globe' && !this.animation?.switching) {
        // Rotate the grabbed surface point onto the new cursor position.
        // Projection includes the current zoom, so dragging has no speed multiplier.
        const from = this.projectOnGlobe({ clientX: previous.x, clientY: previous.y })
        const to = this.projectOnGlobe(event)
        const rotation = new THREE.Quaternion().setFromUnitVectors(from, to)
        this.surfaceGroup.quaternion.premultiply(rotation).normalize()
      }
      this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, grabbed: previous.grabbed })
    }
    this.pointerUp = event => this.pointers.delete(event.pointerId)
    this.click = event => this.pick(event)
    host.addEventListener('pointerdown', this.pointerDown)
    host.addEventListener('pointermove', this.pointerMove)
    host.addEventListener('pointerup', this.pointerUp)
    host.addEventListener('pointercancel', this.pointerUp)
    host.addEventListener('lostpointercapture', this.pointerUp)
    host.addEventListener('click', this.click)
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(host)
    this.resize()
    this.camera.zoom = this.globeZoom()
    this.camera.updateProjectionMatrix()
    this.updateSurface()
    this.loadTexture()
    this.renderer.setAnimationLoop(time => this.render(time))
  }

  async loadTexture() {
    this.textureRequest = new AbortController()
    this.image = new Image()
    this.image.onload = () => {
      if (this.disposed) return
      const canvas = document.createElement('canvas')
      canvas.width = 2520
      canvas.height = 1260
      const context = canvas.getContext('2d')
      context.fillStyle = '#b9d9e9'
      context.fillRect(0, 0, canvas.width, canvas.height)
      // Match the existing map's wrapped 100px horizontal offset.
      context.drawImage(this.image, -100, 0, 2520, 1260)
      context.drawImage(this.image, 2420, 0, 2520, 1260)
      URL.revokeObjectURL(this.textureUrl)
      this.texture = new THREE.CanvasTexture(canvas)
      this.texture.colorSpace = THREE.SRGBColorSpace
      this.texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
      this.material.map = this.texture
      this.material.color.set('#ffffff')
      this.material.needsUpdate = true
    }
    this.image.onerror = () => this.host.dispatchEvent(new Event('map-error'))
    try {
      const response = await fetch(mapUrl, { signal: this.textureRequest.signal })
      if (!response.ok) throw new Error('Map texture could not be loaded')
      const source = await response.text()
      if (this.disposed) return
      const svg = new DOMParser().parseFromString(source, 'image/svg+xml')
      // Illustrator's embedded foreignObject taints canvas/WebGL textures.
      // Keep the original vector artwork and strip only editor metadata.
      for (const tag of ['foreignObject', 'pgf']) {
        Array.from(svg.getElementsByTagNameNS('*', tag)).forEach(node => node.remove())
      }
      if (svg.doctype) svg.removeChild(svg.doctype)
      this.textureUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }))
      this.image.src = this.textureUrl
    } catch (error) {
      if (!this.disposed) this.host.dispatchEvent(new Event('map-error'))
    }
  }

  globeZoom() { return Math.min(1.55, this.aspect * 1.55) }
  flatMinZoom() { return Math.max(4 * this.aspect / WIDTH, 4 / HEIGHT) }

  projectOnGlobe(event, clampToEdge = true) {
    const rect = this.host.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width * 2 - 1) * 2 * this.aspect / this.camera.zoom
    const y = (1 - (event.clientY - rect.top) / rect.height * 2) * 2 / this.camera.zoom
    const radiusSquared = x * x + y * y
    if (radiusSquared > 1 && !clampToEdge) return null
    // Once the pointer leaves the silhouette, keep the grab on the nearest rim.
    return new THREE.Vector3(x, y, Math.sqrt(Math.max(0, 1 - radiusSquared)))
      .normalize().applyQuaternion(this.camera.quaternion)
  }

  resize() {
    const width = this.host.clientWidth
    const height = this.host.clientHeight
    if (!width || !height) return
    this.aspect = width / height
    this.renderer.setSize(width, height)
    this.camera.left = -2 * this.aspect
    this.camera.right = 2 * this.aspect
    this.camera.updateProjectionMatrix()
    if (!this.animation) this.constrain()
  }

  setCountries(countries, lastCountry) {
    if (this.markers.length !== countries.length || this.markers.some((marker, i) => marker.userData.country !== countries[i])) {
      this.markers.forEach(marker => this.surfaceGroup.remove(marker))
      this.markers = countries.map(country => {
        const marker = new THREE.Mesh(this.markerGeometry, this.markerMaterials.default)
        marker.userData.country = country
        this.surfaceGroup.add(marker)
        return marker
      })
    }
    this.markers.forEach(marker => {
      const country = marker.userData.country
      marker.material = this.markerMaterials[country === lastCountry ? 'last' : country.active ? 'active' : 'default']
    })
    this.updateMarkers()
  }

  updateMarkers() {
    this.markers.forEach(marker => {
      const country = marker.userData.country
      const u = country.x / 2520
      const v = 1 - country.y / 1260
      surfacePoint(u, v, this.unfold, marker.position)
      const normal = surfacePoint(u, v, 0).multiplyScalar(1 - this.unfold)
      normal.z += this.unfold
      marker.position.addScaledVector(normal.normalize(), 0.009)
    })
  }

  updateSurface() {
    const uv = this.geometry.attributes.uv
    const position = this.geometry.attributes.position
    const point = new THREE.Vector3()
    for (let i = 0; i < uv.count; i++) {
      surfacePoint(uv.getX(i), uv.getY(i), this.unfold, point)
      position.setXYZ(i, point.x, point.y, point.z)
    }
    position.needsUpdate = true
    this.geometry.computeBoundingSphere()
    this.updateMarkers()
  }

  animateTo(direction, target, zoom, unfold, switching, done) {
    const startDirection = this.camera.position.clone().sub(this.controls.target).normalize()
    this.animation = {
      start: performance.now(), duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : switching ? 1200 : 650,
      startDirection,
      rotation: new THREE.Quaternion().setFromUnitVectors(startDirection, direction.clone().normalize()),
      startTarget: this.controls.target.clone(), target,
      startZoom: this.camera.zoom, zoom,
      startOrientation: this.surfaceGroup.quaternion.clone(),
      startUnfold: this.unfold, unfold, switching, done
    }
    this.controls.enabled = !switching
  }

  setMode(mode, done) {
    this.pointers.clear()
    this.mode = mode
    this.animateTo(FRONT, new THREE.Vector3(), mode === 'map' ? this.flatMinZoom() : this.globeZoom(), mode === 'map' ? 1 : 0, true, done)
  }

  focus(country) {
    if (this.animation?.switching) {
      this.pendingFocus = country
      return
    }
    const point = surfacePoint(country.x / 2520, 1 - country.y / 1260, this.unfold)
    point.applyQuaternion(this.surfaceGroup.quaternion)
    this.animateTo(this.mode === 'globe' ? point : FRONT, this.mode === 'globe' ? new THREE.Vector3() : point, this.camera.zoom, this.unfold, false)
  }

  constrain() {
    const flat = this.mode === 'map'
    this.controls.enableRotate = false
    this.controls.enablePan = flat
    this.controls.mouseButtons.LEFT = flat ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE
    this.controls.touches.ONE = flat ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE
    this.controls.touches.TWO = flat ? THREE.TOUCH.DOLLY_PAN : THREE.TOUCH.DOLLY_ROTATE
    this.controls.minZoom = flat ? this.flatMinZoom() : this.globeZoom() * 0.6
    this.controls.maxZoom = Math.max(6, this.controls.minZoom * 4)
    this.camera.zoom = THREE.MathUtils.clamp(this.camera.zoom, this.controls.minZoom, this.controls.maxZoom)
    if (flat) {
      const limitX = Math.max(0, WIDTH / 2 - 2 * this.aspect / this.camera.zoom)
      const limitY = Math.max(0, HEIGHT / 2 - 2 / this.camera.zoom)
      this.controls.target.set(THREE.MathUtils.clamp(this.controls.target.x, -limitX, limitX), THREE.MathUtils.clamp(this.controls.target.y, -limitY, limitY), 0)
      this.camera.position.copy(this.controls.target).add(FRONT)
    }
    this.camera.updateProjectionMatrix()
  }

  render(time) {
    if (this.animation) {
      const animation = this.animation
      const progress = animation.duration ? Math.min(1, (time - animation.start) / animation.duration) : 1
      const t = progress * progress * (3 - 2 * progress)
      const rotation = new THREE.Quaternion().slerp(animation.rotation, t)
      this.controls.target.lerpVectors(animation.startTarget, animation.target, t)
      this.camera.position.copy(animation.startDirection).applyQuaternion(rotation).multiplyScalar(6).add(this.controls.target)
      this.camera.zoom = THREE.MathUtils.lerp(animation.startZoom, animation.zoom, t)
      this.unfold = THREE.MathUtils.lerp(animation.startUnfold, animation.unfold, t)
      if (animation.switching) this.surfaceGroup.quaternion.copy(animation.startOrientation).slerp(new THREE.Quaternion(), t)
      this.camera.lookAt(this.controls.target)
      this.camera.updateProjectionMatrix()
      if (animation.switching) this.updateSurface()
      else this.constrain()
      if (progress === 1) {
        this.animation = null
        this.controls.enabled = true
        this.constrain()
        this.controls.update()
        if (animation.done) animation.done()
        if (this.pendingFocus) {
          const country = this.pendingFocus
          this.pendingFocus = null
          this.focus(country)
        }
      }
    } else {
      this.controls.update()
      this.constrain()
    }
    const facing = this.camera.position.clone().sub(this.controls.target).normalize()
    facing.applyQuaternion(this.surfaceGroup.quaternion.clone().invert())
    this.markers.forEach(marker => {
      marker.visible = this.unfold > 0 || marker.position.dot(facing) > 0.02
    })
    this.renderer.render(this.scene, this.camera)
  }

  pick(event) {
    if (this.dragged || this.animation?.switching) return
    const rect = this.host.getBoundingClientRect()
    this.raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2), this.camera)
    // Include the surface in picking so countries on the far side stay hidden.
    const hit = this.raycaster.intersectObjects([this.surface, ...this.markers.filter(marker => marker.visible)])[0]
    if (hit?.object.userData.country) this.onSelect(hit.object.userData.country)
  }

  dispose() {
    this.disposed = true
    this.renderer.setAnimationLoop(null)
    this.renderer.domElement.removeEventListener('webglcontextlost', this.contextLost)
    this.resizeObserver.disconnect()
    this.host.removeEventListener('pointerdown', this.pointerDown)
    this.host.removeEventListener('pointermove', this.pointerMove)
    this.host.removeEventListener('pointerup', this.pointerUp)
    this.host.removeEventListener('pointercancel', this.pointerUp)
    this.host.removeEventListener('lostpointercapture', this.pointerUp)
    this.pointers.clear()
    this.host.removeEventListener('click', this.click)
    this.image.onload = null
    this.image.onerror = null
    this.textureRequest.abort()
    if (this.textureUrl) URL.revokeObjectURL(this.textureUrl)
    this.controls.dispose()
    this.geometry.dispose()
    this.material.dispose()
    this.markerGeometry.dispose()
    Object.values(this.markerMaterials).forEach(material => material.dispose())
    if (this.texture) this.texture.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
