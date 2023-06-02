document.addEventListener('dock-ready', () => {
  addMenuButton()
  addCSS()
})

if (!document.getElementById('dock-script')) {
  let script = document.createElement('script')
  script.id = 'dock-script'
  script.src = typeof DEV !== 'undefined' ? 'http://127.0.0.1:5501/FlyWire-Dock/Dock.js' : 'https://chrisraven.github.io/FlyWire-Dock/Dock.js'
  document.head.appendChild(script)
}


let filteringSettings = {}
let filtersVisible = false
let checkedCounter = 0
let correctCounter = 0
let correctIds = []

function addMenuButton() {
  let settings = Dock.ls.get('utilities-filtering', true)
  if (settings) {
    filteringSettings = settings
  }
  else {
    filteringSettings = filteringSettings_borders
  }

  const undoButton = document.getElementById('neuroglancer-undo-button')
  const setFilters = document.createElement('div')
  setFilters.id = 'kk-filtering-set-filters'
  setFilters.textContent = 'Filters'
  undoButton.before(setFilters)

  setFilters.addEventListener('click', () => {
    if (!filtersVisible) {
      addFiltering_showSettings()
    }
    else {
      addFiltering_hideSettings()
    }
    filtersVisible = !filtersVisible
  })
}

function addFiltering_hideSettings() {
  document.getElementById('kk-filtering-settings').style.display = 'none'
  document.querySelectorAll('.filtering-border-line').forEach(line => {
    line.style.display = 'none'
  })
}


function addFiltering_createControls() {
  const html = /*html*/`
  <div id="kk-filtering-settings">
  
    <div id="kk-filtering-planes">
      <span>choose plane</span>
      <button id="kk-filtering-settings-x-button" class="coords-button" data-type="x">X</button>
      <button id="kk-filtering-settings-y-button" class="coords-button" data-type="y">Y</button>
      <button id="kk-filtering-settings-z-button" class="coords-button" data-type="z">Z</button>
    </div>
    <div id="kk-filtering-settings-button-wrapper">
      <button id="kk-filtering-settings-button">settings</button>
    </div>
    
    <div id="kk-filtering-header-preload" class="kk-filtering-header">PRELOAD</div>
    <div id="kk-filtering-counters-wrapper" title="total / processed / passed">
      <span id="kk-filtering-input-counter">0</span> /
      <span id="kk-filtering-output-counter">0</span> /
      <span id="kk-filtering-output-counter-2">0</span>
    </div>
    <br />

    <textarea id="kk-filtering-input" placeholder="input"></textarea>
    <textarea id="kk-filtering-output" placeholder="output"></textarea>

    <div class="kk-filtering-sliders-group">
      <div class="kk-filtering-slider-container">
        <label for="kk-filtering-min-preload-slider">min</label>
        <input type="range" id="kk-filtering-min-preload-slider" class="filtering-slider" />
      </div>
      <div class="kk-filtering-slider-container">
        <label for="kk-filtering-max-preload-slider">max</label>
        <input type="range" id="kk-filtering-max-preload-slider" class="filtering-slider" />
      </div>
    </div>

    <div class="kk-filtering-button-group">
      <span>filter</span>
      <button id="kk-filtering-check">lines+dust</button>
      <button id="kk-filtering-check-dust-only">dust</button>
      <button id="kk-filtering-copy">copy</button>
      <button id="kk-filtering-clear">clear</button>
    </div>

    <div class="kk-filtering-header">POSTLOAD</div>

    <div class="kk-filtering-sliders-group">
      <div class="kk-filtering-slider-container">
        <label for="kk-filtering-min-postload-slider">min</label>
        <input type="range" id="kk-filtering-min-postload-slider" class="filtering-slider" />
      </div>
      <div class="kk-filtering-slider-container">
        <label for="kk-filtering-max-postload-slider">max</label>
        <input type="range" id="kk-filtering-max-postload-slider" class="filtering-slider" />
      </div>
    </div>
    <div class="kk-filtering-button-group">
      <span>remove</span>
      <button id="kk-filtering-post-filter">by lines</button>
      <button id="kk-filtering-filter-by-size-smaller">smaller</button>
      <button id="kk-filtering-filter-by-size-larger">larger</button>
      <button id="kk-filtering-filter-lamina" class="kk-disabled-button">by planes</button>
    </div>
  </div>
`

  document.body.insertAdjacentHTML('beforeend', html)

  const lineMin = document.createElement('div')
  lineMin.id = 'min-preload'
  lineMin.classList.add('filtering-border-line')
  document.body.appendChild(lineMin)

  const lineMax = document.createElement('div')
  lineMax.id = 'max-preload'
  lineMax.classList.add('filtering-border-line')
  document.body.appendChild(lineMax)

  linePostMin = document.createElement('div')
  linePostMin.id = 'min-postload'
  linePostMin.classList.add('filtering-border-line')
  document.body.appendChild(linePostMin)

  const linePostMax = document.createElement('div')
  linePostMax.id = 'max-postload'
  linePostMax.classList.add('filtering-border-line')
  document.body.appendChild(linePostMax)

  return [lineMin, lineMax, linePostMin, linePostMax]
}

