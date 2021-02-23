import * as actionTypes from '../../app/constants/actionTypes'

export function libreViewTargetPatient (state = null, action) {
  switch (action.type) {
    case actionTypes.SET_LIBREVIEW_TARGET_PATIENT:
      const { patient } = action.payload
      return patient
    default:
      return state
  }
}

export function loggedInLibreView (state = null, action) {
  switch (action.type) {
    case actionTypes.SET_LOGGED_IN_LIBREVIEW:
      const { isLoggedIn } = action.payload
      return isLoggedIn
    default:
      return state
  }
}

export function doneScraping(state = null, action) {
  switch (action.type) {
    case actionTypes.SET_DONE_SCRAPING:
      const { isDoneScraping } = action.payload
      return isDoneScraping
    default:
      return state
  }
}
