import { defineSlotRecipe } from '@pandacss/dev'

export const colorPicker = defineSlotRecipe({
  className: 'color-picker',
  slots: [
    'root',
    'control',
    'trigger',
    'label',
    'valueText',
    'indicator',
    'positioner',
    'content',
    'area',
    'areaThumb',
    'areaBackground',
    'channelSlider',
    'channelSliderTrack',
    'channelSliderLabel',
    'channelSliderValueText',
    'channelSliderThumb',
    'channelInput',
    'transparencyGrid',
    'swatchGroup',
    'swatch',
    'swatchIndicator',
    'swatchTrigger',
    'eyeDropperTrigger',
    'formatTrigger',
    'formatSelect',
    'view',
  ],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5',
    },
    label: {
      color: 'fg.default',
      fontWeight: 'medium',
      textStyle: 'sm',
    },
    control: {
      display: 'flex',
      flexDirection: 'row',
      gap: '2',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    area: {
      height: '36',
      borderRadius: 'l2',
      overflow: 'hidden',
    },
    areaThumb: {
      borderRadius: 'full',
      height: '2.5',
      width: '2.5',
      boxShadow: 'white 0px 0px 0px 2px, black 0px 0px 2px 1px',
      outline: 'none',
    },
    areaBackground: {
      height: 'full',
    },
    channelSlider: {
      borderRadius: 'l2',
    },
    channelSliderTrack: {
      height: '3',
      borderRadius: 'l2',
    },
    swatchGroup: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '2',
      background: 'gray.surface.bg',
    },
    swatch: {
      height: '6',
      width: '6',
      borderRadius: 'l2',
      boxShadow:
        '0 0 0 1px var(--colors-border-emphasized), 0 0 0 2px var(--colors-bg-default) inset',
    },
    channelSliderThumb: {
      borderRadius: 'full',
      height: '2.5',
      width: '2.5',
      boxShadow: 'white 0px 0px 0px 2px, black 0px 0px 2px 1px',
      transform: 'translate(-50%, -50%)',
      outline: 'none',
    },
    transparencyGrid: {
      borderRadius: 'l2',
    },
    channelInput: {
      borderRadius: 'l2',
      border: '1px solid',
      borderColor: 'border',
      padding: '2',
      fontSize: 'sm',
      fontWeight: 'medium',
      color: 'fg.default',
      background: 'gray.surface.bg',
      _focus: {
        borderColor: 'border.emphasized',
      },
    },
    formatSelect: {
      borderRadius: 'l2',
      border: '1px solid',
      borderColor: 'border',
      padding: '2',
      fontSize: 'sm',
      fontWeight: 'medium',
      color: 'fg.default',
      background: 'gray.surface.bg',
      _focus: {
        borderColor: 'border.emphasized',
      },
    },
    view: {
      display: 'flex',
      flexDirection: 'row',
      gap: '2'
    }
  },
})