function addFiltering_showSettings() {
  let current = 'x'
  let lineMin, lineMax, linePostMin, linePostMax
  let lines = []

  if (!document.getElementById('kk-filtering-settings')) {
    lines = addFiltering_createControls()
  }
  else {
    document.getElementById('kk-filtering-settings').style.display = 'block'
    lines = document.querySelectorAll('.filtering-border-line')
    lines.forEach(line => line.style.display = 'block')
  }

  const min = document.getElementById('kk-filtering-min-preload-slider')
  const max = document.getElementById('kk-filtering-max-preload-slider')

  const postMin = document.getElementById('kk-filtering-min-postload-slider')
  const postMax = document.getElementById('kk-filtering-max-postload-slider')

  const x = document.getElementById('kk-filtering-settings-x-button')
  const y = document.getElementById('kk-filtering-settings-y-button')
  const z = document.getElementById('kk-filtering-settings-z-button')

  const main = globalThis.getComputedStyle(document.querySelector('.neuroglancer-rendered-data-panel'))
  const mainWidth = parseInt(main.width, 10)

  let multiplier = 1

  function setLine(type) {
    let target

    switch (type) {
      case 'kk-filtering-min-preload-slider':
        target = lines[0]
      break
      case 'kk-filtering-max-preload-slider':
        target = lines[1]
      break
      case 'kk-filtering-min-postload-slider':
        target = lines[2]
      break
      case 'kk-filtering-max-postload-slider':
        target = lines[3]
      break
    }

    // source: ChatGPT
    const slider = document.getElementById(type)
    let val = (slider.value - slider.min) * (mainWidth - 0) / (slider.max - slider.min) + 0;
    val = (current === 'z' ? mainWidth * 0.306 : 0) + val * (current === 'z' ? 0.387 : 1) + 'px'
    target.style.left = val
  }

  function setControls() {
    min.min = filteringSettings_borders[current].min
    min.max = filteringSettings_borders[current].max

    max.min = filteringSettings_borders[current].min
    max.max = filteringSettings_borders[current].max

    min.value = filteringSettings[current].min
    max.value = filteringSettings[current].max

    min.step = filteringSettings_borders[current].step
    max.step = filteringSettings_borders[current].step

    multiplier = mainWidth / filteringSettings_borders[current].max

    postMin.min = filteringSettings_borders[current].postMin
    postMin.max = filteringSettings_borders[current].postMax

    postMax.min = filteringSettings_borders[current].postMin
    postMax.max = filteringSettings_borders[current].postMax

    postMin.value = filteringSettings[current].postMin
    postMax.value = filteringSettings[current].postMax

    postMin.step = 1
    postMax.step = 1

    document.getElementsByClassName('filtering-slider').forEach(el => setLine(el.id))
  }

  function setPlane() {
    const plane = filteringSettings_planes[current]
    viewer.perspectiveNavigationState.zoomFactor.value = plane.zoom
    viewer.perspectiveNavigationState.pose.orientation.orientation = new Float32Array(plane.orientation)
    viewer.perspectiveNavigationState.pose.position.spatialCoordinates = new Float32Array(plane.position)

    viewer.perspectiveNavigationState.pose.orientation.changed.dispatch()
    viewer.perspectiveNavigationState.pose.position.changed.dispatch()
  }

  setControls()
  setPlane()

  document.getElementById('kk-filtering-settings').addEventListener('click', e => {
    if (!e.target.classList.contains('coords-button')) return
    current = e.target.dataset.type

    setControls()
    setPlane()
  })

  min.addEventListener('input', e => {
    filteringSettings[current].min = e.target.value
    setLine(e.target.id)
  })

  max.addEventListener('input', e => {
    filteringSettings[current].max = e.target.value
    setLine(e.target.id)
  })

  postMin.addEventListener('input', e => {
    filteringSettings[current].postMin = e.target.value
    setLine(e.target.id)
  })

  postMax.addEventListener('input', e => {
    filteringSettings[current].postMax = e.target.value
    setLine(e.target.id)
  })

  document.getElementById('kk-filtering-settings')?.addEventListener('change', e => {
    if (!e.target.classList.contains('filtering-slider')) return

    Dock.ls.set('utilities-filtering', filteringSettings, true)
  })


  document.getElementById('kk-filtering-check').addEventListener('click', () => {
    checkingListener()
  })

  document.getElementById('kk-filtering-check-dust-only').addEventListener('click', () => {
    checkingListener(true)
  })


  function getIds() {
    let ids = document.getElementById('kk-filtering-input').value
    return ids.split(/[ ,\n]+/).map(str => BigInt(str)).filter(num => num !== BigInt(0)) // source: ChatGPT
  }


  function checkingListener(dustOnly = false) {
    document.getElementById('kk-filtering-output').value = ''
    let ids = getIds()
    urls = ids
    processUrls(dustOnly)

    document.getElementById('kk-filtering-input-counter').textContent = ids.length + ' / '
    document.getElementById('kk-filtering-output-counter').textContent = '0 / 0'
    checkedCounter = 0
    correctCounter = 0
  }

  document.getElementById('kk-filtering-clear').addEventListener('click', () => {
    document.getElementById('kk-filtering-input-counter').textContent = '0 / '
    document.getElementById('kk-filtering-output-counter').textContent = '0 / 0'
    document.getElementById('kk-filtering-input').value = ''
    document.getElementById('kk-filtering-output').value = ''
    correctIds = []
  })
 
  let filteringActive = false
  let filteringHandler
  document.getElementById('kk-filtering-post-filter').addEventListener('click', e => {
    let voxelSize = Dock.getVoxelSize()
    const [ vx, vy, vz ]  = voxelSize
    let {
      x: {
        postMin: xmin,
        postMax: xmax
      },
      y: {
        postMin: ymin,
        postMax: ymax
      },
      z: {
        postMin: zmin,
        postMax: zmax
      }
    } = filteringSettings
    xmin *= 4
    xmax *= 4
    ymin *= 4
    ymax *= 4
    zmin = parseInt(zmin, 10)
    zmax = parseInt(zmax, 10)

    let x, y, z
    let fragmentId, positions, l, i
    const segsToRemove = []

    if (!filteringActive) {
      filterByDimensions()
      filteringHandler = setInterval(filterByDimensions, 2000)
      e.target.textContent = 'Stop filtering'
    }
    else {
      clearInterval(filteringHandler)
      e.target.textContent = 'Start filtering'
    }
    filteringActive = !filteringActive
    function filterByDimensions() {
      for (const [mapKey, el] of viewer.chunkManager.memoize.map) {
        if (!el.fragmentSource) continue

        for (const [key, chunk] of el.fragmentSource.chunks) {
          fragmentId = key.split(':')[0]
          if (parseInt(fragmentId, 10) < 1000) continue

          positions = chunk.meshData.vertexPositions
          l = positions.length
          // every 100th vertex should be a good enough approximation
          for (i = 0; i < l; i += 300) {
            x = positions[i] / vx
            y = positions[i + 1] / vy
            z = positions[i + 2] / vz
            if (x < xmin || x > xmax ||
                y < ymin || y > ymax ||
                z < zmin || z > zmax) {
              segsToRemove.push(fragmentId)
              break
            }
          }
        }
      }
      const toRemove = new Set()
      const chunkToSegMap = Dock.generateChunkToSegMap()

      segsToRemove.forEach(el => {
        toRemove.add(chunkToSegMap.get(el))
      })
      
      toRemove.forEach(id => {
        document.querySelector(`button[data-seg-id="${id}"]`)?.click()
      })
    }
  })

  function filterBySize(direction) {
    const minimalSize = 50000
    const maximalSize = 300000
    let voxelSize = Dock.getVoxelSize()
    const [ vx, vy, vz ]  = voxelSize
    const sizes = []
    const totalSizes = []

    for (const [mapKey, el] of viewer.chunkManager.memoize.map) {
      if (!el.fragmentSource) continue

      let len = 0

        for (const [key, chunk] of el.fragmentSource.chunks) {
          fragmentId = key.split(':')[0]
          if (parseInt(fragmentId, 10) < 1000) continue

          positions = chunk.meshData.vertexPositions
          sizes[fragmentId] = positions.length
        }
    }

    const chunkToSeg = Dock.generateChunkToSegMap()

    for (const chunkId in sizes) {
      const segId = chunkToSeg.get(chunkId)
      if (totalSizes.hasOwnProperty(segId)) {
        totalSizes[segId] += sizes[chunkId]
      }
      else {
        totalSizes[segId] = sizes[chunkId]
      }
    }

    if (direction === '<') {
      for (const segId in totalSizes) {
        const size = totalSizes[segId]
        if (size < minimalSize) {
          document.querySelector(`button[data-seg-id="${segId}"]`)?.click()
        }
      }
    }
    else {
      for (const segId in totalSizes) {
        const size = totalSizes[segId]
        if (size > maximalSize) {
          document.querySelector(`button[data-seg-id="${segId}"]`)?.click()
        }
      }
    }
  }

/*
  function filterOutLamina() {
    function calculateNormal(A, B, C) {
      const vectorAB = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
      const vectorAC = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
      const normal = [  vectorAB[1] * vectorAC[2] - vectorAB[2] * vectorAC[1],
        vectorAB[2] * vectorAC[0] - vectorAB[0] * vectorAC[2],
        vectorAB[0] * vectorAC[1] - vectorAB[1] * vectorAC[0]
      ];

      return normal
    }

    function calculateD(normal, A) {
      return -(normal[0] * A[0] + normal[1] * A[1] + normal[2] * A[2]);
    }

    // lamina 1
    const A1 = [209772, 74213, 2920];
    const B1 = [203071, 51315, 3280];
    const C1 = [210430, 52093, 4008];
    const normal1 = calculateNormal(A1, B1, C1)
    D1 = calculateD(normal1, A1)

    // lamina 2
    const A2 = [209772, 74213, 2920];
    const B2 = [198506, 89349, 2568];
    const C2 = [210959, 91176, 3665];
    const normal2 = calculateNormal(A2, B2, C2)
    D2 = calculateD(normal2, A2)

    // central brain
    const A3 = [165598, 69509, 3009];
    const B3 = [164263, 53740, 3761];
    const C3 = [175567, 67391, 1584];
    const normal3 = calculateNormal(A3, B3, C3)
    D3 = calculateD(normal3, A3)
    
    const A4 = [170406, 78958, 3777];
    const B4 = [187066, 72011, 5528];
    const C4 = [184403, 48365, 4959];
    const normal4 = calculateNormal(A4, B4, C4)
    D4 = calculateD(normal4, A4)

    const [ vx, vy, vz ] = Dock.getVoxelSize()
    const inversedVx = 1 / vx
    const inversedVy = 1 / vy
    const inversedVz = 1 / vz
    let x, y, z
    const segsToRemove = []
    
    for (const [mapKey, el] of viewer.chunkManager.memoize.map) {
      if (!el.fragmentSource) continue
      
      for (const [key, chunk] of el.fragmentSource.chunks) {
        fragmentId = key.split(':')[0]
        if (parseInt(fragmentId, 10) < 1000) continue
        positions = chunk.meshData.vertexPositions
        l = positions.length
        // we take every 100th vertex. Since there aren't any large triangles in the dataset, it should be safe to assume,
        // that every 100th vertex is close enough to the ones in its neighbourhood, to skip the ones inbetween
        for (i = 0; i < l; i += 300) {
          x = positions[i] * inversedVx
          y = positions[i + 1] * inversedVy
          z = positions[i + 2] * inversedVz

          if (normal1[0] * x + normal1[1] * y + normal1[2] * z + D1 < 0) {
            segsToRemove.push(fragmentId)
            break
          }

          if (normal2[0] * x + normal2[1] * y + normal2[2] * z + D2 > 0) {
            segsToRemove.push(fragmentId)
            break
          }

          if (normal3[0] * x + normal3[1] * y + normal3[2] * z + D3 < 0) {
            segsToRemove.push(fragmentId)
            break
          }

          if (normal4[0] * x + normal4[1] * y + normal4[2] * z + D4 < 0) {
            segsToRemove.push(fragmentId)
            break
          }
        }
      }
      
    }
    const toRemove = new Set()
    const chunkToSegMap = Dock.generateChunkToSegMap()

    segsToRemove.forEach(el => {
      toRemove.add(chunkToSegMap.get(el))
    })
    
    toRemove.forEach(id => {
      document.querySelector(`button[data-seg-id="${id}"]`)?.click()
    })
  }
  

  function filterOutLamina_old() {
    const [ vx, vy, vz ] = Dock.getVoxelSize()
    const inversedVx = 1 / vx
    const inversedVz = 1 / vz
    let x, z
    const slope = 10
    const inversedSlope = 1/slope
    const inversedVxMulInvSlope = inversedVx * inversedSlope
    const segsToRemove = []
    const b = -182000 / slope // b parameter of the 45deg line/x-z plane separating lamina from the rest of the left lobe
    
    for (const [mapKey, el] of viewer.chunkManager.memoize.map) {
      if (!el.fragmentSource) continue

      
      for (const [key, chunk] of el.fragmentSource.chunks) {
        fragmentId = key.split(':')[0]
        if (parseInt(fragmentId, 10) < 1000) continue
        positions = chunk.meshData.vertexPositions
        l = positions.length
        // we take every 100th vertex. Since there aren't any large triangles in the dataset, it should be safe to assume,
        // that every 100th vertex is close enough to the ones in its neighbourhood, to skip the ones inbetween
        for (i = 0; i < l; i += 300) {
          x = positions[i] * inversedVxMulInvSlope
          z = positions[i + 2] * inversedVz
          if (z < x + b) {
            segsToRemove.push(fragmentId)
            break
          }
        }
      }
      
    }
    const toRemove = new Set()
    const chunkToSegMap = Dock.generateChunkToSegMap()

    segsToRemove.forEach(el => {
      toRemove.add(chunkToSegMap.get(el))
    })
    
    toRemove.forEach(id => {
      document.querySelector(`button[data-seg-id="${id}"]`)?.click()
    })
  }

*/
  document.getElementById('kk-filtering-filter-by-size-smaller').addEventListener('click', e => {
    filterBySize('<')
  })

  document.getElementById('kk-filtering-filter-by-size-larger').addEventListener('click', e => {
    filterBySize('>')
  })
/*
  document.getElementById('kk-filtering-filter-lamina').addEventListener('click', e => {
    filterOutLamina()
  })
  */
}


