Component({
  properties: {
    message: { type: String, value: '' },
    isAI: { type: Boolean, value: false },
    petId: { type: String, value: 'fox' },
  },
  data: {
    pets: {
      fox: { emoji: '🦊', light: '#FFF2E8', border: '#E8B58A' },
      owl: { emoji: '🦉', light: '#EEF3FA', border: '#C1D0E2' },
      dog: { emoji: '🐶', light: '#FFF4EA', border: '#E7C6A7' },
    },
    styles: {
      gentle: { light: '#EAF7F3', border: '#BFE7DA' },
      coach: { light: '#EDF3FF', border: '#C7D8F8' },
      hybrid: { light: '#FFF4E6', border: '#F1D2A8' },
    },
  },
});
