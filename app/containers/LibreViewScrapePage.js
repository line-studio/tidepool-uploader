/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014-2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import actions from '../actions/'
import React, { Component } from 'react'
import { pages } from '../constants/otherConstants'
import { ipcRenderer } from 'electron'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare, faSpinner } from '@fortawesome/free-solid-svg-icons'

const styles = require('../../styles/containers/LibreViewScrapePage.module.less')

const asyncActions = actions.async
const syncActions = actions.sync

class LibreViewPatientSelectPage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      captchaSolved: false
    }

    const { libreViewTargetPatient, loggedInUser, uploadTargetUser } = props

    props.sync.setDoneScraping(false)

    ipcRenderer.send('scrape-libreview', {
      patientId: libreViewTargetPatient.id,
      loggedInUserId: loggedInUser,
      uploadTargetUserId: uploadTargetUser
    })

    ipcRenderer.on('scrape-results-libreview', (e, { data }) => {
      props.async.uploadScrapedData(data)
      this.setState({
        captchaSolved: this.state.captchaSolved
      })
    })

    ipcRenderer.on('captcha-solved', (e, args) => {
      this.setState({
        doneScraping: this.state.doneScraping,
        captchaSolved: true
      })
    })
  }

  handleGoBack = () => {
    const { setPage } = this.props.async

    setPage(pages.LIBREVIEW_PATIENT_SELECT, null, null)
  }

  handleDoneClick = () => {
    const { setPage } = this.props.async

    setPage(pages.CLINIC_USER_SELECT, null, null)
  }

  renderLoading = () => {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} size='2x' spin />
      </div>
    )
  }

  render () {
    const { doneScraping } = this.props

    return (
      <div className={styles.mainContainer}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.header}>Libre View</h1>
          {!this.state.captchaSolved ? (
            <>
              <p>
                A new window will be opened with a ReCaptcha. Solve this, and
                your latest data from Libreview will automatically be fetched.
              </p>
              {this.renderLoading()}
            </>
          ) : !doneScraping ? (
            <p>
              Fetching data from LibreView account
              <FontAwesomeIcon
                icon={faSpinner}
                color='#596CFA'
                size='lg'
                className={styles.loadingSpinnerInline}
                spin
              />
            </p>
          ) : (
            <p>
              <FontAwesomeIcon icon={faCheckSquare} color='#00B522' size='lg' />{' '}
              Data successfully fetched from LibreView. The data can be seen by
              logging in with NemID at [not yet implemented]
            </p>
          )}
        </div>

        <div
          className={styles.buttonsContainer}
          style={{
            flexDirection: doneScraping ? 'row-reverse' : 'row'
          }}
        >
          {!doneScraping && (
            <button className={styles.backButton} onClick={this.handleGoBack}>
              Go Back
            </button>
          )}

          <button
            className={styles.doneButton}
            onClick={this.handleDoneClick}
            disabled={!doneScraping}
          >
            Done
          </button>
        </div>
      </div>
    )
  }
}

export default connect(
  state => {
    return {
      libreViewTargetPatient: state.libreViewTargetPatient,
      loggedInUser: state.loggedInUser,
      uploadTargetUser: state.uploadTargetUser,
      doneScraping: state.doneScraping
    }
  },
  dispatch => {
    return {
      async: bindActionCreators(asyncActions, dispatch),
      sync: bindActionCreators(syncActions, dispatch)
    }
  }
)(LibreViewPatientSelectPage)