const MAX_CONNECTIONS = 50
const MAX_RETRIES = 10

let urls = []
const results = new Set()
const failedIds = new Set()

let processedIds = 0


const fetchUrl = async (id) => {
  try {
  const authToken = localStorage.getItem('auth_token')
  const url = `https://prodv1.flywire-daf.com/meshing/api/v1/table/fly_v31/manifest/${id}:0?verify=1&prepend_seg_ids=1&middle_auth_token=${authToken}`

    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Failed to fetch URL: ${url}, Status: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Failed to fetch URL: ${url}, Error: ${error}`);
  }
};


const processUrls = async (dustOnly = false) => {
  const fetchQueue = urls.slice(); // Create a copy of the URLs array
  const activeFetches = new Set(); // Set to store active fetch Promises

  while (fetchQueue.length > 0 || activeFetches.size > 0) {
    while (activeFetches.size < MAX_CONNECTIONS && fetchQueue.length > 0) {
      const id = fetchQueue.shift();
      const fetchPromise = fetchUrl(id)
        .then(result => {
          if (result) {
            if (filteringSettings_check(id, result, dustOnly)) {
              document.getElementById('kk-filtering-output').value += '\r\n' + id
            }
          }
        })
        .catch(error => {
          if (id.retryCount === undefined) {
            id.retryCount = 0;
          }
          if (id.retryCount < MAX_RETRIES) {
            id.retryCount++;
            fetchQueue.push(id);
          } else {
            console.error(`Failed to fetch URL: ${id}, Maximum retries reached`);
            failedIds.add(id);
          }
        })
        .finally(() => {
          activeFetches.delete(fetchPromise);
          processedIds++;
        });

      activeFetches.add(fetchPromise);
    }

    // Wait for any active fetches to complete before adding new fetches
    await Promise.race(activeFetches);
  }

  const failed = Array.from(failedIds)
  Dock.dialog({
    id: 'kk-filtering-show-failed-urls',
    html: failed.length ? `Failed URLs: ${failed}` : 'Finished without fails',
    okLabel: failed.length ? 'Copy URLs to clipboard' : 'Close',
    okCallback: () => {
      if (failed.length) {
        navigator.clipboard.writeText(failed.join('\r\n')).then(() => {
          failed = []
          failedIds = []
        })
      }
    },
    destroyAfterClosing: true
  }).show()
};


function filteringSettings_check(id, result, dustOnly = false) {
  const maxDustSize = 3
  const maxSegmentSize = 100
  checkedCounter++

  if (!result.fragments) return

  let correct = true
  // dust
  if (result.fragments.length < maxDustSize || result.fragments.length > maxSegmentSize) {
    correct = false
  }
  else if (!dustOnly) {
    result.fragments.forEach(frag => {
      const coordsString = frag.split(':')[2]
      const [x, y, z] = coordsString.split('_')
      const [xmin, xmax] = x.split('-').map(el => parseInt(el, 10))
      const [ymin, ymax] = y.split('-').map(el => parseInt(el, 10))
      const [zmin, zmax] = z.split('-').map(el => parseInt(el, 10))

      const bounds = filteringSettings
      if (xmax < bounds.x.min || xmin > bounds.x.max ||
          ymax < bounds.y.min || ymin > bounds.y.max ||
          zmax < bounds.z.min || zmin > bounds.z.max) {
        correct = false
      }
    })
  }

  if (correct) {
    correctCounter++
    correctIds.push(id)
  }

  document.getElementById('kk-filtering-output-counter').textContent = `${checkedCounter} / ${correctCounter}`

  return correct
}
