// ----------------------------------------
// Event listeners
// ----------------------------------------

window.addEventListener('htmx:confirm', (event) => {
  if (event.detail.question !== 'recaptcha') return

  event.preventDefault()

  if (event.detail.verb === 'get') {
    event.detail.issueRequest(true)
    return
  }

  grecaptcha
    .execute('6Lf5wCQpAAAAAKY5W-KEGDTn8gaIZ2IOezju8KCH', { action: event.target.getAttribute('action') })
    .then((token) => {
      event.target.querySelector('[name="recaptchaTokenV3"]').setAttribute('value', token)
      event.detail.issueRequest(true)
    })
})

document.addEventListener('alpine:init', () => {
  // Register alpine stores
  Alpine.store('location', { value: null })

  // Register alpine components
  Alpine.data('header', headerComponent)
  Alpine.data('pixQrCode', pixQrCodeComponent)
  Alpine.data('gallery', galleryComponent)
  Alpine.data('zoom', zoomComponent)
  Alpine.data('location', locationComponent)
  Alpine.data('storeListItem', storeListItemComponent)
  Alpine.data('calculateShipping', calculateShippingComponent)
  Alpine.data('slider', sliderComponent)
  Alpine.data('alerts', alertsComponent)
  Alpine.data('customerForm', customerFormComponent)
  Alpine.data('listbox', listboxComponent)
  Alpine.data('menu', menuComponent)
})

// ----------------------------------------
// Global functions
// ----------------------------------------

window.initMap = function () {
  //
}

window.toast = function (message) {
  Toastify({
    text: message,
    gravity: 'top',
    position: 'center',
    style: { background: '#22c55e', color: '#fff', fontSize: '0.875rem' },
  }).showToast()
}

window.celebrate = function () {
  const defaults = { startVelocity: 30, spread: 360, ticks: 60 }

  confetti({ ...defaults, origin: { x: 0.2, y: 0.1 } })
  confetti({ ...defaults, origin: { x: 0.5, y: 0.2 } })
}

// ----------------------------------------
// Alpine components
// ----------------------------------------

function headerComponent(searchOpen = false) {
  return {
    searchOpen,

    toggleSearch() {
      this.searchOpen = !this.searchOpen

      if (this.searchOpen) {
        this.$nextTick(() => {
          this.$refs.searchInput.focus()
        })
      }
    },
  }
}

function pixQrCodeComponent(orderNumber) {
  return {
    code: '',
    image: '',

    init() {
      new ClipboardJS(this.$refs.copy)

      fetch(`/checkout/pix/qrcode_copy_and_paste/${orderNumber}`)
        .then((response) => response.json())
        .then((data) => {
          this.code = data.copyAndPaste
          this.image = `data:image/svg+xml;base64,${btoa(data.qrCodeImage)}`
        })
    },
  }
}

function galleryComponent(totalImages = 0) {
  return {
    init() {
      const swiper = new Swiper(this.$refs.thumbs, {
        loop: false,
        spaceBetween: 12,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesProgress: true,
      })

      new Swiper(this.$refs.main, {
        loop: totalImages > 1,
        spaceBetween: 12,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        thumbs: {
          swiper: swiper,
        },
      })
    },
  }
}

function zoomComponent() {
  return {
    init() {
      new Zoomist(this.$el, {
        maxScale: 4,
        bounds: true,
        zoomer: true,
      })
    },
  }
}

function locationComponent() {
  return {
    init() {
      if ((!'geolocation') in navigator || this.$store.location.value) return

      this.$store.location.value = { text: 'Carregando...' }

      navigator.geolocation.getCurrentPosition((position) => {
        this.calculateAddress({ lat: position.coords.latitude, lng: position.coords.longitude }).then(
          ({ address, zipCode }) => {
            const location = {
              text: address,
              zipCode: zipCode,
              coords: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            }

            this.$store.location.value = location
          },
        )
      })
    },

    calculateAddress(location) {
      const geocoder = new google.maps.Geocoder()

      return geocoder.geocode({ location }).then((response) => {
        const { short_name: address } = response.results[0].address_components.find((component) =>
          component.types.includes('administrative_area_level_2'),
        )

        const { short_name: zipCode } = response.results[0].address_components.find((component) =>
          component.types.includes('postal_code'),
        )

        return { address, zipCode }
      })
    },
  }
}

function storeListItemComponent(storeId, coords) {
  return {
    location: this.$store.location,
    distance: this.$persist(null).as(`distance-${storeId}`),

    init() {
      this.$watch('location', (location) => {
        if (location.value.coords && !this.distance) {
          this.calculateDistance(location.value)
        }
      })
    },

    calculateDistance(location) {
      const service = new google.maps.DistanceMatrixService()
      const request = {
        origins: [coords],
        destinations: [location.coords],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      }

      service.getDistanceMatrix(request).then((response) => {
        const distance = response.rows?.[0].elements?.[0].distance?.text

        if (distance) {
          this.distance = distance
        }
      })
    },
  }
}

