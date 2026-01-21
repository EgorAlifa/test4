const ElementUnitStyle = {
  position: 'fixed',
  transitionProperty: 'font-size',
  transitionDuration: '1ms',
  transitionDelay: '0ms',
  color: 'transparent',
  touchAction: 'none',
  zIndex: '-999999',
  left: '-100vw',
  top: '-100vh',
  transform: 'translate(-100%, -100%)'
};

const Unit2PxMixin = {
  data: () => ({
      Unit2PxMixin: {
          units2Px: {},
          unitsElements: {},
          watchers: []
      }
  }),
  beforeDestroy() {
      const { unitsElements } = this.Unit2PxMixin;
      Object.keys(unitsElements).forEach((unit) => {
          unitsElements[unit].remove();
      });
  },
  watch: {
      'Unit2PxMixin.units2Px': {
          deep: true,
          handler() {
              const { watchers } = this.Unit2PxMixin;
              watchers.forEach((watcher) => watcher());
          }
      }
  },
  methods: {
      /**
       * @param { function } handler
       */
      addUnit2PxWatcher(handler) {
          const { watchers } = this.Unit2PxMixin;
          watchers.push(handler);
      },
      /**
       * @param { string } unit
       * @return { number }
       */
      calculateUnit2Px(unit) {
          const { units2Px } = this.Unit2PxMixin;
          const elem = this.createUnits2PxElement(unit);
          const px = parseFloat(getComputedStyle(elem).getPropertyValue('font-size')) || 0;
          this.$set(units2Px, unit, px);
          return px;
      },
      /**
       * @param { string } unit
       * @return { HTMLDivElement }
       */
      createUnits2PxElement(unit) {
          const { unitsElements } = this.Unit2PxMixin;
          if (unit in unitsElements) {
              return unitsElements[unit];
          }
          const elem = document.createElement('div');
          Object.keys(ElementUnitStyle).forEach((key) => {
              elem.style[key] = ElementUnitStyle[key];
          });
          elem.style.fontSize = `1${unit}`;
          elem.innerHTML = `${unit}`;
          const tempEl = this.$el
          this.$el.append(elem);
          unitsElements[unit] = elem;
          unitsElements[unit].ontransitionend = () => {
              this.calculateUnit2Px(unit);
          };
          return unitsElements[unit];
      },
      /**
       * @param { object }
       * @param { string } size - value with unit
       * @param { string } unit
       * @param { number } value
       * @param { object } units2px - unit sizes
       * @return { number } size in pixels
       */
      takeUnit2Px({ size = '', unit, value }, units2px = this.Unit2PxMixin.units2Px) {
          const cssVar = `${size}`.match(/--[-_0-9a-zA-Z%]+/)?.[0];
          const cssVarsSize = cssVar != null ? getComputedStyle(this.$el).getPropertyValue(cssVar) : null;
          const preparedUnit = unit ?? `${cssVarsSize ?? size}`.match(/[a-zA-Z%]+$/)?.[0] ?? 'px';
          const preparedValue = value ?? Number(`${cssVarsSize ?? size}`.replace(preparedUnit, '')) ?? 0;
          return (units2px[preparedUnit] ?? this.calculateUnit2Px(preparedUnit)) * preparedValue;
      }
  }
};

export default Unit2PxMixin;
