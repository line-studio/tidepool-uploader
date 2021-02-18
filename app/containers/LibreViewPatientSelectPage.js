import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import actions from '../actions/'
import { pages } from '../constants/otherConstants'
import LibreViewPatientSelect from '../components/LibreViewPatientSelect'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const styles = require('../../styles/containers/LibreViewPatientSelectPage.module.less')

const asyncActions = actions.async
const syncActions = actions.sync

class LibreViewPatientSelectPage extends Component {
  constructor (props) {
    super(props)

    if (!props.loggedInLibreView) {
      props.async.libreViewLogin()
    }
  }

  handleGoBack = () => {
    const { setPage } = this.props.async

    setPage(pages.MAIN, null, null)
  }

  handleClickNext = () => {
    const { setPage } = this.props.async

    setPage(pages.LIBREVIEW_PATIENT_DATA_SCRAPE, null, null)
  }

  handlePatientSelect = patient => {
    const { setLibreViewTargetPatient } = this.props.sync

    setLibreViewTargetPatient(patient)
  }

  renderLoading = () => {
    return (
      <div
        className={styles.loadingContainer}
      >
        <p className={styles.loadingText}>Logging in...</p>
        <FontAwesomeIcon icon={faSpinner} size='2x' spin />
      </div>
    )
  }

  render () {
    const { uploadTargetUser, allUsers, loggedInLibreView, libreViewTargetPatient } = this.props

    return (
      <div className={styles.mainContainer}>
        <div className={styles.contentWrapper}>
          {loggedInLibreView ? (
            <LibreViewPatientSelect
              targetUser={allUsers[uploadTargetUser]}
              onPatientSelect={this.handlePatientSelect}
              onClickNext={this.handleClickNext}
            />
          ) : (
            this.renderLoading()
          )}
        </div>
        <div className={styles.buttonsContainer}>
          <button className={styles.backButton} onClick={this.handleGoBack}>
            Go Back
          </button>

          <button className={styles.nextButton} onClick={this.handleClickNext} disabled={!libreViewTargetPatient}>
            Next
          </button>
        </div>
      </div>
    )
  }
}

export default connect(
  state => {
    return {
      uploadTargetUser: state.uploadTargetUser,
      allUsers: state.allUsers,
      loggedInLibreView: state.loggedInLibreView,
      libreViewTargetPatient: state.libreViewTargetPatient
    }
  },
  dispatch => {
    return {
      async: bindActionCreators(asyncActions, dispatch),
      sync: bindActionCreators(syncActions, dispatch)
    }
  }
)(LibreViewPatientSelectPage)