function calculateShippingComponent() {
  return {
    zipCode: '',

    get isValid() {
      return this.zipCode.length === 9
    },
  }
}

function sliderComponent(options) {
  return {
    swiper: null,

    init() {
      this.swiper = new Swiper(this.$el, {
        ...options,
        spaceBetween: 0,
        pagination: {
          el: this.$refs.pagination,
        },
        navigation: {
          nextEl: this.$refs.next,
          prevEl: this.$refs.prev,
        },
      })
    },

    destroy() {
      this.swiper?.destroy()
    },
  }
}

function alertsComponent(alerts = []) {
  return {
    alerts,

    init() {
      for (const alert of this.alerts) {
        Toastify({
          text: alert.message,
          gravity: 'top',
          position: 'center',
          style: { background: alert.type === 'error' ? '#ef4444' : '#22c55e', color: '#fff', fontSize: '0.875rem' },
        }).showToast()
      }
    },
  }
}

function customerFormComponent() {
  return {
    form: {
      personal: {
        name: '',
        cpf: '',
        gender: '',
        primaryPhone: '',
        dateOfBirthText: '',
        dateOfBirth: {
          day: '',
          month: '',
          year: '',
        },
      },
      address: {
        postcode: '',
        state: '',
        city: '',
        district: '',
        street: '',
        number: '',
        complement: '',
      },
      access: {
        email: '',
        password: '',
        password_confirmation: '',
      },
    },
    rules: {
      personal: {
        'form.personal.name': 'required',
        'form.personal.cpf': 'required',
        'form.personal.gender': 'required',
        'form.personal.dateOfBirthText': 'required',
      },
      address: {
        'form.address.postcode': 'required',
        'form.address.state': 'required',
        'form.address.city': 'required',
        'form.address.district': 'required',
        'form.address.street': 'required',
        'form.address.number': 'required',
      },
      access: {
        'form.access.email': 'required|email',
        'form.access.password': 'required',
        'form.access.password_confirmation': 'required|same:form.access.password',
      },
    },
    init() {
      this.$watch('form.address.postcode', () => this.searchPostalCode())
      this.$watch('form.personal.dateOfBirthText', () => this.parseDateOfBirth())

      this.$nextTick(() => {
        if (
          this.form.personal.dateOfBirth.day &&
          this.form.personal.dateOfBirth.month &&
          this.form.personal.dateOfBirth.year
        ) {
          this.form.personal.dateOfBirthText = `${this.form.personal.dateOfBirth.day}/${this.form.personal.dateOfBirth.month}/${this.form.personal.dateOfBirth.year}`
        }
      })
    },
    searchPostalCode() {
      const postcode = this.form.address.postcode.replace(/\D/g, '')
      if (postcode.length !== 8) return

      fetch(`https://viacep.com.br/ws/${postcode}/json/`)
        .then((response) => response.json())
        .then((data) => {
          if (data.erro) return

          this.form.address.state = this.form.address.state ?? data.uf
          this.form.address.city = this.form.address.city ?? data.localidade
          this.form.address.district = this.form.address.district ?? data.bairro
          this.form.address.street = this.form.address.street ?? data.logradouro
        })
    },
    parseDateOfBirth() {
      const date = this.form.personal.dateOfBirthText.split('/')
      if (date.length !== 3) return

      this.form.personal.dateOfBirth.day = date[0]
      this.form.personal.dateOfBirth.month = date[1]
      this.form.personal.dateOfBirth.year = date[2]
    },
  }
}

