import React from 'react'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { components } from 'react-select'

export default function (props) {
  return (
    <components.DropdownIndicator {...props}>
      <FontAwesomeIcon icon={faSearch} size='2x' />
    </components.DropdownIndicator>
  )
}
