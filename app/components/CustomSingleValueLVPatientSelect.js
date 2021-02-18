import React from 'react'
import { components } from 'react-select'
import formatLibreViewPatientDataForSelect from '../utils/formatLibreViewPatientDataForSelect'

const styles = require('../../styles/components/LibreViewPatientSelect.module.less')

export default function (props) {
  const { data } = props

  if (!data) {
    return (
      <components.SingleValue {...props}>
        {props.children}
      </components.SingleValue>
    )
  }

  const { fullName, dob, email } = formatLibreViewPatientDataForSelect(data)

  return (
    <components.SingleValue {...props}>
      <div className={styles.optionLabelWrapper}>
        <div className={styles.optionLabelName}>{fullName}</div>
        <div className={styles.optionLabelBirthday}>{dob}</div>
      </div>
      <div>{email}</div>
    </components.SingleValue>
  )
}