function listboxComponent(options) {
  let modelName = options.modelName || 'selected'
  let pointer = useTrackedPointer()

  return {
    init() {
      this.optionCount = this.$refs.listbox.children.length
      this.$watch('activeIndex', () => {
        if (!this.open) return

        if (this.activeIndex === null) {
          this.activeDescendant = ''
          return
        }

        this.activeDescendant = this.$refs.listbox.children[this.activeIndex].id
      })
    },
    activeDescendant: null,
    optionCount: null,
    open: false,
    activeIndex: null,
    selectedIndex: 0,
    get active() {
      return this.items[this.activeIndex]
    },
    get [modelName]() {
      return this.items[this.selectedIndex]
    },
    choose(option) {
      this.selectedIndex = option
      this.open = false
    },
    onButtonClick() {
      if (this.open) return
      this.activeIndex = this.selectedIndex
      this.open = true
      this.$nextTick(() => {
        this.$refs.listbox.focus()
        this.$refs.listbox.children[this.activeIndex].scrollIntoView({ block: 'nearest' })
      })
    },
    onOptionSelect() {
      if (this.activeIndex !== null) {
        this.selectedIndex = this.activeIndex
      }
      this.open = false
      this.$refs.button.focus()
    },
    onEscape() {
      this.open = false
      this.$refs.button.focus()
    },
    onArrowUp() {
      this.activeIndex = this.activeIndex - 1 < 0 ? this.optionCount - 1 : this.activeIndex - 1
      this.$refs.listbox.children[this.activeIndex].scrollIntoView({ block: 'nearest' })
    },
    onArrowDown() {
      this.activeIndex = this.activeIndex + 1 > this.optionCount - 1 ? 0 : this.activeIndex + 1
      this.$refs.listbox.children[this.activeIndex].scrollIntoView({ block: 'nearest' })
    },
    onMouseEnter(evt) {
      pointer.update(evt)
    },
    onMouseMove(evt, newIndex) {
      // Only highlight when the cursor has moved
      // Pressing arrow keys can otherwise scroll the container and override the selected item
      if (!pointer.wasMoved(evt)) return
      this.activeIndex = newIndex
    },
    onMouseLeave(evt) {
      // Only unhighlight when the cursor has moved
      // Pressing arrow keys can otherwise scroll the container and override the selected item
      if (!pointer.wasMoved(evt)) return
      this.activeIndex = null
    },
    ...options,
  }
}

function menuComponent(options = { open: false }) {
  let pointer = useTrackedPointer()

  return {
    init() {
      this.items = Array.from(this.$el.querySelectorAll('[role="menuitem"]'))
      this.$watch('open', () => {
        if (this.open) {
          this.activeIndex = -1
        }
      })
    },
    activeDescendant: null,
    activeIndex: null,
    items: null,
    open: options.open,
    focusButton() {
      this.$refs.button.focus()
    },
    onButtonClick() {
      this.open = !this.open
      if (this.open) {
        this.$nextTick(() => {
          this.$refs.menuItems.focus()
        })
      }
    },
    onButtonEnter() {
      this.open = !this.open
      if (this.open) {
        this.activeIndex = 0
        this.activeDescendant = this.items[this.activeIndex].id
        this.$nextTick(() => {
          this.$refs.menuItems.focus()
        })
      }
    },
    onArrowUp() {
      if (!this.open) {
        this.open = true
        this.activeIndex = this.items.length - 1
        this.activeDescendant = this.items[this.activeIndex].id

        return
      }

      if (this.activeIndex === 0) {
        return
      }

      this.activeIndex = this.activeIndex === -1 ? this.items.length - 1 : this.activeIndex - 1
      this.activeDescendant = this.items[this.activeIndex].id
    },
    onArrowDown() {
      if (!this.open) {
        this.open = true
        this.activeIndex = 0
        this.activeDescendant = this.items[this.activeIndex].id

        return
      }

      if (this.activeIndex === this.items.length - 1) {
        return
      }

      this.activeIndex = this.activeIndex + 1
      this.activeDescendant = this.items[this.activeIndex].id
    },
    onClickAway($event) {
      if (this.open) {
        const focusableSelector = [
          '[contentEditable=true]',
          '[tabindex]',
          'a[href]',
          'area[href]',
          'button:not([disabled])',
          'iframe',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
        ]
          .map((selector) => `${selector}:not([tabindex='-1'])`)
          .join(',')

        this.open = false

        if (!$event.target.closest(focusableSelector)) {
          this.focusButton()
        }
      }
    },

    onMouseEnter(evt) {
      pointer.update(evt)
    },
    onMouseMove(evt, newIndex) {
      // Only highlight when the cursor has moved
      // Pressing arrow keys can otherwise scroll the container and override the selected item
      if (!pointer.wasMoved(evt)) return
      this.activeIndex = newIndex
    },
    onMouseLeave(evt) {
      // Only unhighlight when the cursor has moved
      // Pressing arrow keys can otherwise scroll the container and override the selected item
      if (!pointer.wasMoved(evt)) return
      this.activeIndex = -1
    },
  }
}

// ----------------------------------------
// Helpers
// ----------------------------------------

function useTrackedPointer() {
  let lastPos = [-1, -1]

  return {
    wasMoved(evt) {
      let newPos = [evt.screenX, evt.screenY]

      if (lastPos[0] === newPos[0] && lastPos[1] === newPos[1]) {
        return false
      }

      lastPos = newPos
      return true
    },

    update(evt) {
      lastPos = [evt.screenX, evt.screenY]
    },
  }
}
