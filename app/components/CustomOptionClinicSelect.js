import React from 'react'
import _ from 'lodash'
import sundial from 'sundial';
import { components } from 'react-select';

const personUtils = require('../../lib/core/personUtils');
const styles = require('../../styles/components/ClinicUserSelect.module.less');

export default function (props) {
  const { data: option } = props
  const { allUsers } = props.selectProps

  const user = _.get(allUsers, option.value)
  const name = personUtils.patientFullName(user)
  const bday = _.get(user, ['patient', 'birthday'], '')
  const mrn = _.get(user, ['patient', 'mrn'], '')

  let formattedBday

  if (bday) {
    formattedBday = sundial.translateMask(bday, 'YYYY-MM-DD', 'M/D/YYYY')
  }

  let formattedMrn
  if (mrn) {
    formattedMrn = 'MRN:' + mrn
  }

  return (
    <components.Option {...props}>
      <div className={styles.optionLabelWrapper}>
        <div className={styles.optionLabelName}>
          {name} {formattedMrn}
        </div>
        <div className={styles.optionLabelBirthday}>{formattedBday}</div>
      </div>
    </components.Option>
  )
}
