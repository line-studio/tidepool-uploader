import React, { useState } from 'react'
import { ipcRenderer } from 'electron'
import Select from 'react-select/async'
import CustomDropdownIndicator from './CustomDropdownIndicator'
import _ from 'lodash'
import reactSelectStyles from '../constants/reactSelectStyles'
import CustomOptionLVPatientSelect from './CustomOptionLVPatientSelect'
import CustomSingleValueLVPatientSelect from './CustomSingleValueLVPatientSelect'

const styles = require('../../styles/components/LibreViewPatientSelect.module.less')

export default function LibreViewPatientSelect (props) {
  const [patients, setPatients] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  function handleOnChange (patient) {
    props.onPatientSelect(patient)
  }

  async function getPatients (text) {
    if (!text) {
      return []
    }

    setIsLoading(true)

    const results = await ipcRenderer.invoke('search-libreview', {
      term: text
    })

    setPatients(results)
    setIsLoading(false)

    return results
  }

  function renderSelector () {
    return (
      <Select
        name={'libreViewPatientSelect'}
        placeholder={'Search'}
        className={styles.Select}
        loadOptions={getPatients}
        defaultOptions={patients}
        getOptionValue={option => option.id}
        isLoading={isLoading}
        styles={reactSelectStyles}
        components={{
          Option: CustomOptionLVPatientSelect,
          SingleValue: CustomSingleValueLVPatientSelect,
          DropdownIndicator: CustomDropdownIndicator
        }}
        onChange={handleOnChange}
      />
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.wrapInner}>
        <div className={styles.headerWrap}>
          <div className={styles.header}>{props.targetUser.fullName}</div>
          <div className={styles.header}>123456-7890</div>
        </div>
        <p>
          Search for patient (name or CPR) in the LibreView database. After
          matching the patient's Tidepool and LibreView account, the patient
          will be able to upload data themselves, using this application.
        </p>
        <div className={styles.libreViewPatientDropdown}>
          {renderSelector()}
        </div>
      </div>
    </div>
  )
}
