export default {
  option: (base, { isSelected }) => ({
    ...base,
    ':hover': {
      backgroundColor: isSelected ? '#596CFA' : 'rgba(96, 120, 255, 0.2)',
      color: isSelected ? '#fafafa' : '#291448'
    },
    color: isSelected ? '#fafafa' : '#291448',
    backgroundColor: isSelected ? '#596CFA' : base.backgroundColor
  }),
  loadingIndicator: base => ({
    display: 'none'
  }),
  indicatorSeparator: base => ({
    display: 'none'
  }),
  singleValue: base => ({
    ...base,
    width: '95%'
  }),
  dropdownIndicator: base => ({
    ...base,
    marginLeft: '0.7em',
    padding: 0
  }),
  valueContainer: base => ({
    ...base,
    padding: '0.7em',
    paddingLeft: '0.3em'
  }),
  control: (base, { isFocused, menuIsOpen }) => ({
    ...base,
    ':hover': {
      borderColor: menuIsOpen ? '#bcbec0' : 'rgba(96, 120, 255, 0.2)'
    },
    flexDirection: 'row-reverse',
    borderWidth: '2px',
    borderRadius: 0,
    borderColor: menuIsOpen || isFocused ? '#bcbec0' : base.borderColor,
    boxShadow: 'none'
  }),
  menu: base => ({
    ...base,
    borderRadius: 0,
    border: '2px solid #bcbec0',
    marginTop: 0,
    borderTop: 'none'
  })
}
